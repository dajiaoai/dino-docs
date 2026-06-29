---
title: Render API Parameters and Agent Template Support Updated
description: The Render API now uses viewBound viewport parameters, and both Render API and Agent API support style templates.
---

# Render API Parameters and Agent Template Support Updated

- Type: Capability change
- Published: 2026-06-29
- Effective date: 2026-06-29
- Audience: Developers calling the Render API or Intelligent Image Generation Agent API
- Action required: Render API callers should pass the new required `viewBound` parameter. To keep export or generation styles consistent, pass `template` data when needed.

## What Changed

This update includes two parts:

1. **The Render API uses `viewBound` to specify the export viewport**: `/api/render`, `/api/render-svg`, and `/api/render-tikz` now use `viewBound` in the request body to describe the logical viewport bounds. `viewBound` is required and has the shape `{ left, right, bottom, top }`. The output canvas size is calculated as `width = right - left` and `height = top - bottom`.
2. **Render API and Agent API support style templates**: Render API requests can pass `template` to specify a render template. The Intelligent Image Generation endpoint `/api/agent/run` also adds an optional `template` field to specify the style template for generated results.

Template data is available from the [Dino Geometry templates](https://dajiaoai.com/master-templates) page.

## Response Fields

Successful Render API responses now include more complete export metadata:

| Field | Description |
| --- | --- |
| `objectKey` | Full object storage key of the exported file |
| `viewBound` | Logical viewport bounds used for this render |
| `scale` | Camera scale used for this render |

## Related Links

- [Render API](/en/api/render)
- [Intelligent Image Generation API](/en/api/agent)
