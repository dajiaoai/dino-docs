import type { ApiSettings } from "./apiSettings";
import type {
  GenerationRecord,
  GenerationStatus,
  GeometryQuestion,
} from "./data";
import type { FileContentLatest } from "@dajiaoai/algeo-sdk";

type CreateTaskResponse = {
  success: boolean;
  taskId: string;
  status: "created";
  createdAt: string;
};

type ApiTaskStatus = "created" | "running" | "finished" | "error";

type ViewBound = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type SlideRenderOptions = {
  viewBound: ViewBound;
  scale: number;
};

type TaskDetailResponse = {
  success: boolean;
  task: {
    taskId: string;
    status: ApiTaskStatus;
    artifactUrl?: string | null;
    error?: string | null;
    message?: string | null;
    extra?: {
      output?: {
        slides?: Array<SlideRenderOptions & { slideIndex?: number }>;
      };
    };
  };
};

type RenderResponse = {
  success: boolean;
  url: string;
  filename: string;
  mimeType: "image/png";
  width: number;
  height: number;
};

type RecordUpdate = Partial<GenerationRecord> & {
  status: GenerationStatus;
};

const MAX_POLL_TIME = 10 * 60 * 1000;

export async function runGenerationTask(
  settings: ApiSettings,
  question: GeometryQuestion,
  onUpdate: (update: RecordUpdate) => void,
  signal: AbortSignal,
) {
  try {
    onUpdate({
      status: "submitting",
      taskId: undefined,
      artifactUrl: undefined,
      errorMessage: undefined,
    });

    const form = new FormData();
    form.append("model", settings.model);
    form.append("content", question.questionText);
    if (question.imageUrl) {
      const image = await fetchImageAsFile(question.imageUrl, signal);
      form.append("images", image);
    }

    const created = await requestJson<CreateTaskResponse>(
      apiUrl(settings.baseUrl, "/api/agent/run"),
      {
        method: "POST",
        headers: authorizationHeader(settings.apiKey),
        body: form,
        signal,
      },
    );
    if (!created.taskId) throw new Error("大角 API 未返回 taskId。");

    onUpdate({ status: "created", taskId: created.taskId });
    const startedAt = Date.now();

    while (!signal.aborted) {
      const elapsed = Date.now() - startedAt;
      if (elapsed > MAX_POLL_TIME) {
        throw new Error("任务查询超时，请稍后重试。");
      }
      await abortableDelay(elapsed < 30_000 ? 2_000 : 5_000, signal);

      const detail = await requestJson<TaskDetailResponse>(
        apiUrl(
          settings.baseUrl,
          `/api/agent/tasks/${encodeURIComponent(created.taskId)}`,
        ),
        {
          headers: authorizationHeader(settings.apiKey),
          signal,
        },
      );
      const task = detail.task;
      if (!task) throw new Error("任务详情响应缺少 task 字段。");

      if (task.status === "created" || task.status === "running") {
        onUpdate({ status: task.status, taskId: created.taskId });
        continue;
      }
      if (task.status === "finished") {
        if (!task.artifactUrl) {
          throw new Error("任务已完成，但未返回 artifactUrl。");
        }
        const renderOptions = getFirstSlideRenderOptions(task);
        onUpdate({
          status: "rendering",
          taskId: created.taskId,
          artifactUrl: task.artifactUrl,
        });

        const projectJson = await downloadProject(
          task.artifactUrl,
          signal,
        );
        onUpdate({
          status: "rendering",
          taskId: created.taskId,
          artifactUrl: task.artifactUrl,
          projectJson,
        });

        const rendered = await renderProject(
          settings,
          projectJson,
          created.taskId,
          renderOptions,
          signal,
        );
        onUpdate({
          status: "finished",
          taskId: created.taskId,
          artifactUrl: task.artifactUrl,
          projectJson,
          staticImageUrl: rendered.url,
        });
        return true;
      }

      onUpdate({
        status: "error",
        taskId: created.taskId,
        errorMessage: task.error || task.message || "生图任务执行失败。",
      });
      return false;
    }
  } catch (error) {
    if (isAbortError(error)) return false;
    onUpdate({
      status: "error",
      errorMessage:
        error instanceof Error ? error.message : "大角 API 请求失败。",
    });
    return false;
  }

  return false;
}

async function downloadProject(url: string, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(resolveProjectDownloadUrl(url), { signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(
      "工程文件下载失败：artifactUrl 所在域名需要允许跨域访问。",
    );
  }
  if (!response.ok) {
    throw new Error(`工程文件下载失败（HTTP ${response.status}）。`);
  }

  let project: unknown;
  try {
    project = JSON.parse(await response.text());
  } catch {
    throw new Error("artifactUrl 返回的工程文件不是有效 JSON。");
  }
  if (!isFileContent(project)) {
    throw new Error("artifactUrl 返回的数据不符合大角工程文件协议。");
  }
  return project;
}

function resolveProjectDownloadUrl(url: string) {
  if (!import.meta.env.DEV) return url;

  const parsed = new URL(url, window.location.href);
  if (parsed.origin !== "https://dl.easeplay.vip") return url;

  return `/dl-proxy${parsed.pathname}${parsed.search}`;
}

async function renderProject(
  settings: ApiSettings,
  project: FileContentLatest,
  taskId: string,
  renderOptions: SlideRenderOptions,
  signal: AbortSignal,
) {
  const rendered = await requestJson<RenderResponse>(
    apiUrl(settings.baseUrl, "/api/render"),
    {
      method: "POST",
      headers: {
        ...authorizationHeader(settings.apiKey),
        "Content-Type": "application/json",
        "x-request-id": `question-bank-${taskId}`,
      },
      body: JSON.stringify({
        slideIndex: 1,
        viewBound: renderOptions.viewBound,
        scale: renderOptions.scale,
        content: project,
      }),
      signal,
    },
  );
  if (!rendered.url) throw new Error("渲染接口未返回 PNG 地址。");
  return rendered;
}

function getFirstSlideRenderOptions(
  task: TaskDetailResponse["task"],
): SlideRenderOptions {
  const slide = task.extra?.output?.slides?.[0];
  if (!slide) {
    throw new Error("任务已完成，但未返回第一张图片的渲染参数。");
  }

  const { viewBound, scale } = slide;
  const hasValidViewBound =
    viewBound &&
    [viewBound.left, viewBound.right, viewBound.top, viewBound.bottom].every(
      Number.isFinite,
    ) &&
    viewBound.left < viewBound.right &&
    viewBound.bottom < viewBound.top;

  if (
    !hasValidViewBound ||
    !Number.isFinite(scale) ||
    scale <= 0
  ) {
    throw new Error("任务返回的第一张图片渲染参数无效。");
  }

  return { viewBound, scale };
}

function isFileContent(value: unknown): value is FileContentLatest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as {
    metadata?: { version?: unknown };
    slides?: unknown;
    messages?: unknown;
  };
  return (
    typeof candidate.metadata?.version === "string" &&
    Array.isArray(candidate.slides) &&
    Array.isArray(candidate.messages)
  );
}

async function fetchImageAsFile(url: string, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(url, { mode: "cors", signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(
      "无法读取题目图片：图片域名需要允许跨域访问（Access-Control-Allow-Origin），或通过同源后端代理图片。",
    );
  }
  if (!response.ok) {
    throw new Error(`题目图片读取失败（HTTP ${response.status}）。`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("题目图片地址返回的不是图片文件。");
  }
  const extension = blob.type.split("/")[1]?.split("+")[0] || "png";
  let filename = `question-image.${extension}`;
  try {
    const candidate = decodeURIComponent(
      new URL(url, window.location.href).pathname.split("/").pop() || "",
    );
    if (candidate && candidate.includes(".")) filename = candidate;
  } catch {
    // Keep the generated filename.
  }
  return new File([blob], filename, { type: blob.type });
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const details = payload as {
      message?: string;
      error?: string | { message?: string };
    };
    const message =
      details.message ||
      (typeof details.error === "string"
        ? details.error
        : details.error?.message) ||
      `大角 API 请求失败（HTTP ${response.status}）。`;
    throw new Error(message);
  }
  return payload as T;
}

function authorizationHeader(apiKey: string) {
  return { Authorization: `Bearer ${apiKey.trim()}` };
}

function apiUrl(baseUrl: string, path: string) {
  return `${baseUrl.trim().replace(/\/+$/, "")}${path}`;
}

function abortableDelay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
