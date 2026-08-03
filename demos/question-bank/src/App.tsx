import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CircleDot,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  Image as ImageIcon,
  KeyRound,
  LoaderCircle,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  batches as defaultBatches,
  type GenerationRecord,
  type GenerationStatus,
  type GeometryQuestion,
  type QuestionBatch,
} from "./data";
import { demoConfig } from "./config";
import { LatexText } from "./LatexText";
import { SdkEditor } from "./SdkEditor";
import { exportBatchResults } from "./exportResults";
import { CustomBatchImport } from "./CustomBatchImport";
import { loadCustomBatches, saveCustomBatches } from "./customBatches";
import {
  defaultApiSettings,
  loadApiSettings,
  saveApiSettings,
  type ApiSettings,
} from "./apiSettings";
import { runGenerationTask } from "./apiAgent";

type View = "questions" | "results";
type PreviewData = {
  question: GeometryQuestion;
  record: GenerationRecord;
};

const statusLabel: Record<GenerationStatus, string> = {
  pending: "待生成",
  submitting: "提交中",
  created: "排队中",
  running: "生成中",
  rendering: "渲染缩略图",
  finished: "已完成",
  error: "失败",
};

export default function App() {
  const [customBatches, setCustomBatches] = useState(loadCustomBatches);
  const allBatches = useMemo(
    () => [...defaultBatches, ...customBatches],
    [customBatches],
  );
  const [batchId, setBatchId] = useState(defaultBatches[0].id);
  const [records, setRecords] = useState<Record<string, GenerationRecord>>({});
  const [running, setRunning] = useState(false);
  const [view, setView] = useState<View>("questions");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<"canvas" | "json">(
    "canvas",
  );
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [apiSettings, setApiSettings] = useState(loadApiSettings);
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const cancelRef = useRef(false);
  const requestAbortRef = useRef<AbortController | null>(null);
  const batch =
    allBatches.find((item) => item.id === batchId) ?? defaultBatches[0];
  const isCustomBatch = customBatches.some((item) => item.id === batch.id);
  const isApiConfigured = Boolean(
    apiSettings.model.trim() &&
      apiSettings.apiKey.trim() &&
      apiSettings.baseUrl.trim(),
  );

  useEffect(() => {
    saveCustomBatches(customBatches);
  }, [customBatches]);

  useEffect(() => {
    saveApiSettings(apiSettings);
  }, [apiSettings]);

  useEffect(() => {
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setRecords(createPendingRecords(batch.questions));
    setView("questions");
    cancelRef.current = true;
    setRunning(false);
  }, [batch]);

  const completed = useMemo(
    () =>
      batch.questions.filter(
        (question) => records[question.id]?.status === "finished",
      ).length,
    [batch, records],
  );
  const failed = useMemo(
    () =>
      batch.questions.filter(
        (question) => records[question.id]?.status === "error",
      ).length,
    [batch, records],
  );
  const terminalCount = completed + failed;
  const progress = Math.round((terminalCount / batch.questions.length) * 100);

  function updateRecord(questionId: string, update: Partial<GenerationRecord>) {
    setRecords((current) => ({
      ...current,
      [questionId]: { ...current[questionId], questionId, ...update },
    }));
  }

  async function generateAll() {
    requestAbortRef.current?.abort();
    const requestController = new AbortController();
    requestAbortRef.current = requestController;
    cancelRef.current = false;
    setRunning(true);
    setView("questions");
    setRecords(createPendingRecords(batch.questions));

    const outcomes = isCustomBatch
      ? await mapWithConcurrency(batch.questions, 3, (question) =>
          runGenerationTask(
            apiSettings,
            question,
            (update) => updateRecord(question.id, update),
            requestController.signal,
          ),
        )
      : await runExampleGeneration(
          batch.questions,
          (questionId, update) => updateRecord(questionId, update),
          () => cancelRef.current,
        );

    if (!cancelRef.current && !requestController.signal.aborted) {
      setRunning(false);
      if (outcomes.some(Boolean)) setView("results");
    }
    if (requestAbortRef.current === requestController) {
      requestAbortRef.current = null;
    }
  }

  function reset() {
    cancelRef.current = true;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setRunning(false);
    setView("questions");
    setRecords(createPendingRecords(batch.questions));
  }

  function openPreview(question: GeometryQuestion) {
    const record = records[question.id];
    if (!record?.projectJson) return;
    setPreview({ question, record });
    setActivePreviewTab("canvas");
    setCopied(false);
  }

  async function copyProjectJson() {
    if (!preview?.record.projectJson) return;
    await navigator.clipboard.writeText(
      JSON.stringify(preview.record.projectJson, null, 2),
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function downloadResults() {
    if (!completed || exporting) return;
    setExporting(true);
    setExportNotice("");
    try {
      const result = await exportBatchResults(batch, records);
      setExportNotice(
        `已导出 ${result.exportedCount} 道题，包含 ${result.jsonCount} 个工程 JSON`,
      );
      window.setTimeout(() => setExportNotice(""), 3000);
    } finally {
      setExporting(false);
    }
  }

  function importCustomBatch(importedBatch: QuestionBatch) {
    setCustomBatches((current) => [
      ...current.filter((item) => item.id !== importedBatch.id),
      importedBatch,
    ]);
    setBatchId(importedBatch.id);
    setImportOpen(false);
  }

  function deleteCustomBatch(item: QuestionBatch) {
    const confirmed = window.confirm(
      `确定删除自建批次“${item.name}”吗？该操作会同时删除浏览器中的本地数据。`,
    );
    if (!confirmed) return;
    setCustomBatches((current) =>
      current.filter((batchItem) => batchItem.id !== item.id),
    );
    if (batchId === item.id) setBatchId(defaultBatches[0].id);
  }

  function updateApiSetting<Key extends keyof ApiSettings>(
    key: Key,
    value: ApiSettings[Key],
  ) {
    setApiSettings((current) => ({ ...current, [key]: value }));
  }

  function resetApiSettings() {
    setApiSettings({ ...defaultApiSettings });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="返回大角几何开放平台">
          <span className="brand-mark">
            <img
              src="https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/5fd02c34-logo.svg"
              alt=""
              width="36"
              height="36"
            />
          </span>
          <span>大角几何</span>
          <span className="brand-divider" />
          <strong>题库生产工作台</strong>
        </a>
        <div className="topbar-actions">
          <span className="demo-badge">
            <Sparkles size={13} /> 场景 Demo
          </span>
          <a href="/api">
            接入文档 <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">QUESTION BANK PIPELINE</span>
            <h1>把题目，变成可交互的标准几何图</h1>
            <p>
              题目文本支持 LaTeX，可批量产出静态图片和能被 SDK 加载的工程文件。
            </p>
          </div>
          <button
            className={`api-status${isApiConfigured ? " is-ready" : ""}`}
            type="button"
            aria-expanded={apiConfigOpen}
            aria-controls="api-config-panel"
            onClick={() => setApiConfigOpen((open) => !open)}
          >
            <span className="status-dot" />
            <div>
              <strong>大角 API</strong>
              <small>
                {isApiConfigured ? "配置已就绪" : "连接配置待补全"}
                {" · "}
                {apiSettings.model}
              </small>
            </div>
            <ChevronDown className={apiConfigOpen ? "is-open" : ""} size={17} />
          </button>
        </section>

        {apiConfigOpen && (
          <section
            id="api-config-panel"
            className="api-config-panel"
            aria-label="大角 API 配置"
          >
            <div className="api-config-panel-header">
              <span>
                <Settings2 size={14} />
                连接配置
              </span>
              <button type="button" onClick={resetApiSettings}>
                <RefreshCw size={12} />
                重置
              </button>
            </div>
            <div className="api-config-fields">
              <label>
                <span>
                  Model <em>必填</em>
                </span>
                <select
                  value={apiSettings.model}
                  onChange={(event) =>
                    updateApiSetting("model", event.target.value)
                  }
                  required
                >
                  <option value="dinogeo-1">dinogeo-1</option>
                  <option value="dinogeo-1-pro">dinogeo-1-pro</option>
                </select>
              </label>
              <label>
                <span className="field-label">
                  <span>
                    API Key <em>必填</em>
                  </span>
                  <a
                    href="https://open.dajiaoai.com/api/auth.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    如何获取？ <ExternalLink size={10} />
                  </a>
                </span>
                <div className="api-key-input">
                  <KeyRound size={14} />
                  <input
                    type="password"
                    value={apiSettings.apiKey}
                    onChange={(event) =>
                      updateApiSetting("apiKey", event.target.value)
                    }
                    placeholder="djo_xxx"
                    autoComplete="off"
                    spellCheck={false}
                    required
                  />
                </div>
              </label>
              <label>
                <span>
                  BaseURL <em>必填</em>
                </span>
                <input
                  type="url"
                  value={apiSettings.baseUrl}
                  onChange={(event) =>
                    updateApiSetting("baseUrl", event.target.value)
                  }
                  placeholder="https://api.dajiaoai.com"
                  spellCheck={false}
                  required
                />
              </label>
            </div>
          </section>
        )}

        <section className="pipeline" aria-label="生成流程">
          {[
            [Database, "题目数据", "文本 · 图片 · Tags"],
            [Zap, "大角 API", "智能生图"],
            [FileJson, "几何工程文件", ".algeo · JSON"],
            [Eye, "内嵌动态画板", "SDK 加载编辑"],
          ].map(([Icon, label, desc], index) => {
            const PipelineIcon = Icon as typeof Database;
            return (
              <div className="pipeline-group" key={label as string}>
                <div className="pipeline-node">
                  <span>
                    <PipelineIcon size={18} />
                  </span>
                  <div>
                    <strong>{label as string}</strong>
                    <small>{desc as string}</small>
                  </div>
                </div>
                {index < 3 && (
                  <ArrowRight className="pipeline-arrow" size={16} />
                )}
              </div>
            );
          })}
        </section>

        <section className="workspace">
          <aside className="batch-panel">
            <div className="panel-heading">
              <div>
                <span>01</span>
                <strong>选择题库批次</strong>
              </div>
              <small>{allBatches.length} 个批次</small>
            </div>
            <div className="batch-list">
              {allBatches.map((item) => {
                const isCustom = customBatches.some(
                  (customItem) => customItem.id === item.id,
                );
                return (
                  <div
                    className={`batch-card${item.id === batchId ? " active" : ""}`}
                    key={item.id}
                  >
                    <button
                      className="batch-select"
                      type="button"
                      onClick={() => setBatchId(item.id)}
                    >
                      <span className="batch-icon">
                        <BookOpen size={18} />
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.questions.length} 道题</small>
                      </span>
                    </button>
                    <div className="batch-card-tail">
                      <span
                        className={`batch-type ${isCustom ? "is-custom" : "is-example"}`}
                      >
                        {isCustom ? "自建" : "示例"}
                      </span>
                      {isCustom && (
                        <button
                          className="delete-batch"
                          type="button"
                          aria-label={`删除批次 ${item.name}`}
                          title="删除自建批次"
                          onClick={() => deleteCustomBatch(item)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="add-batch"
              type="button"
              onClick={() => setImportOpen(true)}
            >
              <Plus size={14} /> 添加自定义批次
            </button>
          </aside>

          <div className="content-panel">
            <div className="content-toolbar">
              <div>
                <button
                  className={view === "questions" ? "active" : ""}
                  onClick={() => setView("questions")}
                  type="button"
                >
                  待生成题目 <span>{batch.questions.length}</span>
                </button>
                <button
                  className={view === "results" ? "active" : ""}
                  onClick={() => setView("results")}
                  type="button"
                  disabled={completed === 0}
                >
                  生成结果 <span>{completed}</span>
                </button>
              </div>
              <div className="toolbar-actions">
                {view === "results" && completed > 0 && (
                  <button
                    className="secondary-button"
                    onClick={downloadResults}
                    type="button"
                    disabled={exporting}
                  >
                    {exporting ? (
                      <LoaderCircle className="spin" size={15} />
                    ) : (
                      <Download size={15} />
                    )}
                    {exporting ? "正在打包" : "下载结果 ZIP"}
                  </button>
                )}
                {terminalCount > 0 && (
                  <button
                    className="secondary-button"
                    onClick={reset}
                    type="button"
                  >
                    <RefreshCw size={15} /> 重置
                  </button>
                )}
                <button
                  className="primary-button"
                  onClick={generateAll}
                  type="button"
                  disabled={
                    running ||
                    terminalCount === batch.questions.length ||
                    (isCustomBatch && !isApiConfigured)
                  }
                  title={
                    isCustomBatch && !isApiConfigured
                      ? "请先填写完整的连接配置"
                      : undefined
                  }
                >
                  {running ? (
                    <>
                      <LoaderCircle className="spin" size={16} /> 正在生成{" "}
                      {terminalCount}/{batch.questions.length}
                    </>
                  ) : terminalCount === batch.questions.length ? (
                    <>
                      <Check size={16} /> {failed ? "任务已结束" : "全部完成"}
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" /> 启动批量生成
                    </>
                  )}
                </button>
              </div>
            </div>

            {(running || terminalCount > 0) && (
              <div className="progress-strip">
                <div>
                  <span>
                    {running
                      ? "批量任务运行中"
                      : failed
                        ? `批量任务结束，${failed} 道失败`
                        : "批量任务已完成"}
                  </span>
                  <strong>{progress}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <small>
                  {terminalCount} / {batch.questions.length} 道题处理完成
                </small>
              </div>
            )}
            {exportNotice && (
              <div className="export-notice">{exportNotice}</div>
            )}

            {view === "questions" ? (
              <div className="question-list">
                <div className="list-header">
                  <span>题目文本</span>
                  <span>知识点</span>
                  <span>状态</span>
                </div>
                {batch.questions.map((question) => {
                  const record = records[question.id];
                  const status = record?.status ?? "pending";
                  return (
                    <article className="question-row" key={question.id}>
                      <div className="question-main">
                        <span className="question-code">{question.code}</span>
                        <div className="question-content">
                          {question.imageUrl && (
                            <a
                              className="question-thumbnail"
                              href={question.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${question.code} 查看题目原图`}
                            >
                              <img
                                src={question.imageUrl}
                                alt={`${question.code} 题目配图`}
                                loading="lazy"
                              />
                            </a>
                          )}
                          <div className="question-copy">
                            <LatexText value={question.questionText} />
                          </div>
                        </div>
                      </div>
                      <div className="tag-list">
                        {question.knowledgePoints.map((tag) => (
                          <span className="topic-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="status-wrap">
                        <span
                          className={`status status-${status}`}
                          title={record?.errorMessage}
                        >
                          {status === "finished" ? (
                            <CheckCircle2 size={14} />
                          ) : status === "error" ? (
                            <CircleAlert size={14} />
                          ) : status !== "pending" ? (
                            <LoaderCircle className="spin" size={14} />
                          ) : null}
                          {statusLabel[status]}
                        </span>
                        {record?.errorMessage ? (
                          <small
                            className="status-detail is-error"
                            title={record.errorMessage}
                          >
                            {record.errorMessage}
                          </small>
                        ) : record?.taskId ? (
                          <small
                            className="status-detail"
                            title={record.taskId}
                          >
                            …{record.taskId.slice(-8)}
                          </small>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="results-grid">
                {batch.questions
                  .filter(
                    (question) => records[question.id]?.status === "finished",
                  )
                  .map((question) => {
                    const record = records[question.id];
                    return (
                      <article className="result-card" key={question.id}>
                        <div className="canvas-wrap">
                          {record.staticImageUrl ? (
                            <>
                              <img
                                className="static-result-image"
                                src={record.staticImageUrl}
                                alt={`${question.code} 生成的静态几何图`}
                              />
                              <span className="generated-label">
                                <Check size={12} /> PNG 已生成
                              </span>
                            </>
                          ) : (
                            <div className="empty-asset">
                              <ImageIcon size={22} />
                              <span>静态图片地址待补充</span>
                            </div>
                          )}
                        </div>
                        <div className="result-info">
                          <span>{question.code}</span>
                          <LatexText
                            className="result-question-text"
                            value={question.questionText}
                          />
                          <button
                            type="button"
                            onClick={() => openPreview(question)}
                            disabled={!record.projectJson}
                          >
                            大角 SDK 加载编辑画板 <ArrowRight size={14} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            )}
          </div>
        </section>
      </main>

      {preview?.record.projectJson && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setPreview(null)}
        >
          <section
            className="preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="sdk-chip">DINO SDK EDITOR</span>
                <h2 id="preview-title">工程文件已加载</h2>
                <p>
                  {preview.question.code} · project.json → 大角 SDK 编辑画板
                </p>
              </div>
              <button
                aria-label="关闭预览"
                onClick={() => setPreview(null)}
                type="button"
              >
                <X size={20} />
              </button>
            </header>
            <div className="preview-body">
              <aside>
                <span>题目文本</span>
                <p>
                  <LatexText value={preview.question.questionText} />
                </p>
                <div className="preview-tags">
                  {preview.question.knowledgePoints.map((tag) => (
                    <span className="topic-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="embed-card">
                  <FileJson size={17} />
                  <div>
                    <strong>project.json 已加载</strong>
                    <small>
                      Protocol {preview.record.projectJson.metadata.version} ·
                      支持继续编辑
                    </small>
                  </div>
                  <CheckCircle2 size={16} />
                </div>
              </aside>
              <div className="sdk-view">
                <div className="sdk-toolbar">
                  <div>
                    <button
                      className={activePreviewTab === "canvas" ? "active" : ""}
                      onClick={() => setActivePreviewTab("canvas")}
                      type="button"
                    >
                      SDK 编辑画板
                    </button>
                    <button
                      className={activePreviewTab === "json" ? "active" : ""}
                      onClick={() => setActivePreviewTab("json")}
                      type="button"
                    >
                      工程文件 JSON
                    </button>
                  </div>
                  <span>
                    <span className="live-dot" /> SDK Loaded
                  </span>
                </div>
                {activePreviewTab === "canvas" ? (
                  <div className="interactive-stage">
                    <SdkEditor project={preview.record.projectJson} />
                  </div>
                ) : (
                  <div className="dsl-panel">
                    <button onClick={copyProjectJson} type="button">
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? "已复制" : "复制 JSON"}
                    </button>
                    <pre>
                      <code>
                        {JSON.stringify(preview.record.projectJson, null, 2)}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
      {importOpen && (
        <CustomBatchImport
          existingBatchNames={allBatches.map((item) => item.name)}
          onClose={() => setImportOpen(false)}
          onImport={importCustomBatch}
        />
      )}
    </div>
  );
}

function createPendingRecords(questions: GeometryQuestion[]) {
  return Object.fromEntries(
    questions.map((question) => [
      question.id,
      {
        ...question.generation,
        status: "pending",
      } satisfies GenerationRecord,
    ]),
  );
}

async function runExampleGeneration(
  questions: GeometryQuestion[],
  update: (questionId: string, value: Partial<GenerationRecord>) => void,
  isCancelled: () => boolean,
) {
  const outcomes: boolean[] = [];
  for (const question of questions) {
    if (isCancelled()) break;
    update(question.id, { status: "submitting" });
    await delay(demoConfig.requestDelay);
    if (isCancelled()) break;
    update(question.id, { status: "running" });
    await delay(demoConfig.requestDelay);
    if (isCancelled()) break;
    update(question.id, { status: "finished" });
    outcomes.push(true);
  }
  return outcomes;
}

async function mapWithConcurrency<Item, Result>(
  items: Item[],
  limit: number,
  worker: (item: Item) => Promise<Result>,
) {
  const results = new Array<Result>(items.length);
  let cursor = 0;

  async function runNext() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runNext()),
  );
  return results;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
