---
title: SDK 2.x Examples
description: Map the current example set to common integration goals
---

# Examples

The `algeo-sdk` repository provides 12 standard examples in the `examples/` directory, covering all core scenarios from basic embedding to advanced API usage.

## Basic Integration

### [01-basic-iframe.html](https://dajiaoai.github.io/algeo-sdk/examples/01-basic-iframe.html)

Shows how to use a native `<iframe>` with `postMessage` for the lowest-level communication. This is the underlying mechanism the SDK depends on.

### [02-sdk-usage.html](https://dajiaoai.github.io/algeo-sdk/examples/02-sdk-usage.html)

**Recommended starting point.** Shows how to quickly initialize and render the canvas using the SDK's `createPresentation` method.

## Presentation and Interaction

### [03-switch-slide.html](https://dajiaoai.github.io/algeo-sdk/examples/03-switch-slide.html)

Demonstrates how to call the `switchSlide` API from an external page to switch between slides in a multi-slide document.

### [04-load-file.html](https://dajiaoai.github.io/algeo-sdk/examples/04-load-file.html)

Shows the flow of loading structured JSON content (DSL) from a local source and pushing it to the canvas for rendering.

### [05-repl.html](https://dajiaoai.github.io/algeo-sdk/examples/05-repl.html)

**The automation core.** Shows how to send geometry drawing commands to the canvas via the `repl()` method (e.g. drawing a circle, constructing a perpendicular through a point).

## Editor (Advanced)

### [06-editor-mode.html](https://dajiaoai.github.io/algeo-sdk/examples/06-editor-mode.html)

The standard editor integration template. Includes UI panel toggle configuration and basic history management.

### [07-document-api.html](https://dajiaoai.github.io/algeo-sdk/examples/07-document-api.html)

Shows how to call `editor.document.getContent()` to retrieve the DSL data for the current edit session.

### [08-slides-api.html](https://dajiaoai.github.io/algeo-sdk/examples/08-slides-api.html)

A complete interactive example covering slide CRUD operations, including reordering and duplicating slides.

### [09-history-api.html](https://dajiaoai.github.io/algeo-sdk/examples/09-history-api.html)

Demonstrates how to build custom "Undo/Redo" buttons that stay in sync with the editor's history state (`canUndo` / `canRedo`).

## Events and Engineering

### [10-editor-events.html](https://dajiaoai.github.io/algeo-sdk/examples/10-editor-events.html)

Listens to the editor's `save` and `contentChange` events and prints changes to an external console in real time.

### [11-editor-share-id.html](https://dajiaoai.github.io/algeo-sdk/examples/11-editor-share-id.html)

Shows how to load existing content by share ID in editor mode for secondary editing.

### [12-export-slide-image.html](https://dajiaoai.github.io/algeo-sdk/examples/12-export-slide-image.html)

Demonstrates how to call `editor.slides.exportImage()` to export slides as images. Supports exporting all slides by default, or targeting specific slides via `slideIndices` (1-based). Image format, dimensions, and quality are all configurable.

---

> **Running the examples**: Clone the repository and run `npm run dev` (from the Dino-GSP project root), then open the examples index in your browser. Alternatively, in the `packages/algeo-sdk` directory, run `npx serve .` to preview all examples locally.
