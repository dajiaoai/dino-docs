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
| [Export PNG](./render-v2) | `/api/render/v2` | `POST` | 2D, 3D |
| [Export SVG](./render-svg) | `/api/render-svg` | `POST` | 2D |
| [Export TikZ/TeX](./render-tikz) | `/api/render-tikz` | `POST` | 2D |

::: warning Use the new PNG endpoint
Use `POST /api/render/v2` for PNG exports. Existing integrations using `/api/render` can refer to the [legacy endpoint and migration guide](./api-render).
:::

See [Authentication](/en/api/auth) for authentication details.

## PNG endpoint {#render-v2}

See [Export PNG](./render-v2) for `POST /api/render/v2` parameters and examples.

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
