---
title: Render API
description: Describe the Dino Geometry Open Platform HTTP render API that supports PNG, SVG, and TikZ exports.
---

# Render API

**Base URL: `https://api.dajiaoai.com`**

The API accepts a project payload conforming to the [Dino Geometry file protocol](/en/sdk/2/protocol), renders a specified slide, and returns the exported file URL and metadata.

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

| Field             | Type                | Required | Description                                                   |
| ----------------- | ------------------- | -------- | ------------------------------------------------------------- |
| `content`         | `FileContentLatest` | yes      | Project payload to render. See [Dino Geometry file protocol](/en/sdk/2/protocol). |
| `slideIndex`      | `number`            | no       | Slide index to render, 1-based, defaults to `1`.              |
| `size.width`      | `number`            | no       | Logical canvas width, positive integer, default `1024`.       |
| `size.height`     | `number`            | no       | Logical canvas height, positive integer, default `1024`.      |
| `camera.offset.x` | `number`            | no       | Override render camera center `x`.                            |
| `camera.offset.y` | `number`            | no       | Override render camera center `y`.                            |
| `camera.scale`    | `number`            | no       | Override render camera scale.                                 |

`/api/render` additionally supports `pixelRatio` (default `1`); the other two endpoints do not.

### Size limits

For `/api/render`, the physical dimensions are calculated as follows and must not exceed `2048 x 2048`:

```text
physicalWidth  = round(width * pixelRatio)
physicalHeight = round(height * pixelRatio)
```

## Export PNG `POST /api/render`

```bash
curl -X POST https://api.dajiaoai.com/api/render \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": { "width": 768, "height": 768 },
    "pixelRatio": 2,
    "camera": { "offset": { "x": 0, "y": 0 }, "scale": 1 },
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [], "uvarMap": [], "styleSheet": {}, "doc": [] }]
    }
  }'
```

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "pixelRatio": 2,
  "physicalWidth": 1536,
  "physicalHeight": 1536,
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
    "size": { "width": 768, "height": 768 },
    "camera": { "offset": { "x": 0, "y": 0 }, "scale": 1 },
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [], "uvarMap": [], "styleSheet": {}, "doc": [] }]
    }
  }'
```

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "filename": "4fa2bc.svg",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
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
    "size": { "width": 768, "height": 768 },
    "camera": { "offset": { "x": 0, "y": 0 }, "scale": 1 },
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [], "uvarMap": [], "styleSheet": {}, "doc": [] }]
    }
  }'
```

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "filename": "4fa2bc.tex",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
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
