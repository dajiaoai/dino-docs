import {
  getRenderPlaygroundConfig,
  cropFields,
  type NumericField,
  type RenderPlaygroundVariant,
  type RenderViewMode,
} from './renderPlaygroundConfig';

export interface PlaygroundInput {
  variant?: RenderPlaygroundVariant;
  baseUrl: string;
  authorization: string;
  requestId: string;
  content: string;
  template: string;
  slideIndex: string | number;
  transparent?: boolean;
  pixelRatio?: string | number;
  crop?: Record<string, string | number>;
  mode: RenderViewMode;
  view2D: Record<string, string | number>;
  view3D: Record<string, string | number>;
  offset: string;
  projection: string;
}

function jsonObject(value: string, name: string): Record<string, unknown> {
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error(`${name} 必须是有效的 JSON 对象。`); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(`${name} 必须是 JSON 对象。`);
  return parsed as Record<string, unknown>;
}

function numeric(value: string | number, name: string, field: NumericField) {
  const n = Number(value);
  const kind = field.positive ? '正' : field.nonNegative ? '非负' : '有限';
  if (!String(value).trim() || !Number.isFinite(n) || (field.positive && n <= 0)
    || (field.nonNegative && n < 0) || (field.integer && !Number.isInteger(n))) {
    throw new Error(`${name} 必须是${kind}${field.integer ? '整数' : '数值'}。`);
  }
  return n;
}

function numericFields(
  values: Record<string, string | number>,
  fields: readonly NumericField[],
  prefix = '',
) {
  const result: Record<string, number> = {};
  for (const field of fields) {
    const value = values[field.key] ?? '';
    if (!String(value).trim() && !field.required) continue;
    result[field.key] = numeric(value, `${prefix}${field.key}`, field);
  }
  return result;
}

function validateBounds(view: Record<string, number>, name: string) {
  if (!(view.left < view.right) || !(view.bottom < view.top)) {
    throw new Error(`${name} 必须满足 left < right 且 bottom < top。`);
  }
}

function buildView3D(input: PlaygroundInput, fields: readonly NumericField[]) {
  const view: Record<string, unknown> = numericFields(input.view3D, fields, 'view3D.');
  if (input.offset.trim()) {
    let offset: unknown;
    try { offset = JSON.parse(input.offset); } catch { throw new Error('view3D.offset 必须是含 3 个有限数值的 JSON 数组。'); }
    if (!Array.isArray(offset) || offset.length !== 3 || !offset.every(n => typeof n === 'number' && Number.isFinite(n))) {
      throw new Error('view3D.offset 必须是含 3 个有限数值的 JSON 数组。');
    }
    view.offset = offset;
  }
  if (input.projection) {
    if (!['orthographic', 'perspective', 'oblique'].includes(input.projection)) throw new Error('view3D.projection 无效。');
    view.projection = input.projection;
  }
  const crop = numericFields(input.crop ?? {}, cropFields, 'view3D.crop.');
  if (Object.keys(crop).length) {
    if (Object.keys(crop).length !== 4 || !(crop.left < crop.right) || !(crop.top < crop.bottom)) {
      throw new Error('view3D.crop 须完整提供 left、top、right、bottom，且 left < right、top < bottom。');
    }
    if ((typeof view.width === 'number' && crop.right > view.width)
      || (typeof view.height === 'number' && crop.bottom > view.height)) {
      throw new Error('view3D.crop 不能超出完整逻辑视口。');
    }
    view.crop = crop;
  }
  return view;
}

export function buildBody(input: PlaygroundInput) {
  const config = getRenderPlaygroundConfig(input.variant);
  if (!config.modes.includes(input.mode)) throw new Error(`${config.title}不支持 ${input.mode} 视图模式。`);

  const body: Record<string, unknown> = { content: jsonObject(input.content, 'content') };
  if (String(input.slideIndex).trim()) {
    body.slideIndex = numeric(input.slideIndex, 'slideIndex', {
      key: 'slideIndex', help: '', placeholder: '', positive: true, integer: true,
    });
  }
  if (input.template.trim()) body.template = jsonObject(input.template, 'template');
  if (input.transparent) body.transparent = true;

  Object.assign(body, numericFields({ pixelRatio: input.pixelRatio ?? '' }, config.topLevelFields ?? []));
  Object.assign(body, numericFields(input.view2D, config.view2D.topLevelFields));
  if (input.mode === 'auto') return body;

  if (input.mode === '2d') {
    const view = numericFields(input.view2D, config.view2D.fields, `${config.view2D.requestKey}.`);
    const boundCount = ['left', 'right', 'bottom', 'top'].filter(key => key in view).length;
    if (boundCount || config.view2D.fields.some(field => field.required)) {
      validateBounds(view, config.view2D.requestKey);
    }
    body[config.view2D.requestKey] = view;
    return body;
  }

  if (!config.view3D) throw new Error(`${config.title}不支持 3d 视图模式。`);
  body[config.view3D.requestKey] = buildView3D(input, config.view3D.fields);
  return body;
}

export function buildRequest(input: PlaygroundInput) {
  let base: URL;
  try { base = new URL(input.baseUrl.trim()); } catch { throw new Error('Base URL 必须是完整的 HTTP 或 HTTPS 地址。'); }
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new Error('Base URL 仅支持 HTTP / HTTPS，不能包含凭据、查询参数或锚点。');
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (input.authorization.trim()) headers.Authorization = input.authorization.trim();
  if (input.requestId.trim()) headers['x-request-id'] = input.requestId.trim();
  if (Object.values(headers).some(value => /[\r\n]/.test(value))) throw new Error('请求头不能包含换行。');

  const config = getRenderPlaygroundConfig(input.variant);
  return {
    url: `${base.href.replace(/\/$/, '')}${config.endpoint}`,
    headers,
    body: JSON.stringify(buildBody(input), null, 2),
  };
}

export function toCurl(request: ReturnType<typeof buildRequest>) {
  const quote = (s: string) => `'${s.replace(/'/g, `'"'"'`)}'`;
  return [`curl -X POST ${quote(request.url)}`, ...Object.entries(request.headers).map(([key, value]) => `  -H ${quote(`${key}: ${value}`)}`), `  --data-binary ${quote(request.body)}`].join(' \\\n');
}
