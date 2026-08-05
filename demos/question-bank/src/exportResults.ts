import JSZip from 'jszip';
import type {
  GenerationRecord,
  GeometryQuestion,
  QuestionBatch,
} from './data';

type ExportResult = {
  exportedCount: number;
  jsonCount: number;
  imageCount: number;
};

export const QUESTION_BANK_EXPORT_FORMAT = 'dino-question-bank-export';
export const QUESTION_BANK_EXPORT_VERSION = 1;

export type QuestionBankExportManifest = {
  format: typeof QUESTION_BANK_EXPORT_FORMAT;
  version: typeof QUESTION_BANK_EXPORT_VERSION;
  exportedAt: string;
  batch: QuestionBatch;
  results: Array<{
    questionId: string;
    status: GenerationRecord['status'];
    taskId?: string;
    artifactUrl?: string;
    errorMessage?: string;
    projectFile?: string;
    imageFile?: string;
    staticImageUrl?: string;
  }>;
};

export async function exportBatchResults(
  batch: QuestionBatch,
  records: Record<string, GenerationRecord>,
): Promise<ExportResult> {
  const completedQuestions = batch.questions.filter(
    (question) => records[question.id]?.status === 'finished',
  );
  const zip = new JSZip();
  const jsonFolder = zip.folder('json');
  const imageFolder = zip.folder('images');
  let imageCount = 0;
  const manifestResults: QuestionBankExportManifest['results'] = [];

  const rows = await Promise.all(completedQuestions.map(async (question) => {
    const record = records[question.id];
    const jsonFile = record.projectJson ? `json/${question.code}.json` : '';
    let imageFile = '';

    if (record.projectJson) {
      jsonFolder?.file(
        `${question.code}.json`,
        JSON.stringify(record.projectJson, null, 2),
      );
    }

    if (record.staticImageUrl) {
      try {
        const image = await downloadImage(record.staticImageUrl);
        const extension = imageExtension(image.type);
        imageFile = `images/${question.code}.${extension}`;
        imageFolder?.file(`${question.code}.${extension}`, image);
        imageCount += 1;
      } catch {
        // Keep the original URL in the manifest when the browser cannot fetch it.
      }
    }

    manifestResults.push({
      questionId: question.id,
      status: record.status,
      taskId: record.taskId,
      artifactUrl: record.artifactUrl,
      errorMessage: record.errorMessage,
      projectFile: jsonFile || undefined,
      imageFile: imageFile || undefined,
      staticImageUrl: imageFile ? undefined : record.staticImageUrl,
    });

    return [
      batch.name,
      question.code,
      question.questionText,
      question.imageUrl ?? '',
      question.knowledgePoints.join('|'),
      record.status,
      record.staticImageUrl ?? '',
      jsonFile,
      imageFile,
    ];
  }));

  const headers = [
    '批次名称',
    '题目编号',
    '题目文本',
    '题目图片地址',
    '知识点',
    '生成状态',
    '静态图片地址',
    '工程JSON文件',
    '静态图片文件',
  ];
  const csv = [headers, ...rows]
    .map((row) => row.map(toCsvCell).join(','))
    .join('\r\n');
  zip.file('汇总.csv', `\uFEFF${csv}`);
  const manifest: QuestionBankExportManifest = {
    format: QUESTION_BANK_EXPORT_FORMAT,
    version: QUESTION_BANK_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    batch,
    results: manifestResults,
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  downloadBlob(blob, `${safeFilename(batch.name)}-results.zip`);

  return {
    exportedCount: completedQuestions.length,
    jsonCount: completedQuestions.filter(
      (question) => records[question.id]?.projectJson,
    ).length,
    imageCount,
  };
}

async function downloadImage(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`图片下载失败（HTTP ${response.status}）`);
  return response.blob();
}

function imageExtension(mimeType: string) {
  if (mimeType.includes('svg')) return 'svg';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('jpeg')) return 'jpg';
  return 'png';
}

function toCsvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '-').trim() || 'question-bank';
}
