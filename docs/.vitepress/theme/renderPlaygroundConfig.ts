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
  { key: 'yaw', help: '水平观察角，弧度；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'pitch', help: '俯仰观察角，弧度；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'obliqueAngle', help: '斜投影方向角，弧度；留空沿用画板。', placeholder: '沿用画板' },
  { key: 'obliqueScaleRatio', help: '斜投影退行轴缩放比例，非负；留空沿用画板。', placeholder: '沿用画板', nonNegative: true },
  { key: 'scale', help: '相机缩放比例，正数；留空沿用画板。', placeholder: '沿用画板', positive: true },
  { key: 'width', help: '逻辑输出宽度，正整数；默认 1024。', placeholder: '1024', positive: true, integer: true },
  { key: 'height', help: '逻辑输出高度，正整数；默认 1024。', placeholder: '1024', positive: true, integer: true },
  { key: 'pixelRatio', help: '输出设备像素比，正数；默认 1，物理宽高 = 逻辑宽高 × 此值。', placeholder: '1', positive: true },
] as const satisfies readonly NumericField[];

const flat2DModes = ['auto', '2d'] as const satisfies readonly RenderViewMode[];

export const renderPlaygroundConfigs = {
  'png-v2': {
    endpoint: '/api/render/v2',
    title: '导出 PNG',
    outputLabel: 'PNG',
    modes: ['auto', '2d', '3d'],
    view2D: {
      requestKey: 'view2D',
      fields: [...boundsFields, scaleField, pixelRatio2DField],
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
