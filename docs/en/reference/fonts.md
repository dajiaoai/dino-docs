---
title: Font Support
description: Public font catalog and custom-font integration for the Dino-GSP SDK, API, and MCP
---

# Font Support

Dino-GSP publicly supports the following font keys:

| Font key | Name | Notes |
| --- | --- | --- |
| `sans-serif` | Sans serif | Default; the runtime selects an available sans-serif font |
| `serif` | Serif | The runtime selects an available serif font |
| `monospace` | Monospace | The runtime selects an available monospace font |
| `Times New Roman` | Times New Roman | Prefers Times New Roman and falls back according to the runtime |

When no custom-font configuration is provided, use only these font keys. The exact glyphs used by generic font families may vary by operating system, browser, or server rendering environment. Integrate a specific custom font when exact typography and layout are required.

## Custom fonts

| Scenario | Integration method |
| --- | --- |
| SDK Embedded Canvas | The integrator supplies font resources through the `fonts` option when creating an editor or presentation instance. See [SDK Custom Fonts](../sdk/2/fonts). |
| MCP service | MCP runs on Dino-GSP servers, so callers cannot supply a font file in an individual tool call. [Contact us](../CONTACT) to enable custom-font support. |
| HTTP API | AI generation and rendering run on Dino-GSP servers, so callers cannot supply a font file in an individual request. [Contact us](../CONTACT) to enable custom-font support. |

The integrator is responsible for obtaining and complying with all applicable font usage and network-distribution licenses.
