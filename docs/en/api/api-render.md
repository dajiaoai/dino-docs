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

To migrate, keep `content`, `slideIndex`, `template`, and top-level `pixelRatio`. Move the four `viewBound` bounds and `scale` into `view2D`:

```json
{
  "pixelRatio": 2,
  "view2D": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10,
    "scale": 50
  }
}
```

This is a view-parameter fragment; the full request must include `content`. The service selects rendering from the target slide type. Omit both views to use the fixed view or protocol defaults. For 3D view overrides, use `view3D` with degree fields such as `yawDeg` and `pitchDeg`. Top-level `pixelRatio` defaults to `1`; nested `view2D.pixelRatio` and `view3D.pixelRatio` remain compatible and take priority. See [PNG v2](./render-v2) for defaults and cropping.

## Legacy request parameters

The legacy endpoint uses the same `Authorization`, `Content-Type`, and `x-request-id` headers, and the same `content`, `slideIndex`, and `template` fields as [the PNG v2 endpoint](./render-v2). It also accepts:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `viewBound` | `object` | no | Logical viewport bounds in the shape `{ left, right, bottom, top }`. Requires `left < right` and `bottom < top`. If omitted, the target slide's current camera is used. |
| `scale` | `number` | no | Camera scale, in pixels per logical unit. Must be positive. If omitted, the target slide's current `camera.scale` is used. |
| `pixelRatio` | `number` | no, `/api/render` only | PNG output pixel multiplier. It must be a positive finite number and defaults to `1`. It increases the physical PNG dimensions without changing the logical viewport or camera scale. The SVG and TikZ endpoints do not accept this field. |
| `transparent` | `boolean` | no | Whether to skip the background-color fill. |

## Legacy request and response example

Save the complete project exported by the main app or SDK as `project.algeo`. The following example uses `jq` to place the project data in the request's `content` field.

```bash
jq '{
  content: .,
  slideIndex: 1,
  viewBound: {
    left: -10,
    right: 10,
    bottom: -10,
    top: 10
  },
  scale: 50,
  pixelRatio: 2,
  template: {
    backgroundStyle: {
      background: { color: "#ffffff" },
      grid: {},
      xaxis: {},
      yaxis: {}
    },
    defaultStyle: {
      types: [["Point", { pointSize: 1, color: "#000000" }]],
      typeLabels: [],
      textType: {},
      sliderType: {},
      buttonType: {}
    }
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    -H "x-request-id: render-demo-001" \
    --data-binary @-
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
