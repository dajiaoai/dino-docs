---
title: Export PNG
description: HTTP API for exporting PNG, including request parameters, examples, and responses.
---

# Export PNG

**Base URL:** `https://api.dajiaoai.com`

**Endpoint:** `POST /api/render/v2`

The API accepts a project payload conforming to the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol), renders a specified slide, and returns the exported file URL and metadata.

::: info Size units
`view2D` bounds use logical canvas coordinates, `scale` is the number of pixels per logical unit, and the returned `width` and `height` are image pixel dimensions. Visual dimensions such as font sizes and line widths in project content use px. If your source specification uses pt, see [Size Units and Conversion](/en/reference/units).
:::

See [Authentication](/en/api/auth) for authentication details.

Recommended for PNG exports, with support for both 2D and 3D slides.

## Request headers

| Header | Type | Required | Description |
| --- | --- | --- | --- |
| `Authorization` | `string` | yes | Bearer API key in the form `Bearer <API_KEY>`; no default. |
| `Content-Type` | `string` | yes | Set to `application/json`. |
| `x-request-id` | `string` | no | Business request ID; a UUID is generated if omitted. |

## Request body

::: info Rendering mode
`content` is required. `view2D` and `view3D` are mutually exclusive. The service selects 2D or 3D rendering from the target slide and reads the corresponding view parameters. These parameters do not switch the slide type. When omitted, the fixed view or protocol defaults are used.
:::

All numeric parameters must be finite.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | yes | Complete project to render; no default. See the [project file protocol](/en/reference/algeo-file-protocol). |
| `slideIndex` | `number` | no | Target slide index, a positive integer starting at `1`; defaults to `1`. |
| `template` | `object` | no | Render template; if omitted, uses the target slide's existing styles. [Download template data](https://dajiaoai.com/master-templates). |
| `transparent` | `boolean` | no | Whether to skip the background-color fill; defaults to `false`. |
| `pixelRatio` | `number` | no | Output pixel ratio; greater than `0`, defaults to `1` |
| `view2D` | `object` | no | Overrides the 2D viewport. See [2D viewport parameters](#view2d). |
| `view3D` | `object` | no | Overrides the view parameters for a 3D slide. See [3D view parameters](#view3d). |

### view2D: 2D viewport {#view2d}

The four bounds may all be omitted. If any bound is provided, all four are required and must satisfy `left < right` and `bottom < top`. Explicit bounds take priority over the slide’s fixed bounds, then protocol defaults; the editing camera is not inherited.

| Field | Type | Default / Required | Description |
| --- | --- | --- | --- |
| `left` | `number` | All four or none | Left bound in logical coordinates. |
| `right` | `number` | All four or none | Right bound in logical coordinates. |
| `bottom` | `number` | All four or none | Bottom bound in logical coordinates. |
| `top` | `number` | All four or none | Top bound in logical coordinates. |
| `scale` | `number` | Fixed bounds scale, then `50` | Pixels per logical unit; must be greater than `0`. |
| `pixelRatio` | `number` | Top-level value, then `1` | Compatibility parameter; greater than `0`, takes priority over top-level `pixelRatio`. |

`pixelRatio` scales the physical PNG dimensions without changing the logical viewport or camera scale. `scale` uses the explicit value, fixed bounds scale, then `50`. `view2D` may contain only `scale` or `pixelRatio`, or be empty.

When neither explicit bounds nor fixed bounds are available, both X and Y default to `[-10.24, 10.24]`. With default `scale: 50` and `pixelRatio: 1`, the output is **1024 × 1024 pixels**. Overriding only `scale` does not change these default logical bounds.

### view3D: 3D view {#view3d}

For a 3D target slide, `view3D` overrides its export view. All properties are optional.

Each field uses the explicit value, then the enabled fixed 3D view, then the protocol default listed below. Request angles are in degrees; response `camera` angles remain in radians.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `offset` | `[number, number, number]` | `[0, 0, 0]` | World coordinates of the view center. |
| `yawDeg` | `number` | `45` | Horizontal viewing angle in degrees. |
| `pitchDeg` | `number` | `45` | Vertical viewing angle in degrees. |
| `projection` | `string` | `orthographic` | `orthographic`, `perspective`, or `oblique`. |
| `obliqueAngleDeg` | `number` | `45` | Oblique projection direction angle in degrees. |
| `obliqueScaleRatio` | `number` | `0.5` | Receding-axis ratio; greater than or equal to `0`. |
| `scale` | `number` | `0.1` | Camera scale; greater than `0`. |
| `width` | `integer` | `1920` | Full logical viewport width; positive integer. |
| `height` | `integer` | `1080` | Full logical viewport height; positive integer. |
| `crop` | `object` | No cropping | Crop rectangle; see below. An enabled fixed-view crop is inherited when omitted. |
| `pixelRatio` | `number` | Top-level value, then `1` | Compatibility parameter; greater than `0`, takes priority over top-level `pixelRatio`. |

`crop` uses logical viewport coordinates with the origin at the top left. All four fields are required: `left`, `top`, `right`, and `bottom`. They must satisfy `0 <= left < right <= width` and `0 <= top < bottom <= height`. The full viewport is rendered before cropping; cropping does not change the camera framing.

Without cropping, physical PNG dimensions = full logical viewport dimensions × effective `pixelRatio`. For example, `width: 960`, `height: 540`, and top-level `pixelRatio: 2` produce **1920 × 1080 pixels**. With cropping, the output dimensions are `(right - left) × pixelRatio` and `(bottom - top) × pixelRatio`.

::: warning PNG size limit
For both 2D and 3D exports, the final physical PNG width and height must each be at most **2048 pixels**. For 3D exports with cropping, this limit applies to the **cropped physical output**, not the full logical viewport. 
:::

## Request examples

Save a complete project exported from the website or SDK as `project.algeo`. These examples use `jq` to wrap the project as `content`. The 3D example requires slide `1` to be a 3D slide.

Render using the target slide type and its fixed view or protocol defaults:

```bash
jq '{content: ., slideIndex: 1}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

Override the 2D viewport:

```bash
jq '{
  content: .,
  slideIndex: 1,
  pixelRatio: 1,
  view2D: {
    left: -10,
    right: 10,
    bottom: -10,
    top: 10,
    scale: 50
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

Override the 3D view:

```bash
jq '{
  content: .,
  slideIndex: 1,
  pixelRatio: 1,
  view3D: {
    width: 1280,
    height: 720,
    projection: "orthographic",
    yawDeg: 45,
    pitchDeg: 45
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

## Success response

A successful 2D render returns `200 OK`. For the explicit 2D viewport example above:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "slideIndex": 1,
  "viewBound": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10
  },
  "width": 1000,
  "height": 1000,
  "scale": 50,
  "pixelRatio": 1,
  "mimeType": "image/png",
  "size": 24831
}
```

Both 2D and 3D responses include the effective `pixelRatio`. A successful 3D render also returns `200 OK`, with the actual `camera` parameters instead of the 2D `viewBound` and `scale` fields:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "slideIndex": 1,
  "width": 1280,
  "height": 720,
  "pixelRatio": 1,
  "camera": {
    "offset": [0, 0, 0],
    "yaw": 0.7853981633974483,
    "pitch": 0.7853981633974483,
    "projection": "orthographic",
    "obliqueAngle": 0.7853981633974483,
    "obliqueScaleRatio": 0.5,
    "scale": 0.1
  },
  "mimeType": "image/png",
  "size": 24831
}
```

Response `width` and `height` are the final physical PNG dimensions after any cropping. Request `view3D.width` and `view3D.height` describe the full logical viewport. The effective pixel ratio is `view3D.pixelRatio`, then top-level `pixelRatio`, then `1`. Response `camera.yaw`, `camera.pitch`, and `camera.obliqueAngle` remain in radians.

For existing `/api/render` integrations, see the [legacy endpoint and migration guide](./api-render).

## Error responses

| HTTP status | Condition |
| --- | --- |
| `400` | Both `view2D` and `view3D` are provided, or a field fails schema validation (for example, `crop: null`). |
| `422` / `RENDER_INVALID_REQUEST` | View type does not match the target slide, resolved bounds or crop are invalid, or the final physical PNG width or height exceeds `2048`. |

See [render error responses](./render#error-responses).
