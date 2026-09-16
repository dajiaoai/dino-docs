---
title: API Support for 3D Geometry Rendering
description: Render 3D geometry slides through the PNG export API with custom camera views, projection modes, and output resolution.
---

# API Support for 3D Geometry Rendering

- Type: New capability
- Published: 2026-09-16
- Effective: 2026-09-16
- Affected users: Developers using the render API
- Action required: Use `POST /api/render/v2` to render 3D slides

The Dino-GSP Open Platform render API now supports 3D geometry slides. Following 3D image export support in MCP and the SDK, developers can submit complete project content through the HTTP API, render a selected 3D slide as PNG, and receive an image URL and metadata for question banks, teaching materials, and batch image workflows.

## New capabilities

- **3D slide export**: Submit a complete project through `content` and select the target slide with `slideIndex`.
- **Custom camera views**: Use `view3D` to set the camera center, horizontal and vertical viewing angles, and camera scale.
- **Multiple projection modes**: Choose orthographic (`orthographic`), perspective (`perspective`), or oblique (`oblique`) projection.
- **Custom output resolution**: Set logical output dimensions with `width` and `height`, and adjust the final physical PNG dimensions with `pixelRatio`.

## Request example

Save a complete project exported from the website or SDK as `project.algeo`. The following example uses `jq` to assemble the request and requires slide `1` to be a 3D slide:

```bash
jq '{
  content: .,
  slideIndex: 1,
  view3D: {
    projection: "orthographic",
    yaw: 0.7853981633974483,
    pitch: 0.7853981633974483,
    width: 1280,
    height: 720,
    pixelRatio: 2
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

This example produces a **2560 × 1440 pixel** PNG. The success response includes the image `url`, final pixel dimensions (`width` / `height`), actual `camera` parameters, and `pixelRatio`.

::: info Parameters
`view2D` and `view3D` cannot be provided together. Angles are in radians. `view3D.width` and `view3D.height` each default to `1024`, and `pixelRatio` defaults to `1`. See the [PNG export API](/en/api/render-v2) for all parameters, defaults, and response formats.
:::

## Related links

- [PNG export API](/en/api/render-v2)
- [API Pricing](/en/api/pricing)
- [Legacy endpoint and migration guide](/en/api/api-render)
