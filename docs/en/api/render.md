---
title: Render API
description: Describe the Dino Geometry Open Platform HTTP render API that supports PNG, SVG, and TikZ exports.
---

# Render API

This document describes the HTTP render API provided by the Dino Geometry Open Platform. The API accepts a `FileContentLatest` project payload, renders a specified slide, and returns the uploaded file URL and metadata upon success.

## Overview

- Method: `POST`
- Content-Type: `application/json`
- Authentication: see [Authentication](/en/api/auth)

The following three endpoints are currently available:

| Path               | Format | Description                              |
| ------------------ | ------ | ---------------------------------------- |
| `/api/render`      | PNG    | Existing endpoint, returns PNG metadata. |
| `/api/render-svg`  | SVG    | New endpoint, returns SVG metadata.      |
| `/api/render-tikz` | TikZ   | New endpoint, returns TikZ/TeX metadata. |

## Request headers

Optionally provide:

- `x-request-id`: business request ID. The service uses it for billing and log correlation. If omitted, a UUID is generated automatically.

## Request body

All three endpoints accept a JSON body. Shared fields are:

| Field             | Type                | Required | Description                                                   |
| ----------------- | ------------------- | -------- | ------------------------------------------------------------- |
| `content`         | `FileContentLatest` | yes      | Project payload to render. `metadata.version` must be `"10"`. |
| `slideIndex`      | `number`            | no       | Slide index to render, starting from `1`.                     |
| `size.width`      | `number`            | no       | Logical canvas width, positive integer, default `1024`.       |
| `size.height`     | `number`            | no       | Logical canvas height, positive integer, default `1024`.      |
| `camera.offset.x` | `number`            | no       | Override render camera center `x`.                            |
| `camera.offset.y` | `number`            | no       | Override render camera center `y`.                            |
| `camera.scale`    | `number`            | no       | Override render camera scale.                                 |

Notes:

- `/api/render` additionally supports `pixelRatio`, default `1`
- `/api/render-svg` and `/api/render-tikz` do not accept `pixelRatio`

### Minimum valid `content` payload

`content` must satisfy the minimum `FileContentLatest` structure:

```json
{
  "metadata": {
    "version": "10"
  },
  "messages": [],
  "slides": [
    {
      "definitions": [],
      "uvarMap": [],
      "styleSheet": {},
      "doc": []
    }
  ]
}
```

Notes:

- `slides` cannot be empty; rendering fails even if structure validation passes.
- In real usage, send the full `FileContentLatest` exported from the website or SDK instead of manually crafting a simplified payload.

### Defaults and limits

- Default `size` is `1024 x 1024`
- `/api/render` default `pixelRatio` is `1`
- Physical dimensions are calculated as:

```text
physicalWidth = round(width * pixelRatio)
physicalHeight = round(height * pixelRatio)
```

- Current limits for `/api/render`:
  - `width * pixelRatio <= 2048`
  - `height * pixelRatio <= 2048`
- `slideIndex` is 1-based
- When `slideIndex` is omitted, all three HTTP APIs fall back to the first slide

> Although the shared schema comment says “current slide when omitted”, the HTTP API has no current slide context, so it always exports the first slide.

## PNG example

```bash
curl -X POST http://127.0.0.1:3000/api/render \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": {
      "width": 768,
      "height": 768
    },
    "pixelRatio": 2,
    "camera": {
      "offset": {
        "x": 0,
        "y": 0
      },
      "scale": 1
    },
    "content": {
      "metadata": {
        "version": "10"
      },
      "messages": [],
      "slides": [
        {
          "definitions": [],
          "uvarMap": [],
          "styleSheet": {},
          "doc": []
        }
      ]
    }
  }'
```

## SVG example

```bash
curl -X POST http://127.0.0.1:3000/api/render-svg \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-svg-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": {
      "width": 768,
      "height": 768
    },
    "camera": {
      "offset": {
        "x": 0,
        "y": 0
      },
      "scale": 1
    },
    "content": {
      "metadata": {
        "version": "10"
      },
      "messages": [],
      "slides": [
        {
          "definitions": [],
          "uvarMap": [],
          "styleSheet": {},
          "doc": []
        }
      ]
    }
  }'
```

## TikZ example

```bash
curl -X POST http://127.0.0.1:3000/api/render-tikz \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-tikz-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": {
      "width": 768,
      "height": 768
    },
    "camera": {
      "offset": {
        "x": 0,
        "y": 0
      },
      "scale": 1
    },
    "content": {
      "metadata": {
        "version": "10"
      },
      "messages": [],
      "slides": [
        {
          "definitions": [],
          "uvarMap": [],
          "styleSheet": {},
          "doc": []
        }
      ]
    }
  }'
```

## Success response

### PNG

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
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

Field descriptions:

| Field            | Description                               |
| ---------------- | ----------------------------------------- |
| `url`            | Public access URL after upload completes. |
| `filename`       | OSS object filename.                      |
| `objectKey`      | Full OSS object key.                      |
| `slideIndex`     | Rendered slide index (1-based).           |
| `width`          | Logical requested width.                  |
| `height`         | Logical requested height.                 |
| `pixelRatio`     | Requested pixel ratio.                    |
| `physicalWidth`  | Actual output width in pixels.            |
| `physicalHeight` | Actual output height in pixels.           |
| `mimeType`       | Always `image/png`.                       |
| `size`           | PNG buffer bytes.                         |

### SVG

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "filename": "4fa2bc.svg",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "mimeType": "image/svg+xml",
  "size": 18234
}
```

### TikZ

Returns `200 OK`:

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "filename": "4fa2bc.tex",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "mimeType": "text/plain",
  "size": 9631
}
```

## Error responses

### 400 Bad Request

Returns `400` when:

- Request body is not valid JSON
- Parameters fail schema validation
- `content` is not valid `FileContentLatest`

Example:

```json
{
  "success": false,
  "error": "content must be FileContentLatest and metadata.version must be \"10\"."
}
```

### 401 Unauthorized

Bearer authentication failure returns `401`:

```json
{
  "success": false,
  "error": "Missing Authorization header. Use Authorization: Bearer djo_xxx."
}
```

## Billing

All three endpoints deduct an export credit before execution:

- `/api/render` corresponds to `export_image`
- `/api/render-svg` corresponds to `export_svg`
- `/api/render-tikz` corresponds to `export_tikz`

Default cost: `100` credits per call

Notes:

- `export_svg` and `export_tikz` currently share the same default price as `export_image`
- SVG export still relies on `node-canvas` 2D context for text measurement on the server
- TikZ export returns `.tex` files with `mimeType: text/plain`
