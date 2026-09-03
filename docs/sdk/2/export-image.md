---
title: 编辑模式导出图片
description: 使用 SDK 编辑模式按指定视野、内容包围盒或固定尺寸导出图片，以及导出 LaTeX/TikZ。
---

# 编辑模式导出图片

::: tip 在线体验
在交互示例中切换 `view`、`contain`、`size` 三种模式，实时调整参数并预览多画板导出效果。

**[打开画板图片导出示例 →](https://dajiaoai.github.io/algeo-sdk/examples/12-export-slide-image.html)**
:::

编辑模式通过 `editor.slides.exportImage(options)` 导出图片。2D 画板支持 PNG、JPG、SVG；
3D 画板仅支持 PNG、JPG。
从 **2.10.0** 起，图片导出使用 `view`、`contain`、`size` 三种互斥模式。

如果需要 LaTeX/TikZ 源码，不要使用 `exportImage()`，请调用
[`editor.slides.exportLatex()`](#导出-latex-tikz)。

::: warning 旧版参数已废弃
**2.13.0 前**使用的 `viewBounds: { x, y, width, height }` 已废弃。建议升级到 SDK **2.13.0 或更高版本**，并迁移为 `viewBound: { left, top, right, bottom }`。旧参数目前仅为兼容已有集成而保留。
:::

## 三种模式如何选择

| 需求 | 模式 | 输出尺寸由什么决定 |
| --- | --- | --- |
| 精确导出指定视图 | `view` | 2D 使用世界坐标 `viewBound`；3D 使用相机与输出尺寸 `viewCamera3d` |
| 完整包住画板内容，不限定最终宽高 | `contain` | 内容包围盒、两侧边距与放大/缩小倍率 |
| 得到严格指定宽高的图片 | `size` | 指定的 `width` 和 `height` |

- 已知要截取的世界坐标范围时，使用 `view`。
- 希望内容完整显示，并让图片尺寸跟随内容时，使用 `contain`。
- 接口、排版或缩略图要求固定像素尺寸时，使用 `size`。

## 调用方式

```typescript
const images = await editor.slides.exportImage(options);
```

每个模式都可以使用以下公共参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `mode` | `'view' \| 'contain' \| 'size'` | 是 | - | 尺寸计算模式 |
| `slideIndices` | `number[]` | 否 | 全部画板 | 要导出的画板，使用 1-based 索引 |
| `format` | `'png' \| 'jpg' \| 'svg'` | 否 | `'png'` | 图片格式；3D 画板仅支持 `'png'`、`'jpg'` |
| `quality` | `number` | 否 | `0.92` | JPG 质量，范围为 `0～1`，仅对 JPG 生效 |

## view：按指定视野导出

`view` 模式按画板类型选择相应参数：2D 使用 `viewBound`，3D 使用 `viewCamera3d`。
一个请求可以同时提供两者，便于批量导出混合 2D/3D 画板；SDK 会对每张画板自动读取适用参数。

- 目标为 2D 画板但未提供 `viewBound` 时会报错。
- 目标为 3D 画板但未提供 `viewCamera3d` 时会报错。

### 专属参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `viewBound` | `ExportViewBound` | 2D 时是 | - | 2D 画板要导出的世界坐标区域 |
| `viewCamera3d` | `ExportViewCamera3D` | 3D 时是 | - | 3D 画板的导出相机与视野 |
| `pixelRatio` | `number` | 否 | `1` | 输出像素倍率，必须大于 `0` |

### 2D：`viewBound`

`ExportViewBound` 的字段：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `left` | `number` | 是 | - | 视野左边界的世界坐标 |
| `top` | `number` | 是 | - | 视野上边界的世界坐标 |
| `right` | `number` | 是 | - | 视野右边界的世界坐标，必须大于 `left` |
| `bottom` | `number` | 是 | - | 视野下边界的世界坐标，必须小于 `top` |
| `scale` | `number` | 否 | 画板 `camera.scale` | 每个世界坐标单位对应的像素数，必须大于 `0` |

2D 中，`scale` 表示 **每个世界坐标单位对应多少逻辑像素**。在 `viewBound` 不变时，
增大 `scale` 会按相同比例增大导出图片的宽高和图形像素尺寸，但不会改变所见的世界坐标范围；
例如视野宽度为 `10`、`scale` 为 `50` 时，逻辑输出宽度为 `500px`。

2D 输出尺寸计算如下：

```text
输出宽度 = (viewBound.right - viewBound.left) × scale × pixelRatio
输出高度 = (viewBound.top - viewBound.bottom) × scale × pixelRatio
```

```typescript
const images = await editor.slides.exportImage({
  mode: 'view',
  slideIndices: [1],
  format: 'png',
  viewBound: {
    left: -5,
    top: 5,
    right: 5,
    bottom: -5,
    scale: 50,
  },
  pixelRatio: 2,
});
```

以上示例输出 `1000 × 1000` 像素的图片。

### 3D：`viewCamera3d`

`ExportViewCamera3D` 的字段：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `width` | `number` | 否 | `1024` | 逻辑输出宽度（px），必须为正整数 |
| `height` | `number` | 否 | `1024` | 逻辑输出高度（px），必须为正整数 |
| `offset` | `[number, number, number]` | 否 | 画板 `camera3d.offset` | 相机中心的世界坐标 |
| `yaw` | `number` | 否 | 画板 `camera3d.yaw` | 水平旋转角，单位为弧度 |
| `pitch` | `number` | 否 | 画板 `camera3d.pitch` | 俯仰角，单位为弧度 |
| `scale` | `number` | 否 | 画板 `camera3d.scale` | 3D 相机缩放；值越大，视野越近、可见世界范围越小 |

未提供的相机字段均从目标画板文件读取。

3D 中，`scale` 表示 **相机的镜头远近/可见范围**，不是“每世界单位的像素数”。值越大，
相机越接近内容、可见世界范围越小；值越小则相机拉远、可见范围越大。它会改变画面构图。
如只需提高导出清晰度，请保持 `scale` 不变并增大 `pixelRatio`。

```typescript
const images = await editor.slides.exportImage({
  mode: 'view',
  slideIndices: [2],
  format: 'png',
  viewCamera3d: {
    width: 1200,
    height: 800,
    // 以下字段可选；留空时读取画板文件中的相机配置。
    offset: [0, 0, 0],
    yaw: Math.PI / 4,
    pitch: Math.PI / 6,
  },
  pixelRatio: 2,
});
```

## contain：完整包住内容

`contain` 模式计算画板内容的可视包围盒，并让输出视野以内容为中心。2D 会考虑圆点、
标签文本等视觉外扩；3D 会计算可见 3D 图元的完整投影范围（包括当前视口外的有限图元），
避免内容被裁切。最终图片尺寸随内容变化。

如果画板没有可计算的内容包围盒，例如只有坐标轴，则完整保留文件相机的原始视口。

### 专属参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pixelRatio` | `number` | 否 | `1` | 输出像素倍率，必须大于 `0` |
| `padding` | `number \| { horizontal?: number; vertical?: number }` | 否 | `0` | 每侧留白，单位为最终输出像素 |

`padding` 传入数字时，四个方向使用相同值。传入对象时：

- `horizontal` 同时应用于左侧和右侧。
- `vertical` 同时应用于顶部和底部。

2D 输出尺寸计算如下：

```text
输出宽度 = 内容包围盒宽度 × camera.scale × pixelRatio + 2 × horizontal
输出高度 = 内容包围盒高度 × camera.scale × pixelRatio + 2 × vertical
```

2D 的 `camera.scale` 来自目标画板文件；文件中未提供时使用 `50`。3D 则沿用画板的
`camera3d` 视角和缩放，并以投影包围盒决定画幅；`pixelRatio` 只影响最终分辨率。

```typescript
const images = await editor.slides.exportImage({
  mode: 'contain',
  slideIndices: [1, 2],
  format: 'svg',
  pixelRatio: 1,
  padding: {
    horizontal: 24,
    vertical: 16,
  },
});
```

## size：按固定尺寸导出

`size` 模式保证最终图片严格等于指定的 `width × height`。

### 专属参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `width` | `number` | 是 | - | 最终输出宽度，单位为像素，必须大于 `0` |
| `height` | `number` | 是 | - | 最终输出高度，单位为像素，必须大于 `0` |
| `minPadding` | `number \| { horizontal?: number; vertical?: number }` | 否 | `0` | 每侧最小留白，单位为输出像素 |

`minPadding` 传入数字时，四个方向使用相同值。传入对象时：

- `horizontal` 同时应用于左侧和右侧。
- `vertical` 同时应用于顶部和底部。

水平留白的两侧之和必须小于 `width`，垂直留白的两侧之和必须小于 `height`。

```typescript
const images = await editor.slides.exportImage({
  mode: 'size',
  slideIndices: [1],
  format: 'jpg',
  width: 1200,
  height: 900,
  minPadding: {
    horizontal: 40,
    vertical: 32,
  },
  quality: 0.92,
});
```

## 图片导出结果

`exportImage()` 返回 `Promise<ExportedSlideImage[]>`。每个元素的结构如下：

```typescript
interface ExportedSlideImage {
  index: number;
  blob: Blob;
  format: 'png' | 'jpg' | 'svg';
  width: number;
  height: number;
}
```

| 字段 | 说明 |
| --- | --- |
| `index` | 画板的 1-based 索引 |
| `blob` | 导出的图片数据 |
| `format` | 实际图片格式 |
| `width` | 图片像素宽度 |
| `height` | 图片像素高度 |

例如，在浏览器中预览第一张图片：

```typescript
const [image] = await editor.slides.exportImage({
  mode: 'contain',
  slideIndices: [1],
});

const url = URL.createObjectURL(image.blob);
previewImage.src = url;

// 不再使用预览时释放 URL。
previewImage.addEventListener('load', () => URL.revokeObjectURL(url), {
  once: true,
});
```

## 导出 LaTeX/TikZ

LaTeX/TikZ 是文本源码，不属于图片格式，且目前仅支持 2D 画板。不要向 `exportImage()` 传入
`format: 'latex'`，应使用：

```typescript
const items = await editor.slides.exportLatex({
  slideIndices: [1, 3],
  standalone: true,
});
```

### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `slideIndices` | `number[]` | 否 | 全部画板 | 要导出的画板，使用 1-based 索引 |
| `standalone` | `boolean` | 否 | `true` | `true` 返回可独立编译的完整文档；`false` 仅返回 TikZ 片段 |

返回值类型为 `Promise<ExportedLatex[]>`，每个元素结构为：

```typescript
interface ExportedLatex {
  index: number;
  code: string;
}
```
