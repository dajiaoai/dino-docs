import { useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  CheckCircle2,
  Download,
  UploadCloud,
  X,
} from 'lucide-react';
import type { GeometryQuestion, QuestionBatch } from './data';
import { LatexText } from './LatexText';

type CustomBatchImportProps = {
  existingBatchNames: string[];
  onClose: () => void;
  onImport: (batch: QuestionBatch) => void;
};

type CsvRow = Record<string, string>;

const requiredHeaders = [
  '题目编号',
  '题目文本',
];

const sampleCsv = `题目编号,题目文本,题目图片地址,知识点
CIRCLE-001,"已知 $O$ 为圆心，$AB$ 是直径，求 $\\angle ACB$。",,圆|圆周角|直径
CIRCLE-002,"圆 $O$ 的半径为 $5$，圆心到直线 $l$ 的距离为 $3$，判断直线与圆的位置关系。",,直线与圆|位置关系
`;

export function CustomBatchImport({
  existingBatchNames,
  onClose,
  onImport,
}: CustomBatchImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parsedBatch, setParsedBatch] = useState<QuestionBatch | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function handleFile(file?: File) {
    setError('');
    setParsedBatch(null);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('请选择 CSV 文件。');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('CSV 文件不能超过 2 MB。');
      return;
    }

    try {
      const batchName = file.name.replace(/\.csv$/i, '').trim();
      if (
        existingBatchNames.some(
          (name) => normalizeName(name) === normalizeName(batchName),
        )
      ) {
        throw new Error(`已存在名为“${batchName}”的批次，请修改 CSV 文件名。`);
      }
      const text = await file.text();
      const result = Papa.parse<CsvRow>(text.replace(/^\uFEFF/, ''), {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
      });
      if (result.errors.length) {
        throw new Error(`第 ${(result.errors[0].row ?? 0) + 2} 行格式有误。`);
      }
      const headers = result.meta.fields ?? [];
      const missing = requiredHeaders.filter((header) => !headers.includes(header));
      if (missing.length) {
        throw new Error(`缺少字段：${missing.join('、')}`);
      }
      if (!result.data.length) throw new Error('CSV 中没有题目数据。');

      const questions = result.data.map(toQuestion);
      const codes = new Set(questions.map((question) => question.code));
      if (codes.size !== questions.length) {
        throw new Error('题目编号不能重复。');
      }

      const batch: QuestionBatch = {
        id: `custom-${slugify(batchName) || 'batch'}-${Date.now()}`,
        name: batchName,
        questions,
      };
      setFileName(file.name);
      setParsedBatch(batch);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'CSV 解析失败。');
    }
  }

  function confirmImport() {
    if (parsedBatch) onImport(parsedBatch);
  }

  return (
    <div className="modal-backdrop import-backdrop" onMouseDown={onClose}>
      <section
        className="import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span className="sdk-chip">CUSTOM DATASET</span>
            <h2 id="import-title">添加自定义题库批次</h2>
            <p>CSV 文件名将作为批次名称，填写题目后即可导入。</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </header>

        <div className="import-body">
          <div className="import-step">
            <span>01</span>
            <div>
              <strong>下载示例 CSV</strong>
              <p>模板包含 LaTeX 题目文本，以及可选的图片地址和知识点。</p>
            </div>
            <button className="secondary-button" type="button" onClick={downloadSample}>
              <Download size={15} /> 下载模板
            </button>
          </div>

          <div className="import-step upload-step">
            <span>02</span>
            <div>
              <strong>上传填写后的 CSV</strong>
              <p>支持 UTF-8 编码，文件大小不超过 2 MB。</p>
            </div>
          </div>

          <button
            className={`drop-zone${dragging ? ' is-dragging' : ''}`}
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void handleFile(event.dataTransfer.files[0]);
            }}
          >
            <UploadCloud size={26} />
            <strong>点击选择或拖入 CSV 文件</strong>
            <small>每个文件导入为一个题库批次</small>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />

          {error && <div className="import-error">{error}</div>}
          {parsedBatch && (
            <div className="import-preview">
              <div className="import-preview-heading">
                <div>
                  <CheckCircle2 size={17} />
                  <span>
                    <strong>{parsedBatch.name}</strong>
                    <small>{fileName} · {parsedBatch.questions.length} 道题</small>
                  </span>
                </div>
              </div>
              <div className="import-preview-list">
                {parsedBatch.questions.slice(0, 3).map((question) => (
                  <div key={question.id}>
                    <code>{question.code}</code>
                    <LatexText value={question.questionText} />
                  </div>
                ))}
                {parsedBatch.questions.length > 3 && (
                  <small>还有 {parsedBatch.questions.length - 3} 道题</small>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="import-footer">
          <div>
            <button className="secondary-button" type="button" onClick={onClose}>取消</button>
            <button
              className="primary-button"
              type="button"
              disabled={!parsedBatch}
              onClick={confirmImport}
            >
              导入该批次
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function toQuestion(row: CsvRow, index: number): GeometryQuestion {
  const line = index + 2;
  const code = required(row, '题目编号', line);
  const questionText = required(row, '题目文本', line);
  const knowledgePoints = (row['知识点'] ?? '')
    .split(/[|,，、;；]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id: `custom-question-${slugify(code) || index + 1}`,
    code,
    questionText,
    imageUrl: row['题目图片地址']?.trim() || undefined,
    knowledgePoints,
    generation: {
      questionId: `custom-question-${slugify(code) || index + 1}`,
      status: 'pending',
      staticImageUrl: '',
      projectJson: undefined,
    },
  };
}

function required(row: CsvRow, key: string, line: number) {
  const value = row[key]?.trim();
  if (!value) throw new Error(`第 ${line} 行“${key}”不能为空。`);
  return value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase('zh-CN');
}

function downloadSample() {
  const blob = new Blob([`\uFEFF${sampleCsv}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '九年级圆专题示例.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
