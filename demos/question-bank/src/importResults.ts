import JSZip from 'jszip';
import Papa from 'papaparse';
import type {
  GenerationRecord,
  GeometryQuestion,
  QuestionBatch,
} from './data';
import {
  QUESTION_BANK_EXPORT_FORMAT,
  QUESTION_BANK_EXPORT_VERSION,
  type QuestionBankExportManifest,
} from './exportResults';

export type ImportedBatchPackage = {
  batch: QuestionBatch;
  records: Record<string, GenerationRecord>;
  staticImages: Record<string, Blob>;
  resultCount: number;
};

type CsvRow = Record<string, string>;

export async function importQuestionBankZip(
  file: File,
): Promise<ImportedBatchPackage> {
  const zip = await JSZip.loadAsync(file);
  const manifestFile = zip.file('manifest.json');
  if (manifestFile) {
    const manifest = JSON.parse(
      await manifestFile.async('text'),
    ) as QuestionBankExportManifest;
    return importManifest(zip, manifest);
  }
  return importLegacyExport(zip, file.name);
}

async function importManifest(
  zip: JSZip,
  manifest: QuestionBankExportManifest,
): Promise<ImportedBatchPackage> {
  if (
    manifest.format !== QUESTION_BANK_EXPORT_FORMAT ||
    manifest.version !== QUESTION_BANK_EXPORT_VERSION ||
    !manifest.batch ||
    !Array.isArray(manifest.batch.questions) ||
    !Array.isArray(manifest.results)
  ) {
    throw new Error('ZIP 中的 manifest.json 不是受支持的题库导出格式。');
  }

  const batch = normalizeImportedBatch(manifest.batch);
  const questionIds = new Set(batch.questions.map((question) => question.id));
  const records: Record<string, GenerationRecord> = {};
  const staticImages: Record<string, Blob> = {};

  await Promise.all(manifest.results.map(async (result) => {
    if (!questionIds.has(result.questionId)) return;
    const record: GenerationRecord = {
      questionId: result.questionId,
      status: result.status,
      taskId: result.taskId,
      artifactUrl: result.artifactUrl,
      errorMessage: result.errorMessage,
      staticImageUrl: result.staticImageUrl,
    };

    if (result.projectFile) {
      const projectFile = zip.file(result.projectFile);
      if (!projectFile) {
        throw new Error(`ZIP 缺少工程文件：${result.projectFile}`);
      }
      record.projectJson = JSON.parse(await projectFile.async('text'));
    }
    if (result.imageFile) {
      const imageFile = zip.file(result.imageFile);
      if (!imageFile) {
        throw new Error(`ZIP 缺少图片文件：${result.imageFile}`);
      }
      staticImages[result.questionId] = await imageFile.async('blob');
    }
    records[result.questionId] = record;
  }));

  return {
    batch,
    records,
    staticImages,
    resultCount: Object.values(records).filter(
      (record) => record.status === 'finished',
    ).length,
  };
}

async function importLegacyExport(
  zip: JSZip,
  filename: string,
): Promise<ImportedBatchPackage> {
  const summaryFile = zip.file('汇总.csv');
  if (!summaryFile) {
    throw new Error('ZIP 中缺少 manifest.json 或汇总.csv，无法识别题库导出包。');
  }
  const parsed = Papa.parse<CsvRow>(
    (await summaryFile.async('text')).replace(/^\uFEFF/, ''),
    { header: true, skipEmptyLines: 'greedy' },
  );
  if (parsed.errors.length || !parsed.data.length) {
    throw new Error('ZIP 中的汇总.csv 无法解析或没有题目数据。');
  }

  const batchName =
    parsed.data[0]['批次名称']?.trim() ||
    filename.replace(/-results\.zip$/i, '').replace(/\.zip$/i, '');
  const questions: GeometryQuestion[] = [];
  const records: Record<string, GenerationRecord> = {};
  const staticImages: Record<string, Blob> = {};

  await Promise.all(parsed.data.map(async (row, index) => {
    const code = row['题目编号']?.trim();
    const questionText = row['题目文本']?.trim();
    if (!code || !questionText) {
      throw new Error(`汇总.csv 第 ${index + 2} 行缺少题目编号或题目文本。`);
    }
    const questionId = `imported-question-${slugify(code) || index + 1}`;
    questions[index] = {
      id: questionId,
      code,
      questionText,
      imageUrl: row['题目图片地址']?.trim() || undefined,
      knowledgePoints: splitKnowledgePoints(row['知识点']),
      generation: { questionId, status: 'pending' },
    };

    const record: GenerationRecord = {
      questionId,
      status: row['生成状态'] === 'finished' ? 'finished' : 'error',
      staticImageUrl: row['静态图片地址']?.trim() || undefined,
    };
    const projectPath = row['工程JSON文件']?.trim();
    if (projectPath) {
      const projectFile = zip.file(projectPath);
      if (projectFile) {
        record.projectJson = JSON.parse(await projectFile.async('text'));
      }
    }
    const imagePath = row['静态图片文件']?.trim();
    if (imagePath) {
      const imageFile = zip.file(imagePath);
      if (imageFile) {
        staticImages[questionId] = await imageFile.async('blob');
      }
    }
    records[questionId] = record;
  }));

  return {
    batch: {
      id: createImportedBatchId(batchName),
      name: batchName,
      questions,
    },
    records,
    staticImages,
    resultCount: Object.values(records).filter(
      (record) => record.status === 'finished',
    ).length,
  };
}

function normalizeImportedBatch(batch: QuestionBatch): QuestionBatch {
  if (!batch.name?.trim() || !batch.questions.length) {
    throw new Error('导出包中的题库批次为空或格式不完整。');
  }
  const ids = new Set<string>();
  const codes = new Set<string>();
  const questions = batch.questions.map((question, index) => {
    if (
      !question.id ||
      !question.code?.trim() ||
      !question.questionText?.trim() ||
      ids.has(question.id) ||
      codes.has(question.code)
    ) {
      throw new Error(`导出包中的第 ${index + 1} 道题格式有误或编号重复。`);
    }
    ids.add(question.id);
    codes.add(question.code);
    return {
      ...question,
      knowledgePoints: Array.isArray(question.knowledgePoints)
        ? question.knowledgePoints
        : [],
      generation: { questionId: question.id, status: 'pending' as const },
    };
  });
  return {
    id: createImportedBatchId(batch.name),
    name: batch.name.trim(),
    questions,
  };
}

function splitKnowledgePoints(value?: string) {
  return (value ?? '')
    .split(/[|,，、;；]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function createImportedBatchId(name: string) {
  return `custom-import-${slugify(name) || 'batch'}-${Date.now()}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
