---
title: Export SVG
description: HTTP API for exporting SVG, including request parameters, examples, and responses.
---

# Export SVG

**Base URL:** `https://api.dajiaoai.com`

**Endpoint:** `POST /api/render-svg`

The API accepts a project payload conforming to the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol), renders a specified slide, and returns the exported file URL and metadata.

::: info Size units
`viewBound` uses logical canvas coordinates, `scale` is the number of pixels per logical unit, and the returned `width` and `height` are image pixel dimensions. Visual dimensions such as font sizes and line widths in project content use px. If your source specification uses pt, see [Size Units and Conversion](/en/reference/units).
:::

See [Authentication](/en/api/auth) for authentication details.

Exports 2D SVG. The endpoint does not accept `pixelRatio`.

## Request headers

| Header | Type | Required | Description |
| --- | --- | --- | --- |
| `Authorization` | `string` | yes | Bearer API key in the form `Bearer <API_KEY>`; no default. |
| `Content-Type` | `string` | yes | Set to `application/json`. |
| `x-request-id` | `string` | no | Business request ID; a UUID is generated if omitted. |

## Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | yes | Complete project to render; no default. See the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol). |
| `slideIndex` | `number` | no | Target slide index, a positive integer starting at `1`; defaults to `1`. |
| `template` | `object` | no | Render template; if omitted, uses the target slide's existing styles. Download data from the [templates page](https://dajiaoai.com/master-templates). |
| `transparent` | `boolean` | no | Whether to skip the background-color fill. |
| `viewBound` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`}` | no | Logical viewport bounds; all four properties are required when the object is provided and must be finite numbers. Requires `left < right` and `bottom < top`. If omitted, uses the target slide’s saved camera viewport. |
| `scale` | `number` | no | Camera scale, in pixels per logical unit. Must be positive. If omitted, the target slide's current `camera.scale` is used. |

## Request example

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
  scale: 50
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render-svg \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    -H "x-request-id: render-svg-demo-001" \
    --data-binary @-
```

## Success response

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

## Error responses

See [render error responses](./render#error-responses).
