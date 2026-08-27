---
title: "Intelligent Image Generation API Pricing Update: Stronger Foundation Models, Lower Costs"
description: The Intelligent Image Generation API will adopt new pricing on September 1, 2026, with model capabilities upgraded at the same time.
---

# Intelligent Image Generation API Pricing Update: Stronger Foundation Models, Lower Costs

- Type: Billing change
- Published: 2026-08-27
- Effective: 2026-09-01
- Scope: Developers using the Intelligent Image Generation API
- Action required: None. The new prices will apply automatically on the effective date.

To make high-quality geometry image generation more accessible to developers and education use cases, the Intelligent Image Generation API will reduce its prices starting **September 1, 2026**.

This pricing update is accompanied by upgraded foundation models. The upgraded models continue to improve on key tasks including geometry-diagram understanding, complex-problem generation, and image-reference reconstruction, delivering more reliable results at a lower cost.

## New pricing

> The Intelligent Image Generation API will be priced at 75% of the list price.

| Model | New price |
| --- | ---: |
| `dinogeo-1` | **¥0.45 / call** |
| `dinogeo-1-pro` | **¥0.60 / call** |

The new prices will take effect automatically on September 1; no configuration changes are required.

## Capability evaluation

The following results are from Dino Geometry's internal evaluation. The test set covers approximately 2,000 middle- and high-school geometry problems, plus approximately 500 complex integrated and proof problems.

| Metric | `dinogeo-1` | `dinogeo-1-pro` |
| --- | ---: | ---: |
| Standard geometry first-pass rate | 95% | 97% |
| Complex / integrated problem first-pass rate | 79% | 89% |
| Image-reference reconstruction accuracy | 83% | 93% |
| Average generation latency | 30.26 s | 51.64 s |

`dinogeo-1` is suited to high-volume, standardized geometry-diagram generation, balancing speed and cost. `dinogeo-1-pro` is designed for complex integrated problems, proof diagrams, and high-fidelity image-reference reconstruction, with higher generation success rates and reconstruction accuracy.

> Note: These are internal test results. Actual results may vary depending on input content, task complexity, and calling environment.

## Built for production at scale

Whether you are producing question banks, building intelligent problem explanations or homework systems, or creating supplementary educational content, the Intelligent Image Generation API can support larger-scale production at a lower per-call cost. Try the upgraded `dinogeo-1` and `dinogeo-1-pro` starting September 1.

## Related links

- [Intelligent Image Generation API](/en/api/agent)
- [Models](/en/api/models)
- [API Billing](/en/api/pricing)
- [Open Platform Console](https://open.dajiaoai.com/console/dashboard)
