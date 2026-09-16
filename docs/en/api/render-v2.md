---
title: Export PNG
description: HTTP API for exporting PNG, including request parameters, examples, and responses.
---

# Export PNG

**Base URL:** `https://api.dajiaoai.com`

**Endpoint:** `POST /api/render/v2`

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

::: info Rendering mode
`view2D` and `view3D` are mutually exclusive and cannot be provided together. When both are omitted, the selected slide's saved camera mode and parameters are used.
:::

All numeric parameters must be finite.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | yes | Complete project to render; no default. See the [project file protocol](/en/reference/algeo-file-protocol). |
| `slideIndex` | `number` | no | Target slide index, a positive integer starting at `1`; defaults to `1`. |
| `template` | `object` | no | Render template; if omitted, uses the target slide's existing styles. [Download template data](https://dajiaoai.com/master-templates). |
| `view2D` | `object` | no | Overrides the 2D viewport. See [2D viewport parameters](#view2d). |
| `view3D` | `object` | no | Forces 3D rendering and overrides camera parameters. See [3D view parameters](#view3d). |

### view2D: 2D viewport {#view2d}

When `view2D` is provided, all four bounds are required and have no defaults. They must satisfy `left < right` and `bottom < top`.

| Field | Type | Default / Required | Description |
| --- | --- | --- | --- |
| `left` | `number` | Required | Left bound in logical coordinates. |
| `right` | `number` | Required | Right bound in logical coordinates. |
| `bottom` | `number` | Required | Bottom bound in logical coordinates. |
| `top` | `number` | Required | Top bound in logical coordinates. |
| `scale` | `number` | Saved camera value | Pixels per logical unit; must be greater than `0`. |
| `pixelRatio` | `number` | `1` | Output pixel ratio; must be greater than `0`. |

`pixelRatio` scales the physical PNG dimensions without changing the logical viewport or camera scale. When omitted, `scale` uses the target slide's saved camera scale.

### view3D: 3D view {#view3d}

Providing `view3D` forces 3D rendering. All properties in this object are optional.

Parameters marked "Saved camera value" use the target slide's saved 3D camera values when omitted.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `offset` | `[number, number, number]` | Saved camera value | Camera center with three coordinate components. |
| `yaw` | `number` | Saved camera value | Horizontal viewing angle in radians. |
| `pitch` | `number` | Saved camera value | Vertical viewing angle in radians. |
| `projection` | `string` | Saved camera value | Projection mode: `orthographic` (orthographic projection), `perspective` (perspective projection), or `oblique` (oblique projection). |
| `obliqueAngle` | `number` | Saved camera value | Oblique projection direction angle in radians. |
| `obliqueScaleRatio` | `number` | Saved camera value | Foreshortening ratio for the receding axis in oblique projection; must be greater than or equal to `0`. |
| `scale` | `number` | Saved camera value | Camera scale; must be greater than `0`. |
| `width` | `number` | `1024` | Logical output width; must be a positive integer. |
| `height` | `number` | `1024` | Logical output height; must be a positive integer. |
| `pixelRatio` | `number` | `1` | Output pixel ratio; must be greater than `0`. |

Physical PNG dimensions = logical output dimensions × `pixelRatio`. For example, `width: 1280`, `height: 720`, and `pixelRatio: 2` produce an image of **2560 × 1440 pixels**.

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
jq '{
  content: .,
  slideIndex: 1,
  view2D: {
    left: -10,
    right: 10,
    bottom: -10,
    top: 10,
    scale: 50,
    pixelRatio: 1
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
  view3D: {
    width: 1280,
    height: 720,
    pixelRatio: 1,
    projection: "orthographic",
    yaw: 0.7853981633974483,
    pitch: 0.7853981633974483
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
