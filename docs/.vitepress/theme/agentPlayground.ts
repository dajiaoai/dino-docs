export const AGENT_MODELS = ['dinogeo-1', 'dinogeo-1-pro'] as const;
export const MAX_AGENT_IMAGES = 10;

export interface AgentPlaygroundInput {
  baseUrl: string;
  authorization: string;
  model: string;
  content: string;
  template: string;
  images: File[];
}

function validateBaseUrl(value: string) {
  let base: URL;
  try {
    base = new URL(value.trim());
  } catch {
    throw new Error('Base URL 必须是完整的 HTTP 或 HTTPS 地址。');
  }
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new Error('Base URL 仅支持 HTTP / HTTPS，不能包含凭据、查询参数或锚点。');
  }
  return base.href.replace(/\/$/, '');
}

function validateTemplate(value: string) {
  if (!value.trim()) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('template 必须是有效的 JSON 对象。');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('template 必须是 JSON 对象。');
  }
}

export function buildAgentRequest(input: AgentPlaygroundInput) {
  const baseUrl = validateBaseUrl(input.baseUrl);
  if (!AGENT_MODELS.includes(input.model as typeof AGENT_MODELS[number])) {
    throw new Error('请选择有效的生图模型。');
  }
  if (input.images.length > MAX_AGENT_IMAGES) {
    throw new Error(`images 最多上传 ${MAX_AGENT_IMAGES} 张。`);
  }
  if (!input.content.trim() && input.images.length === 0) {
    throw new Error('content 与 images 至少需要提供一个。');
  }
  validateTemplate(input.template);

  const formData = new FormData();
  formData.append('model', input.model);
  if (input.content) formData.append('content', input.content);
  if (input.template.trim()) formData.append('template', input.template);
  // The legacy server accepts a single file via image; repeated images parse as an array.
  const imageField = input.images.length === 1 ? 'image' : 'images';
  for (const image of input.images) formData.append(imageField, image, image.name);

  const headers = buildAgentHeaders(input.authorization);

  return {
    url: `${baseUrl}/api/agent/run`,
    headers,
    formData,
    imageField,
  };
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

export function toAgentCurl(input: AgentPlaygroundInput) {
  const request = buildAgentRequest(input);
  const parts = [`curl -X POST ${shellQuote(request.url)}`];
  for (const [key, value] of Object.entries(request.headers)) {
    parts.push(`  -H ${shellQuote(`${key}: ${value}`)}`);
  }
  parts.push(`  -F ${shellQuote(`model=${input.model}`)}`);
  if (input.content) parts.push(`  -F ${shellQuote(`content=${input.content}`)}`);
  if (input.template.trim()) parts.push(`  -F ${shellQuote(`template=${input.template}`)}`);
  for (const image of input.images) {
    parts.push(`  -F ${shellQuote(`${request.imageField}=@${image.name}`)}`);
  }
  return parts.join(' \\\n');
}

export function getAgentPollInterval(elapsedMs: number) {
  return elapsedMs < 30_000 ? 2_000 : 5_000;
}

export function isAgentTerminalStatus(status: unknown): status is 'finished' | 'error' {
  return status === 'finished' || status === 'error';
}

export function resolveArtifactUrl(value: unknown, baseUrl: string) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value, baseUrl);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function buildAgentHeaders(authorization: string) {
  const headers: Record<string, string> = {};
  if (authorization.trim()) headers.Authorization = authorization.trim();
  if (Object.values(headers).some(value => /[\r\n]/.test(value))) {
    throw new Error('请求头不能包含换行。');
  }
  return headers;
}

export interface AgentQueryInput {
  baseUrl: string;
  authorization: string;
  page: string | number;
  pageSize: string | number;
  status: string;
  taskId: string;
}

export type AgentQueryVariant = 'tasks' | 'detail';
export const AGENT_TASK_STATUSES = ['created', 'running', 'finished', 'error'] as const;

export function buildAgentQueryRequest(input: AgentQueryInput, variant: AgentQueryVariant) {
  const baseUrl = validateBaseUrl(input.baseUrl);
  const headers = buildAgentHeaders(input.authorization);
  if (variant === 'detail') {
    const taskId = input.taskId.trim();
    if (!taskId || taskId === '.' || taskId === '..') throw new Error('请填写有效的 taskId。');
    return { url: `${baseUrl}/api/agent/tasks/${encodeURIComponent(taskId)}`, headers };
  }

  const params = new URLSearchParams();
  for (const key of ['page', 'pageSize'] as const) {
    const value = String(input[key]).trim();
    if (!value) continue;
    const number = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(number) || number < 1 || (key === 'pageSize' && number > 100)) {
      throw new Error(key === 'pageSize' ? 'pageSize 必须为 1–100 的整数。' : 'page 必须为正整数。');
    }
    params.set(key, String(number));
  }
  if (input.status) {
    if (!AGENT_TASK_STATUSES.includes(input.status as typeof AGENT_TASK_STATUSES[number])) {
      throw new Error('请选择有效的任务状态。');
    }
    params.set('status', input.status);
  }
  const query = params.toString();
  return { url: `${baseUrl}/api/agent/tasks${query ? `?${query}` : ''}`, headers };
}

export function toAgentQueryCurl(input: AgentQueryInput, variant: AgentQueryVariant) {
  const request = buildAgentQueryRequest(input, variant);
  const parts = [`curl -X GET ${shellQuote(request.url)}`];
  for (const [key, value] of Object.entries(request.headers)) {
    parts.push(`  -H ${shellQuote(`${key}: ${value}`)}`);
  }
  return parts.join(' \\\n');
}
