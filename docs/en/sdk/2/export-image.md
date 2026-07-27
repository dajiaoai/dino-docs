---
title: Export Images in Editor Mode
description: Export PNG, JPG, or SVG from the SDK editor mode using a viewport, content bounds, or an exact output size, and export LaTeX/TikZ source.
---

# Export Images in Editor Mode

::: tip Try it online
Switch between `view`, `contain`, and `size`, adjust parameters in real time, and preview multiple exported slides.

**[Open the slide image export example →](https://dajiaoai.github.io/algeo-sdk/examples/12-export-slide-image.html)**
:::

Editor mode exports PNG, JPG, or SVG images through
`editor.slides.exportImage(options)`. Starting with **2.10.0**, image export uses
three mutually exclusive modes: `view`, `contain`, and `size`.

To export LaTeX/TikZ source, do not use `exportImage()`. Call
[`editor.slides.exportLatex()`](#export-latextikz) instead.

## Choosing a mode

| Goal | Mode | What determines the output size |
| --- | --- | --- |
| Export an exact world-coordinate viewport | `view` | `viewBounds`, camera `scale`, and `pixelRatio` |
| Include all visible content without fixing the final size | `contain` | Visual content bounds, file camera `scale`, `pixelRatio`, and `padding` |
| Produce an image with exact pixel dimensions | `size` | The specified `width` and `height` |

- Use `view` when you know the world-coordinate region to capture.
- Use `contain` when all content must remain visible and the image may follow the content size.
- Use `size` when an API, layout, or thumbnail requires fixed pixel dimensions.

## Calling the API

```typescript
const images = await editor.slides.exportImage(options);
```

All three modes accept these shared parameters:

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `mode` | `'view' \| 'contain' \| 'size'` | yes | - | Output-size calculation mode |
| `slideIndices` | `number[]` | no | all slides | 1-based indices of slides to export |
| `format` | `'png' \| 'jpg' \| 'svg'` | no | `'png'` | Image format |
| `quality` | `number` | no | `0.92` | JPG quality from `0` to `1`; applies only to JPG |

## view: export a specific viewport

The `view` mode treats `viewBounds` as the world-coordinate region to export.
The camera is centered on that region. Output dimensions are calculated from
the region's world dimensions, camera scale, and pixel ratio.

### Mode-specific parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `viewBounds` | `ExportViewBounds` | yes | - | World-coordinate region to export |
| `pixelRatio` | `number` | no | `1` | Output pixel multiplier; must be greater than `0` |

Fields in `ExportViewBounds`:

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `x` | `number` | yes | - | World-coordinate X of the viewport's top-left corner |
| `y` | `number` | yes | - | World-coordinate Y of the viewport's top-left corner |
| `width` | `number` | yes | - | Width in world units; must be greater than `0` |
| `height` | `number` | yes | - | Height in world units; must be greater than `0` |
| `scale` | `number` | no | slide `camera.scale` | Pixels per world unit; must be greater than `0` |

When `viewBounds.scale` is omitted, the SDK uses the target slide's
`camera.scale` from the file. If the file does not provide it, the SDK uses `50`.

Output dimensions are calculated as follows:

```text
output width = viewBounds.width × scale × pixelRatio
output height = viewBounds.height × scale × pixelRatio
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

This example produces a `1000 × 1000` pixel image.

## contain: include all content

The `contain` mode calculates the visual bounding box of the slide content and
centers the output viewport on it. Visual extensions such as point radii and
label text are included so content is not clipped. Final image dimensions vary
with the content.

If the slide has no calculable content bounds—for example, it contains only
coordinate axes—the original file camera viewport is preserved.

### Mode-specific parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `pixelRatio` | `number` | no | `1` | Output pixel multiplier; must be greater than `0` |
| `padding` | `number \| { horizontal?: number; vertical?: number }` | no | `0` | Padding per side, in final output pixels |

When `padding` is a number, the same value is applied to all four sides. When it
is an object:

- `horizontal` applies to both the left and right sides.
- `vertical` applies to both the top and bottom sides.

Output dimensions are calculated as follows:

```text
output width = content bounds width × camera.scale × pixelRatio + 2 × horizontal
output height = content bounds height × camera.scale × pixelRatio + 2 × vertical
```

`camera.scale` comes from the target slide file and defaults to `50` when absent.

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

## size: export exact dimensions

The `size` mode guarantees that the final image is exactly `width × height`.
After subtracting `minPadding` from the available output area, the SDK
automatically calculates a scale that fits the visual content bounds and
centers the content.

The `size` mode does not accept `pixelRatio`.

### Mode-specific parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `width` | `number` | yes | - | Exact output width in pixels; must be greater than `0` |
| `height` | `number` | yes | - | Exact output height in pixels; must be greater than `0` |
| `minPadding` | `number \| { horizontal?: number; vertical?: number }` | no | `0` | Minimum padding per side, in output pixels |

When `minPadding` is a number, the same value is applied to all four sides. When
it is an object:

- `horizontal` applies to both the left and right sides.
- `vertical` applies to both the top and bottom sides.

The sum of the left and right padding must be less than `width`. The sum of the
top and bottom padding must be less than `height`.

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

## Image export results

`exportImage()` returns `Promise<ExportedSlideImage[]>`. Each item has this shape:

```typescript
interface ExportedSlideImage {
  index: number;
  blob: Blob;
  format: 'png' | 'jpg' | 'svg';
  width: number;
  height: number;
}
```

| Field | Description |
| --- | --- |
| `index` | 1-based slide index |
| `blob` | Exported image data |
| `format` | Actual image format |
| `width` | Image width in pixels |
| `height` | Image height in pixels |

For example, preview the first image in a browser:

```typescript
const [image] = await editor.slides.exportImage({
  mode: 'contain',
  slideIndices: [1],
});

const url = URL.createObjectURL(image.blob);
previewImage.src = url;

// Release the URL when the preview no longer needs it.
previewImage.addEventListener('load', () => URL.revokeObjectURL(url), {
  once: true,
});
```

## Export LaTeX/TikZ

LaTeX/TikZ is text source, not an image format. Do not pass `format: 'latex'` to
`exportImage()`. Use:

```typescript
const items = await editor.slides.exportLatex({
  slideIndices: [1, 3],
  standalone: true,
});
```

### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `slideIndices` | `number[]` | no | all slides | 1-based indices of slides to export |
| `standalone` | `boolean` | no | `true` | `true` returns a complete compilable document; `false` returns only a TikZ fragment |

The return type is `Promise<ExportedLatex[]>`. Each item has this shape:

```typescript
interface ExportedLatex {
  index: number;
  code: string;
}
```
