export const fields2D = [
  { key: 'left', help: '左边界，逻辑坐标；必填。', placeholder: '-10' },
  { key: 'right', help: '右边界，逻辑坐标；必须大于 left。', placeholder: '10' },
  { key: 'bottom', help: '下边界，逻辑坐标；必填。', placeholder: '-10' },
  { key: 'top', help: '上边界，逻辑坐标；必须大于 bottom。', placeholder: '10' },
  { key: 'scale', help: '每逻辑单位的像素数，正数；留空沿用画板相机缩放。', placeholder: '沿用画板' },
  { key: 'pixelRatio', help: '输出设备像素比，正数；默认 1，只放大物理像素尺寸。', placeholder: '1' },
];
export const fields3D = [
  { key: 'yaw', help: '水平观察角，弧度；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'pitch', help: '俯仰观察角，弧度；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'obliqueAngle', help: '斜投影方向角，弧度；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'obliqueScaleRatio', help: '斜投影退行轴缩放比例，非负；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'scale', help: '相机缩放比例，正数；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'width', help: '逻辑输出宽度，正整数；默认 1024。', placeholder: '1024' },
  { key: 'height', help: '逻辑输出高度，正整数；默认 1024。', placeholder: '1024' },
  { key: 'pixelRatio', help: '输出设备像素比，正数；默认 1，物理宽高 = 逻辑宽高 × 此值。', placeholder: '1' },
];
export interface PlaygroundInput {
  baseUrl: string;
  authorization: string;
  requestId: string;
  content: string;
  template: string;
  slideIndex: string | number;
  mode: 'auto' | '2d' | '3d';
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
function numeric(value: string | number, name: string, positive = false, integer = false) {
  const n = Number(value);
  if (!String(value).trim() || !Number.isFinite(n) || (positive && n <= 0) || (integer && !Number.isInteger(n))) {
    throw new Error(`${name} 必须是${positive ? '正' : '有限'}${integer ? '整数' : '数值'}。`);
  }
  return n;
}
export function buildBody(input: PlaygroundInput) {
  const body: Record<string, unknown> = { content: jsonObject(input.content, 'content') };
  if (String(input.slideIndex).trim()) body.slideIndex = numeric(input.slideIndex, 'slideIndex', true, true);
  if (input.template.trim()) body.template = jsonObject(input.template, 'template');
  if (input.mode !== 'auto') {
    const is2D = input.mode === '2d';
    const name = is2D ? 'view2D' : 'view3D';
    const values = is2D ? input.view2D : input.view3D;
    const view: Record<string, unknown> = {};
    for (const field of is2D ? fields2D : fields3D) {
      const value = String(values[field.key] ?? '');
      if (!value.trim() && !(is2D && ['left', 'right', 'bottom', 'top'].includes(field.key))) continue;
      const n = numeric(value, `${name}.${field.key}`, ['scale', 'pixelRatio', 'width', 'height'].includes(field.key), ['width', 'height'].includes(field.key));
      if (field.key === 'obliqueScaleRatio' && n < 0) throw new Error('view3D.obliqueScaleRatio 必须为非负数。');
      view[field.key] = n;
    }
    if (is2D) {
      if (!(Number(view.left) < Number(view.right)) || !(Number(view.bottom) < Number(view.top))) throw new Error('view2D 必须满足 left < right 且 bottom < top。');
    } else {
      if (input.offset.trim()) {
        let offset: unknown;
        try { offset = JSON.parse(input.offset); } catch { throw new Error('view3D.offset 必须是含 3 个有限数值的 JSON 数组。'); }
        if (!Array.isArray(offset) || offset.length !== 3 || !offset.every(n => typeof n === 'number' && Number.isFinite(n))) throw new Error('view3D.offset 必须是含 3 个有限数值的 JSON 数组。');
        view.offset = offset;
      }
      if (input.projection) {
        if (!['orthographic', 'perspective', 'oblique'].includes(input.projection)) throw new Error('view3D.projection 无效。');
        view.projection = input.projection;
      }
    }
    body[name] = view;
  }
  return body;
}
export function buildRequest(input: PlaygroundInput) {
  let base: URL;
  try { base = new URL(input.baseUrl.trim()); } catch { throw new Error('Base URL 必须是完整的 HTTP 或 HTTPS 地址。'); }
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Base URL 仅支持 HTTP / HTTPS，不能包含凭据、查询参数或锚点。');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (input.authorization.trim()) headers.Authorization = input.authorization.trim();
  if (input.requestId.trim()) headers['x-request-id'] = input.requestId.trim();
  if (Object.values(headers).some(value => /[\r\n]/.test(value))) throw new Error('请求头不能包含换行。');
  return { url: `${base.href.replace(/\/$/, '')}/api/render/v2`, headers, body: JSON.stringify(buildBody(input), null, 2) };
}
export function toCurl(request: ReturnType<typeof buildRequest>) {
  const quote = (s: string) => `'${s.replace(/'/g, `'"'"'`)}'`;
  return [`curl -X POST ${quote(request.url)}`, ...Object.entries(request.headers).map(([key, value]) => `  -H ${quote(`${key}: ${value}`)}`), `  --data-binary ${quote(request.body)}`].join(' \\\n');
}
