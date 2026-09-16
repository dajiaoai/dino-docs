---
title: Legacy PNG API
description: Legacy PNG render endpoint parameters, examples, and migration to /api/render/v2.
---

# Legacy PNG endpoint {#render-legacy}

**Base URL:** `https://api.dajiaoai.com`

**Endpoint:** `POST /api/render`

::: warning Use the new endpoint
`POST /api/render` remains available for existing integrations and supports only 2D PNG. Use [`POST /api/render/v2`](./render-v2) for new integrations and migrate existing calls when updating them.
:::

## Migrate to v2

To migrate, keep `content`, `slideIndex`, and `template`, and move `viewBound` bounds and top-level `scale` and `pixelRatio` into `view2D`, for example:

```json
{
  "view2D": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10,
    "scale": 50,
    "pixelRatio": 2
  }
}
```

This is a view-parameter fragment; include the required `content` in the request. Omit both `view2D` and `view3D` to use the saved camera. For 3D output, use `view3D`. Move the legacy top-level `pixelRatio` to `view2D.pixelRatio` for 2D output; it is optional and defaults to `1`. For 3D output, use `view3D.pixelRatio`.

## Legacy request parameters

The legacy endpoint uses the same `Authorization`, `Content-Type`, and `x-request-id` headers, and the same `content`, `slideIndex`, and `template` fields as [the PNG v2 endpoint](./render-v2). It also accepts:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `viewBound` | `object` | no | Logical viewport bounds in the shape `{ left, right, bottom, top }`. Requires `left < right` and `bottom < top`. If omitted, the target slide's current camera is used. |
| `scale` | `number` | no | Camera scale, in pixels per logical unit. Must be positive. If omitted, the target slide's current `camera.scale` is used. |
| `pixelRatio` | `number` | no, `/api/render` only | PNG output pixel multiplier. It must be a positive finite number and defaults to `1`. It increases the physical PNG dimensions without changing the logical viewport or camera scale. The SVG and TikZ endpoints do not accept this field. |

## Legacy request and response example

```bash
curl -X POST https://api.dajiaoai.com/api/render \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-demo-001" \
  -d '{
    "slideIndex": 1,
    "viewBound": {
      "left": -10,
      "right": 10,
      "bottom": -10,
      "top": 10
    },
    "scale": 50,
    "pixelRatio": 2,
    "template": {
      "backgroundStyle": {
        "background": { "color": "#ffffff" },
        "grid": {},
        "xaxis": {},
        "yaxis": {}
      },
      "defaultStyle": {
        "types": [["Point", { "pointSize": 1, "color": "#000000" }]],
        "typeLabels": [],
        "textType": {},
        "sliderType": {},
        "buttonType": {}
      }
    },
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [{ "kind": "primitive", "id": "A", "source": "Point(0, ?)", "label": "{{id}}" }, { "kind": "primitive", "id": "B", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "C", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "a", "source": "Segment(A, B)" }, { "kind": "primitive", "id": "b", "source": "Segment(B, C)" }, { "kind": "primitive", "id": "c", "source": "Segment(C, A)" }], "uvarMap": [["A.0", 3], ["B.0", -3], ["C.0", 2]], "styleSheet": { "background": {}, "xaxis": { "show": false }, "yaxis": { "show": false }, "grid": {}, "types": [], "typeLabels": [], "primitives": [], "primitiveLabels": [], "textType": {}, "texts": [], "sliderType": {}, "sliders": [], "buttonType": {}, "buttons": [] }, "doc": [], "camera": { "offset": [0, 0], "scale": 50 } }]
    }
  }'
```

Returns `200 OK`:

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
  "width": 2000,
  "height": 2000,
  "scale": 50,
  "mimeType": "image/png",
  "size": 24831
}
```

`pixelRatio` changes only the physical PNG dimensions; it does not change `viewBound` or the camera `scale`. Final dimensions are rounded to integers:

```text
width = round(logical canvas width × pixelRatio)
height = round(logical canvas height × pixelRatio)
```

In this example, the viewport is `20 × 20` logical units and `scale` is `50`, so the logical render size is `1000 × 1000`. With `pixelRatio` set to `2`, the returned `width` and `height`, as well as the actual PNG dimensions, are `2000 × 2000`. Neither final dimension may exceed `2048` pixels.
