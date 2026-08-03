import JSZip from 'jszip';
import type {
  GenerationRecord,
  GeometryQuestion,
  QuestionBatch,
} from './data';

type ExportResult = {
  exportedCount: number;
  jsonCount: number;
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

  const rows = completedQuestions.map((question) => {
    const record = records[question.id];
    const jsonFile = record.projectJson ? `json/${question.code}.json` : '';

    if (record.projectJson) {
      jsonFolder?.file(
        `${question.code}.json`,
        JSON.stringify(record.projectJson, null, 2),
      );
    }

    return [
      batch.name,
      question.code,
      question.questionText,
      question.imageUrl ?? '',
      question.knowledgePoints.join('|'),
      record.status,
      record.staticImageUrl ?? '',
      jsonFile,
    ];
  });

  const headers = [
    '批次名称',
    '题目编号',
    '题目文本',
    '题目图片地址',
    '知识点',
    '生成状态',
    '静态图片地址',
    '工程JSON文件',
  ];
  const csv = [headers, ...rows]
    .map((row) => row.map(toCsvCell).join(','))
    .join('\r\n');
  zip.file('汇总.csv', `\uFEFF${csv}`);

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
  };
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
