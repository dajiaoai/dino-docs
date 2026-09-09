---
title: Render API
description: Describe the Dino Geometry Open Platform HTTP render API that supports PNG, SVG, and TikZ exports.
---

# Render API

**Base URL: `https://api.dajiaoai.com`**

The API accepts a project payload conforming to the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol), renders a specified slide, and returns the exported file URL and metadata.

::: info Size units
`viewBound` uses logical canvas coordinates, `scale` is the number of pixels per logical unit, and the returned `width` and `height` are image pixel dimensions. Visual dimensions such as font sizes and line widths in project content use px. If your source specification uses pt, see [Size Units and Conversion](/en/reference/units).
:::

## Overview

| Description | Path | Method | Supports |
| --- | --- | --- | --- |
| Export PNG | `/api/render/v2` | `POST` | 2D, 3D |
| Export SVG | `/api/render-svg` | `POST` | 2D |
| Export TikZ/TeX | `/api/render-tikz` | `POST` | 2D |

::: warning Use the new PNG endpoint
Use `POST /api/render/v2` for PNG exports. Existing integrations using `/api/render` can refer to the [legacy endpoint and migration guide](./api-render).
:::

See [Authentication](/en/api/auth) for auth and [API Billing](/en/api/pricing) for billing.

## Export PNG `POST /api/render/v2` {#render-v2}

Recommended for PNG exports, with support for both 2D and 3D slides.

### Request headers

| Header | Type | Required | Description |
| --- | --- | --- | --- |
| `Authorization` | `string` | yes | Bearer API key in the form `Bearer <API_KEY>`; no default. |
| `Content-Type` | `string` | yes | Set to `application/json`. |
| `x-request-id` | `string` | no | Business request ID; a UUID is generated if omitted. |

### Request body

`view2D` and `view3D` are mutually exclusive. When both are omitted, the selected slide's saved camera mode and parameters are used. `?` in the object definitions marks an optional property; numeric values must be finite.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | yes | Complete project to render; no default. See the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol). |
| `slideIndex` | `number` | no | Target slide index, a positive integer starting at `1`; defaults to `1`. |
| `template` | `object` | no | Render template; if omitted, uses the target slide's existing styles. Download data from the [templates page](https://dajiaoai.com/master-templates). |
| `view2D` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`  scale?: number;`<br>`  pixelRatio?: number;`<br>`}` | no | Overrides the 2D viewport. `left`, `right`, `bottom`, and `top` are logical bounds with no defaults when the object is provided; requires `left < right` and `bottom < top`.<br>`scale` is pixels per logical unit, must be positive, and defaults to the target camera scale.<br>`pixelRatio` is an optional positive output pixel ratio, defaults to `1`, and scales the physical PNG dimensions without changing the logical viewport or camera scale. |
| `view3D` | `{`<br>`  offset?: [number, number, number];`<br>`  yaw?: number;`<br>`  pitch?: number;`<br>`  projection?: "orthographic" \| "perspective" \| "oblique";`<br>`  obliqueAngle?: number;`<br>`  obliqueScaleRatio?: number;`<br>`  scale?: number;`<br>`  width?: number;`<br>`  height?: number;`<br>`  pixelRatio?: number;`<br>`}` | no | Forces 3D rendering and overrides the target slide's 3D camera; all properties are optional.<br>`offset`: camera center; `yaw` / `pitch`: horizontal / vertical viewing angles in radians; `projection`: projection mode; `obliqueAngle`: oblique direction in radians; `obliqueScaleRatio`: nonnegative foreshortening ratio; `scale`: positive camera scale. These properties default to the target slide's saved 3D camera values.<br>`width` / `height`: positive integer logical output dimensions, each defaulting to `1024`.<br>`pixelRatio`: positive output pixel ratio, defaults to `1` and multiplies the logical dimensions to produce the physical PNG dimensions. |

### Request examples

Save a complete project exported from the website or SDK as `project.algeo`. These examples use `jq` to wrap the project as `content`. The 3D example requires slide `1` to be a 3D slide.

Render using the saved camera:

```bash
jq '{content: ., slideIndex: 1}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

Override the 2D viewport:

```bash
jq '{content: ., slideIndex: 1, view2D: {left: -10, right: 10, bottom: -10, top: 10, scale: 50, pixelRatio: 1}}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

Override the 3D view:

```bash
jq '{content: ., slideIndex: 1, view3D: {width: 1280, height: 720, pixelRatio: 1, projection: "orthographic", yaw: 0.7853981633974483, pitch: 0.7853981633974483}}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

### Success response

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
  "mimeType": "image/png",
  "size": 24831
}
```

A successful 3D render also returns `200 OK`, with the actual `camera` parameters and `pixelRatio` instead of the 2D `viewBound` and `scale` fields:

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

`width` and `height` in the response are the final physical PNG dimensions; `view3D.width` and `view3D.height` specify logical output dimensions, multiplied by `view3D.pixelRatio` for physical output.

## Export SVG `POST /api/render-svg`

Exports 2D SVG. The endpoint does not accept `pixelRatio`.

### Request headers

| Header | Type | Required | Description |
| --- | --- | --- | --- |
| `Authorization` | `string` | yes | Bearer API key in the form `Bearer <API_KEY>`; no default. |
| `Content-Type` | `string` | yes | Set to `application/json`. |
| `x-request-id` | `string` | no | Business request ID; a UUID is generated if omitted. |

### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | yes | Complete project to render; no default. See the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol). |
| `slideIndex` | `number` | no | Target slide index, a positive integer starting at `1`; defaults to `1`. |
| `template` | `object` | no | Render template; if omitted, uses the target slide's existing styles. Download data from the [templates page](https://dajiaoai.com/master-templates). |
| `viewBound` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`}` | no | Logical viewport bounds; all four properties are required when the object is provided and must be finite numbers. Requires `left < right` and `bottom < top`. If omitted, uses the target slide’s saved camera viewport. |
| `scale` | `number` | no | Camera scale, in pixels per logical unit. Must be positive. If omitted, the target slide's current `camera.scale` is used. |

### Request example

```bash
curl -X POST https://api.dajiaoai.com/api/render-svg \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-svg-demo-001" \
  -d '{
    "slideIndex": 1,
    "viewBound": {
      "left": -10,
      "right": 10,
      "bottom": -10,
      "top": 10
    },
    "scale": 50,
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [{ "kind": "primitive", "id": "A", "source": "Point(0, ?)", "label": "{{id}}" }, { "kind": "primitive", "id": "B", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "C", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "a", "source": "Segment(A, B)" }, { "kind": "primitive", "id": "b", "source": "Segment(B, C)" }, { "kind": "primitive", "id": "c", "source": "Segment(C, A)" }], "uvarMap": [["A.0", 3], ["B.0", -3], ["C.0", 2]], "styleSheet": { "background": {}, "xaxis": { "show": false }, "yaxis": { "show": false }, "grid": {}, "types": [], "typeLabels": [], "primitives": [], "primitiveLabels": [], "textType": {}, "texts": [], "sliderType": {}, "sliders": [], "buttonType": {}, "buttons": [] }, "doc": [], "camera": { "offset": [0, 0], "scale": 50 } }]
    }
  }'
```

### Success response

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "filename": "4fa2bc.svg",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "slideIndex": 1,
  "viewBound": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10
  },
  "width": 768,
  "height": 768,
  "scale": 50,
  "mimeType": "image/svg+xml",
  "size": 18234
}
```

## Export TikZ `POST /api/render-tikz`

Exports 2D TikZ/TeX as a `.tex` file with MIME type `text/plain`. The endpoint does not accept `pixelRatio`.

### Request headers

| Header | Type | Required | Description |
| --- | --- | --- | --- |
| `Authorization` | `string` | yes | Bearer API key in the form `Bearer <API_KEY>`; no default. |
| `Content-Type` | `string` | yes | Set to `application/json`. |
| `x-request-id` | `string` | no | Business request ID; a UUID is generated if omitted. |

### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | yes | Complete project to render; no default. See the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol). |
| `slideIndex` | `number` | no | Target slide index, a positive integer starting at `1`; defaults to `1`. |
| `template` | `object` | no | Render template; if omitted, uses the target slide's existing styles. Download data from the [templates page](https://dajiaoai.com/master-templates). |
| `viewBound` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`}` | no | Logical viewport bounds; all four properties are required when the object is provided and must be finite numbers. Requires `left < right` and `bottom < top`. If omitted, uses the target slide’s saved camera viewport. |
| `scale` | `number` | no | Camera scale, in pixels per logical unit. Must be positive. If omitted, the target slide's current `camera.scale` is used. |

### Request example

```bash
curl -X POST https://api.dajiaoai.com/api/render-tikz \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-tikz-demo-001" \
  -d '{
    "slideIndex": 1,
    "viewBound": {
      "left": -10,
      "right": 10,
      "bottom": -10,
      "top": 10
    },
    "scale": 50,
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [{ "kind": "primitive", "id": "A", "source": "Point(0, ?)", "label": "{{id}}" }, { "kind": "primitive", "id": "B", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "C", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "a", "source": "Segment(A, B)" }, { "kind": "primitive", "id": "b", "source": "Segment(B, C)" }, { "kind": "primitive", "id": "c", "source": "Segment(C, A)" }], "uvarMap": [["A.0", 3], ["B.0", -3], ["C.0", 2]], "styleSheet": { "background": {}, "xaxis": { "show": false }, "yaxis": { "show": false }, "grid": {}, "types": [], "typeLabels": [], "primitives": [], "primitiveLabels": [], "textType": {}, "texts": [], "sliderType": {}, "sliders": [], "buttonType": {}, "buttons": [] }, "doc": [], "camera": { "offset": [0, 0], "scale": 50 } }]
    }
  }'
```

### Success response

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "filename": "4fa2bc.tex",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "slideIndex": 1,
  "viewBound": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10
  },
  "width": 768,
  "height": 768,
  "scale": 50,
  "mimeType": "text/plain",
  "size": 9631
}
```

## Error responses

| Status | Cause |
| --- | --- |
| `400` | Invalid parameters or `content` does not conform to the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol) |
| `401` | Invalid API key |
| `422` | Legacy endpoints reject projects containing 3D geometry (`UNSUPPORTED_3D_GEOMETRY`); v2 errors are listed below |

| Error code | HTTP status | Retryable | Description |
| --- | --- | --- | --- |
| `RENDER_QUEUE_FULL` | `503` | Yes | Render queue is full; response includes `Retry-After: 1`. |
| `RENDER_TIMEOUT` | `504` | Yes | Total queue and execution time exceeded the limit. |
| `RENDER_CANCELLED` | `499` | Yes | Client cancelled the request or the service shut down while the task was queued. |
| `RENDER_INVALID_REQUEST` | `422` | No | Invalid target slide, non-3D target, or output dimensions exceed the limit. |
| `RENDER_WORKER_FAILED` | `500` | Yes | Render worker exited unexpectedly or the task failed. |
| `UNSUPPORTED_3D_PRIMITIVE` | `422` | No | Target slide contains 3D primitives not yet implemented by the native backend. |

## Billing

- Billing type: render
- Cost per call: see [API Billing](/en/api/pricing)
- Charge rule: deducted on successful execution
