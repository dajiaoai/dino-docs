---
title: Render API
description: Describe the Dino Geometry Open Platform HTTP render API that supports PNG, SVG, and TikZ exports.
---

# Render API

**Base URL:** `https://api.dajiaoai.com`

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

Check the project content and request parameters if the API returns `400`. If a 2D export rejects 3D geometry with `422` / `UNSUPPORTED_3D_GEOMETRY`, use PNG v2 for 3D canvases.

See the [API Error Codes](/en/api/error-codes#render) for the full list.
