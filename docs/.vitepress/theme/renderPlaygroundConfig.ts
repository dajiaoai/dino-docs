export type RenderPlaygroundVariant = 'png-v2' | 'png-legacy' | 'svg';
export type RenderViewMode = 'auto' | '2d' | '3d';

export interface NumericField {
  key: string;
  help: string;
  placeholder: string;
  required?: boolean;
  positive?: boolean;
  nonNegative?: boolean;
  integer?: boolean;
}

export interface RenderPlaygroundConfig {
  endpoint: string;
  title: string;
  outputLabel: 'PNG' | 'SVG';
  modes: readonly RenderViewMode[];
  topLevelFields?: readonly NumericField[];
  view2D: {
    requestKey: 'view2D' | 'viewBound';
    fields: readonly NumericField[];
    topLevelFields: readonly NumericField[];
  };
  view3D?: {
    requestKey: 'view3D';
    fields: readonly NumericField[];
  };
}

const boundsFields = [
  { key: 'left', help: '左边界，逻辑坐标；必填。', placeholder: '-10', required: true },
  { key: 'right', help: '右边界，逻辑坐标；必须大于 left。', placeholder: '10', required: true },
  { key: 'bottom', help: '下边界，逻辑坐标；必填。', placeholder: '-10', required: true },
  { key: 'top', help: '上边界，逻辑坐标；必须大于 bottom。', placeholder: '10', required: true },
] as const satisfies readonly NumericField[];

const scaleField = {
  key: 'scale',
  help: '每逻辑单位的像素数，正数；留空沿用画板相机缩放。',
  placeholder: '沿用画板',
  positive: true,
} as const satisfies NumericField;

const pixelRatio2DField = {
  key: 'pixelRatio',
  help: '输出设备像素比，正数；默认 1，只放大物理像素尺寸。',
  placeholder: '1',
  positive: true,
} as const satisfies NumericField;

const fields3D = [
  { key: 'yawDeg', help: '水平观察角，单位为度；显式值优先，其次为已启用固定视图，否则默认 45。', placeholder: '45' },
  { key: 'pitchDeg', help: '俯仰观察角，单位为度；显式值优先，其次为已启用固定视图，否则默认 45。', placeholder: '45' },
  { key: 'obliqueAngleDeg', help: '斜投影方向角，单位为度；显式值优先，其次为已启用固定视图，否则默认 45。', placeholder: '45' },
  { key: 'obliqueScaleRatio', help: '斜投影退行轴缩放比例，非负；留空使用已启用固定视图，否则默认 0.5。', placeholder: '0.5', nonNegative: true },
  { key: 'scale', help: '相机缩放比例，正数；留空使用已启用固定视图，否则默认 0.1。', placeholder: '0.1', positive: true },
  { key: 'width', help: '完整逻辑视口宽度，正整数；留空使用已启用固定视图，否则默认 1920。', placeholder: '1920', positive: true, integer: true },
  { key: 'height', help: '完整逻辑视口高度，正整数；留空使用已启用固定视图，否则默认 1080。', placeholder: '1080', positive: true, integer: true },
  { ...pixelRatio2DField, help: '兼容参数；优先于顶层 pixelRatio，推荐填写顶层参数。' },
] as const satisfies readonly NumericField[];

export const cropFields = [
  { key: 'left', help: '左边界，须大于或等于 0。', placeholder: '0', nonNegative: true },
  { key: 'top', help: '上边界，须大于或等于 0。', placeholder: '0', nonNegative: true },
  { key: 'right', help: '右边界，须大于 left，且不超过完整视口宽度。', placeholder: '1920', positive: true },
  { key: 'bottom', help: '下边界，须大于 top，且不超过完整视口高度。', placeholder: '1080', positive: true },
] as const satisfies readonly NumericField[];

const flat2DModes = ['auto', '2d'] as const satisfies readonly RenderViewMode[];

export const renderPlaygroundConfigs = {
  'png-v2': {
    endpoint: '/api/render/v2',
    title: '导出 PNG',
    outputLabel: 'PNG',
    modes: ['auto', '2d', '3d'],
    topLevelFields: [pixelRatio2DField],
    view2D: {
      requestKey: 'view2D',
      fields: [
        ...boundsFields.map(field => ({ ...field, required: false, help: '逻辑坐标边界；四项须同时填写或全部留空，留空使用固定范围或默认范围。' })),
        { ...scaleField, help: '每逻辑单位的像素数，正数；留空使用固定范围 scale，否则默认 50。', placeholder: '50' },
        { ...pixelRatio2DField, help: '兼容参数；优先于顶层 pixelRatio，推荐填写顶层参数。' },
      ],
      topLevelFields: [],
    },
    view3D: { requestKey: 'view3D', fields: fields3D },
  },
  'png-legacy': {
    endpoint: '/api/render',
    title: '旧版 PNG 接口',
    outputLabel: 'PNG',
    modes: flat2DModes,
    view2D: {
      requestKey: 'viewBound',
      fields: boundsFields,
      topLevelFields: [scaleField, pixelRatio2DField],
    },
  },
  svg: {
    endpoint: '/api/render-svg',
    title: '导出 SVG',
    outputLabel: 'SVG',
    modes: flat2DModes,
    view2D: {
      requestKey: 'viewBound',
      fields: boundsFields,
      topLevelFields: [scaleField],
    },
  },
} as const satisfies Record<RenderPlaygroundVariant, RenderPlaygroundConfig>;

export function getRenderPlaygroundConfig(variant: RenderPlaygroundVariant = 'png-v2'): RenderPlaygroundConfig {
  return renderPlaygroundConfigs[variant];
}
