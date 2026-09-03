---
title: Export Images in Editor Mode
description: Export images from the SDK editor mode using a viewport, content bounds, or an exact output size, and export LaTeX/TikZ source.
---

# Export Images in Editor Mode

::: tip Try it online
Switch between `view`, `contain`, and `size`, adjust parameters in real time, and preview multiple exported slides.

**[Open the slide image export example →](https://dajiaoai.github.io/algeo-sdk/examples/12-export-slide-image.html)**
:::

Editor mode exports images through `editor.slides.exportImage(options)`. 2D slides support PNG, JPG, and SVG; 3D slides support PNG and JPG only.
Starting with **2.10.0**, image export uses
three mutually exclusive modes: `view`, `contain`, and `size`.

To export LaTeX/TikZ source, do not use `exportImage()`. Call
[`editor.slides.exportLatex()`](#export-latextikz) instead.

::: warning Deprecated legacy parameter
The pre-**2.13.0** `viewBounds: { x, y, width, height }` parameter is deprecated. Upgrade to SDK **2.13.0 or later** and migrate to `viewBound: { left, top, right, bottom }`. The legacy parameter remains only for existing integrations.
:::

## Choosing a mode

| Goal | Mode | What determines the output size |
| --- | --- | --- |
| Export a specific view | `view` | World-coordinate `viewBound` for 2D; camera and output dimensions in `viewCamera3d` for 3D |
| Include all visible content without fixing the final size | `contain` | Content bounds, padding on both sides, and the scaling factor |
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
| `format` | `'png' \| 'jpg' \| 'svg'` | no | `'png'` | Image format; 3D slides support only `'png'` and `'jpg'` |
| `quality` | `number` | no | `0.92` | JPG quality from `0` to `1`; applies only to JPG |

## view: export a specific viewport

The `view` mode selects parameters by slide type: use `viewBound` for 2D and
`viewCamera3d` for 3D. A request may provide both parameters to export a mixed
batch of 2D and 3D slides; the SDK selects the applicable parameter for each slide.

- A 2D slide requires `viewBound`.
- A 3D slide requires `viewCamera3d`.

### Mode-specific parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `viewBound` | `ExportViewBound` | yes, for 2D | - | World-coordinate region to export from a 2D slide |
| `viewCamera3d` | `ExportViewCamera3D` | yes, for 3D | - | Export camera and viewport for a 3D slide |
| `pixelRatio` | `number` | no | `1` | Output pixel multiplier; must be greater than `0` |

### 2D: `viewBound`

Fields in `ExportViewBound`:

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `left` | `number` | yes | - | World-coordinate left boundary |
| `top` | `number` | yes | - | World-coordinate top boundary |
| `right` | `number` | yes | - | World-coordinate right boundary; must be greater than `left` |
| `bottom` | `number` | yes | - | World-coordinate bottom boundary; must be less than `top` |
| `scale` | `number` | no | slide `camera.scale` | Pixels per world unit; must be greater than `0` |

In 2D, `scale` is the **number of logical pixels per world unit**. With the same
`viewBound`, increasing `scale` proportionally increases the exported image
dimensions and the pixel size of its content, but does not change the visible
world-coordinate region. For example, a viewport width of `10` with `scale: 50`
has a logical output width of `500px`.

Output dimensions are calculated as follows:

```text
output width = (viewBound.right - viewBound.left) × scale × pixelRatio
output height = (viewBound.top - viewBound.bottom) × scale × pixelRatio
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

This example produces a `1000 × 1000` pixel image.

### 3D: `viewCamera3d`

Fields in `ExportViewCamera3D`:

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `width` | `number` | no | `1024` | Logical output width (px); must be a positive integer |
| `height` | `number` | no | `1024` | Logical output height (px); must be a positive integer |
| `offset` | `[number, number, number]` | no | slide `camera3d.offset` | Camera-center world coordinates |
| `yaw` | `number` | no | slide `camera3d.yaw` | Horizontal rotation angle in radians |
| `pitch` | `number` | no | slide `camera3d.pitch` | Pitch angle in radians |
| `scale` | `number` | no | slide `camera3d.scale` | 3D camera scale; larger values zoom in and reduce the visible world range |

Any omitted camera field is read from the target slide file.

In 3D, `scale` controls **camera distance and visible range**, not the number of
pixels per world unit. A larger value moves the camera closer and shows a smaller
world range; a smaller value moves it farther away and shows a larger range. It
changes the composition. To increase export sharpness, keep `scale` unchanged and
increase `pixelRatio`.

```typescript
const images = await editor.slides.exportImage({
  mode: 'view',
  slideIndices: [2],
  format: 'png',
  viewCamera3d: {
    width: 1200,
    height: 800,
    // These fields are optional and fall back to the slide camera when omitted.
    offset: [0, 0, 0],
    yaw: Math.PI / 4,
    pitch: Math.PI / 6,
  },
  pixelRatio: 2,
});
```

## contain: include all content

The `contain` mode calculates the visual bounding box of the slide content and
centers the output viewport on it. For 2D, visual extensions such as point radii
and label text are included. For 3D, the complete projected extent of visible 3D
primitives is used, including finite primitives outside the current viewport.
Final image dimensions vary with the content.

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

For 2D, output dimensions are calculated as follows:

```text
output width = content bounds width × camera.scale × pixelRatio + 2 × horizontal
output height = content bounds height × camera.scale × pixelRatio + 2 × vertical
```

For 2D, `camera.scale` comes from the target slide file and defaults to `50` when absent. For 3D, the slide's `camera3d` view and scale are retained, the projected content bounds determine the canvas, and `pixelRatio` affects only final resolution.

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

LaTeX/TikZ is text source, not an image format, and currently supports 2D slides only. Do not pass `format: 'latex'` to
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
