---
title: SDK 2.x Editor Mode
description: Editor-mode entry points, API modules, events, and integration guidance
---

# Editor Mode

Editor mode provides the host application with a full geometry creation environment, with support for UI customization, slide management, undo/redo, and structured export.

## Characteristics

- **Full-featured**: Built-in complete dynamic geometry engine and toolbar.
- **Customizable UI**: Hide specific panels to match your application layout.
- **Strict authorization**: A valid `appId` must be provided during initialization.

## Creating an Instance

```typescript
import { createEditor, EmbeddedEditor } from '@dajiaoai/algeo-sdk';

const editor: EmbeddedEditor = await createEditor(container, {
  auth: { appId: 'YTVJDQZR' },
  ui: {
    navbar: false,
  },
});
```

See [Getting Started](./getting-started.html#_4-getting-an-appid) for how to get an `appId`.

### UI Configuration

Use `ui` to control visibility of editor panels.

| Property          | Type      | Default | Description                                                                  |
| ----------------- | --------- | ------- | ---------------------------------------------------------------------------- |
| `ui.navbar`       | `boolean` | `true`  | Whether to show the top navigation bar (including Save button and file info) |
| `ui.slidePanel`   | `boolean` | `true`  | Whether to show the slide thumbnail panel                                    |
| `ui.toolboxPanel` | `boolean` | `true`  | Whether to show the drawing toolbox                                          |
| `ui.algebraPanel` | `boolean` | `true`  | Whether to show the algebra panel                                            |
| `ui.docPanel`     | `boolean` | `true`  | Whether to show the document panel                                           |
| `ui.helpEntry`    | `boolean` | `true`  | Whether to show the help entry in editor mode. Supported since `2.7.0`.      |

## API Module Reference

The SDK organizes the editor API into modules:

### 1. Document API (`editor.document`)

Handles overall content loading and retrieval.

- `loadContent(content: FileContentLatest): Promise<void>`: Overwrite-load the current content.
- `getContent(): Promise<FileContentLatest>`: Retrieve the complete DSL data from the current editor.

### 2. Slides API (`editor.slides`)

Manage multi-slide documents.

- `getCount(): number`: Get the total slide count.
- `getCurrentIndex(): number`: Get the current slide index.
- `switchTo(index: number): Promise<void>`: Switch to the specified slide.
- `add(): Promise<void>`: Add a new slide at the end.
- `remove(index: number): Promise<void>`: Delete the specified slide.
- `duplicate(index: number): Promise<void>`: Duplicate the specified slide.
- `reorder(from: number, to: number): Promise<void>`: Reorder slides.

#### 2.1 `exportImage(options?)`

> Available since **2.6.0**

Export the specified slide(s) (or all slides) as images, returning an `ExportedSlideImage[]` array.

```typescript
editor.slides.exportImage(options?: ExportSlideImageOptions): Promise<ExportedSlideImage[]>
```

**`ExportSlideImageOptions` (optional):**

| Parameter      | Type             | Default | Description                                                    |
| -------------- | ---------------- | ------- | -------------------------------------------------------------- |
| `slideIndices` | `number[]`       | -       | 1-based indices of slides to export; omit to export all slides |
| `format`       | `'png' \| 'jpg'` | `'png'` | Image format                                                   |
| `width`        | `number`         | -       | Output image width in pixels                                   |
| `height`       | `number`         | -       | Output image height in pixels                                  |
| `quality`      | `number`         | `0.92`  | Image quality (0–1, applies to `jpg` only)                     |
| `autoFit`      | `boolean`        | -       | Auto-fit output size to canvas content                         |
| `padding`      | `number`         | -       | Padding in pixels when `autoFit` is enabled                    |

**`ExportedSlideImage` (array item):**

| Property | Type             | Description                    |
| -------- | ---------------- | ------------------------------ |
| `index`  | `number`         | Slide index (1-based)          |
| `blob`   | `Blob`           | Image binary data              |
| `format` | `'png' \| 'jpg'` | Actual export format           |
| `width`  | `number`         | Actual export width in pixels  |
| `height` | `number`         | Actual export height in pixels |

### 3. History API (`editor.history`)

Control undo and redo.

- `undo() / redo()`: Undo or redo.
- `canUndo() / canRedo(): boolean`: Check whether the respective operation is currently available.
- `clear()`: Clear history.

### 4. Mode API (`editor.mode`)

Dynamically adjust the UI.

- `setUiConfig(config: Partial<AlgeoEditorUiConfig>): Promise<void>`: Dynamically toggle UI element visibility at runtime.

## Event Listening

Use `editor.on(event, listener)` to subscribe; it returns an unsubscribe function. You can also use `editor.off(event, listener)` to unsubscribe manually.

**Supported events:**

| Event           | Event data                                                 | Description                                                                             |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `ready`         | `{ type: 'ready', mode, version }`                         | iframe initialization complete                                                          |
| `contentChange` | `{ type: 'contentChange', source: 'user', content }`       | Fires after the user edits inside the iframe; returns the full `FileContentLatest`         |
| `slideChange`   | `{ type: 'slideChange', index }`                           | Fires after the user switches slides inside the iframe; returns the current index       |
| `save`          | `{ type: 'save', stage: 'request' \| 'success', content }` | `stage: 'request'`: host handles persistence; `stage: 'success'`: save flow is complete |

---

### `ready` Event

Fires when the iframe finishes initialization. You can read the embedded page protocol version here.

```typescript
editor.on('ready', (event) => {
  console.log('Editor ready, protocol version:', event.version);
});
```

---

### `contentChange` Event

Fires after the user makes any modification to geometry figures or the slide structure inside the iframe. Returns the full `FileContentLatest`.

```typescript
editor.on('contentChange', (event) => {
  // event.source is always 'user'
  console.log('Content updated:', event.content);
});
```

---

### `slideChange` Event

Fires after the user switches slides inside the iframe. Returns the current slide index (0-based).

```typescript
editor.on('slideChange', (event) => {
  console.log('Current slide index:', event.index);
});
```

---

### `save` Event

The `save` event has two stages:

1. **`request` stage**: Fires when the user clicks the save button. The host must complete persistence in the callback and return a result object. The iframe will only show a success state and proceed to the `success` stage after the host returns `{ status: 'success' }`.
2. **`success` stage**: Fires after the host confirms a successful save. At this point, `event.content` is the final saved content.

```typescript
editor.on('save', async (event) => {
  if (event.stage === 'request') {
    const response = await fetch('/api/geometry-doc/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: event.content }),
    });

    if (!response.ok) {
      return { status: 'error', message: 'Save failed' };
    }

    return { status: 'success' };
  }

  // stage === 'success': iframe has shown success state
  console.log('Save confirmed, final content:', event.content);
});
```

> **Note**: The `request`-stage listener must return a Promise (or be an `async` function), otherwise the iframe will not receive the host's handling result.

