---
title: Export TikZ
description: HTTP API for exporting TikZ, including request parameters, examples, and responses.
---

# Export TikZ

**Base URL:** `https://api.dajiaoai.com`

**Endpoint:** `POST /api/render-tikz`

The API accepts a project payload conforming to the [Dino-GSP project file protocol](/en/reference/algeo-file-protocol), renders a specified slide, and returns the exported file URL and metadata.

::: info Size units
`viewBound` uses logical canvas coordinates, `scale` is the number of pixels per logical unit, and the returned `width` and `height` are image pixel dimensions. Visual dimensions such as font sizes and line widths in project content use px. If your source specification uses pt, see [Size Units and Conversion](/en/reference/units).
:::

See [Authentication](/en/api/auth) for authentication details.

Exports 2D TikZ/TeX as a `.tex` file with MIME type `text/plain`. The endpoint does not accept `pixelRatio`.

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
| `viewBound` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`}` | no | Logical viewport bounds; all four properties are required when the object is provided and must be finite numbers. Requires `left < right` and `bottom < top`. If omitted, uses the target slide’s saved camera viewport. |
| `scale` | `number` | no | Camera scale, in pixels per logical unit. Must be positive. If omitted, the target slide's current `camera.scale` is used. |

## Request example

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

## Success response

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

See [render error responses](./render#error-responses).
