---
title: Models
description: Model versions and capability comparison for the Dino Geometry intelligent image generation API.
---

# Models

Dino Geometry Intelligent Image Generation offers two model versions, both deeply optimized for geometry figure generation.

## How it works

Dino Geometry models are built on a Harness Agent mechanism that interprets mathematical problem semantics, accurately renders geometric constraint relationships, and orchestrates dynamic interactions such as draggable vertices and locus tracing. The output is an interactive Dino Geometry project file (`.algeo`), not a static image.

## Model versions

| Model | Profile | Recommended for |
| --- | --- | --- |
| `dinogeo-1` | Standard — optimized for cost and throughput | Routine geometry figures, bulk question bank production, AI courseware |
| `dinogeo-1-pro` | Professional — optimized for quality and complex-problem stability | Complex integrated problems, image-reference reconstruction, proof diagrams, high-value content |

For pricing, see [API Billing](/en/api/pricing).

## Capability comparison

The following data comes from Dino Geometry's internal evaluation set, covering approximately 2,000 standard geometry problems and 500 complex/proof problems.

| Metric | `dinogeo-1` | `dinogeo-1-pro` |
| --- | --- | --- |
| Standard geometry first-pass rate | 95% | 97% |
| Complex / integrated problem first-pass rate | 79% | 89% |
| Image-reference reconstruction accuracy | 83% | 93% |
| Average generation latency | 30.26 s | 51.64 s |
