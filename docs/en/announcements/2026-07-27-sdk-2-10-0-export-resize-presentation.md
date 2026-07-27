---
title: SDK 2.10.0 Updates Export, Automatic Resize, and Presentation Mode
description: SDK 2.10.0 upgrades slide image and LaTeX export, redraws embeds when hidden containers become visible, and updates presentation authentication, routes, and UI options.
---

# SDK 2.10.0 Updates Export, Automatic Resize, and Presentation Mode

- Type: Capability change
- Published: 2026-07-27
- Effective date: 2026-07-27
- Audience: Developers using SDK 2.x slide export, presentation mode, or dynamic container layouts
- Action required: Before upgrading, review image and LaTeX export calls and the presentation-mode `appId` configuration

## What Changed

SDK 2.10.0 includes four main updates:

1. **Upgraded slide export**: `editor.slides.exportImage(options)` now provides `size`, `view`, and `contain` modes for fixed output dimensions, world-coordinate viewports, and content-fitting exports. LaTeX/TikZ export moves to the dedicated `editor.slides.exportLatex(options)` API.
2. **Automatic redraw after a container becomes visible**: editor and presentation modes now provide `resize()`. The SDK observes container size changes and asks the embedded page to remeasure and redraw when a hidden container becomes visible.
3. **Updated presentation configuration**: the application ID moves from top-level `appId` to `auth.appId`, the default route becomes `/embed/present/:appId/:shareId`, and presentation UI options add `slidePanel`, `pencilToolbar`, and `zoomControl`.
4. **Enhanced AI Chat draft image input**: draft images now support both URLs and Base64 data, allowing host pages to preload images from different sources into AI Chat.

## Upgrade Notes

Move the presentation application ID under `auth`:

```ts
const presentation = await createPresentation(container, {
  auth: { appId: 'YOUR_APP_ID' },
  shareId: 'YOUR_SHARE_ID',
});
```

Select an explicit image export mode:

```ts
const images = await editor.slides.exportImage({
  mode: 'view',
  viewBounds: { x: -5, y: -5, width: 10, height: 10, scale: 50 },
  pixelRatio: 2,
});
```

Use the dedicated API for LaTeX/TikZ:

```ts
const items = await editor.slides.exportLatex({
  standalone: true,
});
```

## Use Cases

- Export PNG, JPG, or SVG by fixed size, viewport, or content bounds
- Export editable, layout-friendly geometry as LaTeX/TikZ
- Host an embedded canvas in hidden tabs, collapsible panels, or dynamic layouts
- Control the slide panel, pencil toolbar, and zoom controls in presentation mode

## Related Links

- [SDK 2.10.0 Release](https://github.com/dajiaoai/algeo-sdk/releases/tag/2.10.0)
- [Editor Mode](/en/sdk/2/editor)
- [Presentation Mode](/en/sdk/2/presentation)
- [SDK Examples](https://dajiaoai.github.io/algeo-sdk/)
