---
title: 编辑模式导出图片
description: 使用 SDK 编辑模式按指定视野、内容包围盒或固定尺寸导出图片，以及导出 LaTeX/TikZ。
---

# 编辑模式导出图片

::: tip 在线体验
在交互示例中切换 `view`、`contain`、`size` 三种模式，实时调整参数并预览导出效果。

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
| `transparent` | `boolean` | 否 | `false` | 是否跳过背景色填充；从 `2.14.0` 开始支持，仅 PNG、SVG 支持 |


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

`viewCamera3d` 必须提供，但允许传入 `{}`。未提供的字段按以下规则补齐：

- 目标画板已启用固定视图时，以该固定视图为基础。
- 未启用或没有固定视图时，使用目标画板的 `camera3d` 参数；逻辑视口默认 `1024 × 1024`，默认不截取。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `width` | `number` | 否 | 完整逻辑视口宽高（px），必须为正整数 |
| `height` | `number` | 否 | 完整逻辑视口宽高（px），必须为正整数 |
| `offset` | `[number, number, number]` | 否 | 相机中心的世界坐标 |
| `yaw` | `number` | 否 | 水平旋转角，单位为弧度 |
| `pitch` | `number` | 否 | 俯仰角，单位为弧度 |
| `scale` | `number` | 否 | 3D 相机缩放；值越大，视野越近、可见世界范围越小 |
| `projection` | `'orthographic' \| 'perspective' \| 'oblique'` | 否 | 正交、透视或斜投影 |
| `obliqueAngle` | `number` | 否 | 斜投影方向角，单位为弧度 |
| `obliqueScaleRatio` | `number` | 否 | 斜投影退行轴缩放比，必须大于或等于 0 |
| `cropEnabled` | `boolean` | 否 | 是否启用截取；设为 `false` 可覆盖已保存的截取开关 |
| `crop` | `{ left, top, right, bottom }` | 否 | 完整逻辑视口内的截取范围，单位为逻辑像素。截取坐标以完整视口左上角为原点，X 向右、Y 向下。 |


3D 中，`scale` 表示 **相机的镜头远近/可见范围**。值越大，
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
    // 以下字段可选；省略时使用目标画板的视图基础参数。
    offset: [0, 0, 0],
    yaw: Math.PI / 4,
    pitch: Math.PI / 6,
  },
  pixelRatio: 2,
});
```

### 读取固定视图后导出

`getViewCamera3d()` 优先返回目标画板已启用的固定视图；未启用或没有配置时返回画板相机已有参数，不读取已关闭但保留的配置。

| 目标画板状态 | 读取来源 | `getViewCamera3d()` 返回内容 |
| --- | --- | --- |
| 3D，固定视图已启用且有配置 | 已启用的固定视图 | 完整相机参数、逻辑宽高及截取配置 |
| 3D，固定视图已关闭或没有配置 | 目标画板的 `camera3d` | 已有相机参数；省略 `width`、`height`、`crop` |
| 2D | 不读取 3D 视图 | `null` |

关闭固定视图后，已保存的配置仍可在重新启用时复用，但不参与本次视图读取或 `contain` / `size` 导出。

返回值的角度单位为**度**，字段名为 `yawDeg`、`pitchDeg`、`obliqueAngleDeg`；单次图片导出的对应字段使用**弧度**，需要显式转换。

```typescript
const info = await editor.slides.getInfo(0);
const view = await editor.slides.getViewCamera3d(info.index);
if (view) {
  const radians = (degrees: number | undefined) =>
    degrees === undefined ? undefined : degrees * Math.PI / 180;
  const images = await editor.slides.exportImage({
    mode: 'view',
    slideIndices: [info.exportIndex],
    format: 'png',
    pixelRatio: 2,
    viewCamera3d: {
      offset: view.offset,
      yaw: radians(view.yawDeg),
      pitch: radians(view.pitchDeg),
      scale: view.scale,
      projection: view.projection,
      obliqueAngle: radians(view.obliqueAngleDeg),
      obliqueScaleRatio: view.obliqueScaleRatio,
      width: view.width,
      height: view.height,
      cropEnabled: view.crop !== undefined && view.crop !== null,
      ...(view.crop ? { crop: view.crop } : {}),
    },
  });
}
```

固定视图未启用或没有配置时，读取结果不含 `width`、`height`、`crop`，上述调用使用默认逻辑视口且不截取。
如需保存后复用该视角，使用 `setViewCamera3d`。

## contain：完整包住内容

`contain` 模式计算画板内容的可视包围盒，并让输出视野以内容为中心。2D 会考虑圆点、
标签文本等视觉外扩；3D 会计算可见 3D 图元的完整投影范围（包括当前视口外的有限图元），
避免内容被裁切。最终图片尺寸随内容变化。

如果没有可计算的内容包围盒，则保留基础相机视口；3D 目标画板未启用固定视图且视口尚未初始化时，使用 `1024 × 1024` 的逻辑视口。

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

2D 的 `camera.scale` 来自目标画板文件；文件中未提供时使用 `50`。

3D 的 `contain` / `size` 均逐张读取目标画板的视图参数：优先使用已启用的固定视图；未启用或没有配置时使用该画板的 `camera3d`，不读取已关闭但保留的配置。

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

`size` 模式保证最终图片严格等于指定的 `width × height`。内容保持比例，居中放入扣除最小留白后的区域；3D 的视图参数与 `contain` 使用相同的目标画板读取规则。

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
