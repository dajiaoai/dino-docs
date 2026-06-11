---
title: API Access
description: API access overview, including render and async agent task APIs.
---

# API Access

The Dino Geometry Open Platform provides HTTP APIs for integrating AI geometry generation and rendering into your application.

## Capabilities

| Capability | Use case | Endpoint |
| --- | --- | --- |
| **Intelligent Image Generation** | Generate interactive geometry from text or image input | [`POST /api/agent/run`](/en/api/agent) |
| **Render to PNG** | Export an existing geometry project as a PNG image | [`POST /api/render`](/en/api/render) |
| **Render to SVG** | Export an existing geometry project as a vector image | [`POST /api/render-svg`](/en/api/render) |
| **Render to TikZ** | Export an existing geometry project as a LaTeX source file | [`POST /api/render-tikz`](/en/api/render) |

## What you can build

**Auto-generate diagrams for homework grading**: Convert problem descriptions into standard geometry figures via the agent API, then embed them alongside documents or worksheets.

**Embed geometry into reports**: Export a project from the website or SDK, then batch-render PNG or SVG files via the render API to insert into PDFs or web reports.

**Produce LaTeX paper figures**: For academic use cases requiring precise typesetting, export geometry as `.tex` files via the TikZ endpoint for direct compilation.

**Model geometry from reference images**: Upload a hand-drawn sketch or screenshot and let the AI infer the geometric structure to produce an interactive project.

## Authentication

All endpoints require Bearer API Key authentication:

```http
Authorization: Bearer djo_xxx
```

API keys are generated in the console. See [Authentication](/en/api/auth) for details.

## Get in touch

For console access or higher quota requests, see [Contact](../CONTACT).
