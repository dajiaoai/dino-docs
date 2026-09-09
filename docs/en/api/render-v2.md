---
title: Export PNG
description: HTTP API for exporting PNG, including request parameters, examples, and responses.
---

# Export PNG

`POST /api/render/v2`

**Base URL: `https://api.dajiaoai.com`**

The API accepts a project payload conforming to the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol), renders a specified slide, and returns the exported file URL and metadata.

::: info Size units
`viewBound` uses logical canvas coordinates, `scale` is the number of pixels per logical unit, and the returned `width` and `height` are image pixel dimensions. Visual dimensions such as font sizes and line widths in project content use px. If your source specification uses pt, see [Size Units and Conversion](/en/reference/units).
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

`view2D` and `view3D` are mutually exclusive. When both are omitted, the selected slide's saved camera mode and parameters are used. `?` in the object definitions marks an optional property; numeric values must be finite.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | yes | Complete project to render; no default. See the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol). |
| `slideIndex` | `number` | no | Target slide index, a positive integer starting at `1`; defaults to `1`. |
| `template` | `object` | no | Render template; if omitted, uses the target slide's existing styles. Download data from the [templates page](https://dajiaoai.com/master-templates). |
| `view2D` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`  scale?: number;`<br>`  pixelRatio?: number;`<br>`}` | no | Overrides the 2D viewport. `left`, `right`, `bottom`, and `top` are logical bounds with no defaults when the object is provided; requires `left < right` and `bottom < top`.<br>`scale` is pixels per logical unit, must be positive, and defaults to the target camera scale.<br>`pixelRatio` is an optional positive output pixel ratio, defaults to `1`, and scales the physical PNG dimensions without changing the logical viewport or camera scale. |
| `view3D` | `{`<br>`  offset?: [number, number, number];`<br>`  yaw?: number;`<br>`  pitch?: number;`<br>`  projection?: "orthographic" \| "perspective" \| "oblique";`<br>`  obliqueAngle?: number;`<br>`  obliqueScaleRatio?: number;`<br>`  scale?: number;`<br>`  width?: number;`<br>`  height?: number;`<br>`  pixelRatio?: number;`<br>`}` | no | Forces 3D rendering and overrides the target slide's 3D camera; all properties are optional.<br>`offset`: camera center; `yaw` / `pitch`: horizontal / vertical viewing angles in radians; `projection`: projection mode; `obliqueAngle`: oblique direction in radians; `obliqueScaleRatio`: nonnegative foreshortening ratio; `scale`: positive camera scale. These properties default to the target slide's saved 3D camera values.<br>`width` / `height`: positive integer logical output dimensions, each defaulting to `1024`.<br>`pixelRatio`: positive output pixel ratio, defaults to `1` and multiplies the logical dimensions to produce the physical PNG dimensions. |

## Request examples

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

For existing `/api/render` integrations, see the [legacy endpoint and migration guide](./api-render).

## Error responses

See [render error responses](./render#error-responses).
