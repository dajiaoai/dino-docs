---
title: 编辑模式导出图片
description: 使用 SDK 编辑模式按指定视野、内容包围盒或固定尺寸导出 PNG、JPG、SVG，以及导出 LaTeX/TikZ。
---

# 编辑模式导出图片

::: tip 在线体验
在交互示例中切换 `view`、`contain`、`size` 三种模式，实时调整参数并预览多画板导出效果。

**[打开画板图片导出示例 →](https://dajiaoai.github.io/algeo-sdk/examples/12-export-slide-image.html)**
:::

编辑模式通过 `editor.slides.exportImage(options)` 导出 PNG、JPG 或 SVG 图片。
从 **2.10.0** 起，图片导出使用 `view`、`contain`、`size` 三种互斥模式。

如果需要 LaTeX/TikZ 源码，不要使用 `exportImage()`，请调用
[`editor.slides.exportLatex()`](#导出-latex-tikz)。

## 三种模式如何选择

| 需求 | 模式 | 输出尺寸由什么决定 |
| --- | --- | --- |
| 精确导出一块世界坐标视野 | `view` | `viewBounds`、相机 `scale` 与 `pixelRatio` |
| 完整包住画板内容，不限定最终宽高 | `contain` | 内容可视包围盒、文件相机 `scale`、`pixelRatio` 与 `padding` |
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
| `format` | `'png' \| 'jpg' \| 'svg'` | 否 | `'png'` | 图片格式 |
| `quality` | `number` | 否 | `0.92` | JPG 质量，范围为 `0～1`，仅对 JPG 生效 |

## view：按指定视野导出

`view` 模式将 `viewBounds` 作为要导出的世界坐标区域。相机中心会对准该区域中心，
输出宽高根据区域的世界坐标尺寸、相机缩放比例和像素倍率计算。

### 专属参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `viewBounds` | `ExportViewBounds` | 是 | - | 要导出的世界坐标区域 |
| `pixelRatio` | `number` | 否 | `1` | 输出像素倍率，必须大于 `0` |

`ExportViewBounds` 的字段：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `number` | 是 | - | 视野左上角的世界坐标 X |
| `y` | `number` | 是 | - | 视野左上角的世界坐标 Y |
| `width` | `number` | 是 | - | 世界坐标宽度，必须大于 `0` |
| `height` | `number` | 是 | - | 世界坐标高度，必须大于 `0` |
| `scale` | `number` | 否 | 画板 `camera.scale` | 每个世界坐标单位对应的像素数，必须大于 `0` |

省略 `viewBounds.scale` 时，SDK 使用目标画板文件中的 `camera.scale`；如果文件中也
没有该值，则使用 `50`。

输出尺寸计算如下：

```text
输出宽度 = viewBounds.width × scale × pixelRatio
输出高度 = viewBounds.height × scale × pixelRatio
```

```typescript
const images = await editor.slides.exportImage({
  mode: 'view',
  slideIndices: [1],
  format: 'png',
  viewBounds: {
    x: -5,
    y: -5,
    width: 10,
    height: 10,
    scale: 50,
  },
  pixelRatio: 2,
});
```

以上示例输出 `1000 × 1000` 像素的图片。

## contain：完整包住内容

`contain` 模式计算画板内容的可视包围盒，并让输出视野以内容为中心。它会考虑圆点、
标签文本等视觉外扩，避免内容被裁切。最终图片尺寸随内容变化。

如果画板没有可计算的内容包围盒，例如只有坐标轴，则完整保留文件相机的原始视口。

### 专属参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pixelRatio` | `number` | 否 | `1` | 输出像素倍率，必须大于 `0` |
| `padding` | `number \| { horizontal?: number; vertical?: number }` | 否 | `0` | 每侧留白，单位为最终输出像素 |

`padding` 传入数字时，四个方向使用相同值。传入对象时：

- `horizontal` 同时应用于左侧和右侧。
- `vertical` 同时应用于顶部和底部。

输出尺寸计算如下：

```text
输出宽度 = 内容包围盒宽度 × camera.scale × pixelRatio + 2 × horizontal
输出高度 = 内容包围盒高度 × camera.scale × pixelRatio + 2 × vertical
```

`camera.scale` 来自目标画板文件；文件中未提供时使用 `50`。

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

`size` 模式保证最终图片严格等于指定的 `width × height`。SDK 从输出区域中扣除
`minPadding` 后，根据内容可视包围盒自动计算缩放比例，使内容完整放入可用区域并居中。

`size` 模式不接收 `pixelRatio`。

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

LaTeX/TikZ 是文本源码，不属于图片格式。不要向 `exportImage()` 传入
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
