---
title: Render API
description: Describe the Dino Geometry Open Platform HTTP render API that supports PNG, SVG, and TikZ exports.
---

# Render API

**Base URL: `https://api.dajiaoai.com`**

The API accepts a project payload conforming to the [Dino Geometry file protocol](/en/sdk/2/protocol), renders a specified slide, and returns the exported file URL and metadata.

::: info Size units
`viewBound` uses logical canvas coordinates, `scale` is the number of pixels per logical unit, and the returned `width` and `height` are image pixel dimensions. Visual dimensions such as font sizes and line widths in project content use px. If your source specification uses pt, see [Size Units and Conversion](/en/reference/units).
:::

## Overview

| Description | Path | Method |
| --- | --- | --- |
| Export PNG | `/api/render` | `POST` |
| Export SVG | `/api/render-svg` | `POST` |
| Export TikZ/TeX | `/api/render-tikz` | `POST` |

See [Authentication](/en/api/auth) for auth and [API Billing](/en/api/pricing) for billing.

## Request headers

Optionally provide:

- `x-request-id`: business request ID. If omitted, a UUID is generated automatically.

## Request body

All three endpoints share the following JSON fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `viewBound` | `object` | yes | Logical viewport bounds in the shape `{ left, right, bottom, top }`. Requires `left < right` and `bottom < top`. The output canvas size is calculated as `width = right - left` and `height = top - bottom`. |
| `content` | `FileContentLatest` | yes | Project payload to render. See [Dino Geometry file protocol](/en/sdk/2/protocol). |
| `slideIndex` | `number` | no | Slide index to render, 1-based, defaults to `1`. |
| `scale` | `number` | no | Camera scale, in pixels per logical unit. Must be positive. If omitted, the target slide's current `camera.scale` is used. |
| `template` | `object` | no | Render template. You can download template data from the [Dino Geometry templates](https://dajiaoai.com/master-templates) page. |

## Export PNG `POST /api/render`

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
  "width": 768,
  "height": 768,
  "scale": 50,
  "mimeType": "image/png",
  "size": 24831
}
```

## Export SVG `POST /api/render-svg`

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
| `400` | Invalid parameters or `content` does not conform to the [Dino Geometry file protocol](/en/sdk/2/protocol) |
| `401` | Invalid API key |

## Billing

- Billing type: render
- Cost per call: see [API Billing](/en/api/pricing)
- Charge rule: deducted on successful execution
