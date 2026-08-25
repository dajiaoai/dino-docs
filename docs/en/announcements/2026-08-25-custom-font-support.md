---
title: Custom Font Support for the SDK, MCP, and API
description: SDK 2.12.0 Embedded Canvas accepts custom fonts, while MCP and APIs can specify fonts for canvas content.
---

# Custom Font Support for the SDK, MCP, and API

- Type: New capability
- Published: 2026-08-25
- Effective: 2026-08-25
- Scope: Developers using SDK 2.x editor or presentation mode, MCP, the Agent API, or the Render API
- Action required: Existing integrations require no changes. Update configuration, drawing instructions, or project content only when using a custom or explicitly selected font.

## What's new

This release adds end-to-end font support for embedded canvases and server-side drawing workflows:

1. **Custom fonts in the SDK Embedded Canvas**: Starting with SDK `2.12.0`, editor and presentation modes accept a `fonts` option containing font resources, the picker catalog, and the default font.
2. **Font selection in MCP**: Specify a font key in natural-language drawing instructions or REPL styles for text, object labels, buttons, and other supported content.
3. **Font selection in APIs**: The Agent API accepts font requirements in its `content` instruction. The Render API follows font settings stored in project content when exporting PNG, SVG, or TikZ.
4. **One public font catalog**: Default public fonts and custom-font integration rules for the SDK, MCP, and APIs are maintained in [Font Support](/en/reference/fonts).

## Supplying custom fonts to the SDK Embedded Canvas

SDK integrators can supply fonts by URL, plain base64, or a complete data URL. This example registers a brand font, adds it to the editor font picker, and makes it the default for new text:

```ts
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(container, {
  auth: { appId: 'YOUR_APP_ID' },
  fonts: {
    resources: [
      {
        key: 'brand-sans',
        source: {
          type: 'url',
          url: 'https://cdn.example.com/brand-sans.woff2',
          format: 'woff2',
        },
      },
    ],
    catalog: [
      { key: 'brand-sans', name: 'Brand Font' },
      { key: 'sans-serif', name: 'Sans Serif', type: 'system' },
    ],
    defaultFont: 'brand-sans',
  },
});
```

- `resources`: Font files loaded and registered by the embedded page.
- `catalog`: Fonts and ordering shown in the editor picker; presentation mode may omit it.
- `defaultFont`: The font key used for new text.

Font URLs must allow cross-origin access from the embedded page. Integrators are responsible for font usage and network-distribution licenses. See [SDK Custom Fonts](/en/sdk/2/fonts) for complete types, base64 usage, and cross-origin requirements.

## Selecting a font with MCP

Specify a public font directly in an MCP drawing request, for example:

```text
Draw a right triangle. Use Times New Roman for point labels and sans-serif for explanatory text.
```

You can also use a font key in a REPL style:

```text
style Text { font: "Times New Roman"; }
```

Use `help fonts` to view the font catalog available in the current MCP environment. Font styles apply to supported text, labels, and buttons, but do not change the typesetting font inside LaTeX math expressions.

## Selecting a font with APIs

### Agent API

Include the font requirement in `content` when calling `POST /api/agent/run`:

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=Draw an equilateral triangle. Use Times New Roman for point labels and sans-serif for explanatory text."
```

### Render API

No separate font request parameter is required for PNG, SVG, or TikZ rendering. The service reads the project supplied in `content` and follows font keys stored in text, label, button, and default styles.

For predictable output, use keys from the [public font catalog](/en/reference/fonts). To use a font outside the catalog with server-side MCP or APIs, follow the Font Support guidance and [contact us](/en/CONTACT) to enable support.

## Related links

- [Font Support](/en/reference/fonts)
- [SDK Custom Fonts](/en/sdk/2/fonts)
- [MCP Integration](/en/ai/mcp)
- [Agent API](/en/api/agent)
- [Render API](/en/api/render)
