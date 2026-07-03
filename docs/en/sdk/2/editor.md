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
| `ui.aiChatPanel`  | `boolean` | `true`  | Whether to show the AI Chat panel. Supported since `2.8.0`.                  |

## API Module Reference

The SDK organizes the editor API into modules:

### Create Options (`AlgeoEditorCreateOptions`)

```typescript
interface AlgeoEditorCreateOptions {
  auth?: {
    appId: string;
  };
  shareId?: string;
  initialContent?: FileContentLatest;
  ui?: AlgeoEditorUiConfig;
}
```

| Option           | Type                  | Required | Description                                                  |
| ---------------- | --------------------- | -------- | ------------------------------------------------------------ |
| `auth.appId`     | `string`              | yes      | Open Platform application ID for editor-mode authorization   |
| `shareId`        | `string`              | no       | Shared file ID to load during initialization                 |
| `initialContent` | `FileContentLatest`   | no       | File content loaded after initialization                     |
| `ui`             | `AlgeoEditorUiConfig` | no       | Editor UI visibility configuration                           |

### 1. Document API (`editor.document`)

Handles overall content loading and retrieval.

- `loadContent(content: FileContentLatest): Promise<void>`: Overwrite-load the current content.
- `getContent(): Promise<FileContentLatest>`: Retrieve the complete DSL data from the current editor.

```typescript
await editor.document.loadContent(content);
const content = await editor.document.getContent();
```

`loadContent` replaces the current project content and synchronizes editor state. `getContent` reads the latest content from the embedded editor and is useful as a final check before saving.

### 2. Slides API (`editor.slides`)

Manage multi-slide documents.

- `getCount(): number`: Get the total slide count.
- `getCurrentIndex(): number`: Get the current slide index.
- `switchTo(index: number): Promise<void>`: Switch to the specified slide.
- `add(): Promise<SlideIndexResult>`: Add a new slide at the end.
- `addAt(index: number): Promise<SlideIndexResult>`: Insert a new slide at the specified position.
- `remove(index: number): Promise<void>`: Delete the specified slide.
- `duplicate(index: number, targetIndex?: number): Promise<SlideIndexResult>`: Duplicate the specified slide, optionally inserting it at a target position.
- `reorder(fromIndex: number, toIndex: number): Promise<void>`: Reorder slides.
- `exportImage(options?: ExportSlideImageOptions): Promise<ExportedSlideImage[]>`: Export slides as images.

```typescript
const total = editor.slides.getCount();
const current = editor.slides.getCurrentIndex();

await editor.slides.switchTo(1);
const added = await editor.slides.add();
const inserted = await editor.slides.addAt(0);
const duplicated = await editor.slides.duplicate(current, current + 1);

await editor.slides.reorder(0, 2);
await editor.slides.remove(1);
```

```typescript
interface SlideIndexResult {
  index: number;
}
```

`switchTo`, `remove`, `duplicate`, and `reorder` use **0-based** indices. `exportImage.slideIndices` uses **1-based** indices to match page-number semantics in export flows.

#### 2.1 `exportImage(options?)`

> Available since **2.6.0**

Export the specified slide(s) (or all slides) as images or editable layout content, returning an `ExportedSlideImage[]` array.

```typescript
editor.slides.exportImage(options?: ExportSlideImageOptions): Promise<ExportedSlideImage[]>
```

**`ExportSlideImageOptions` (optional):**

| Parameter      | Type             | Default | Description                                                    |
| -------------- | ---------------- | ------- | -------------------------------------------------------------- |
| `slideIndices` | `number[]`       | -       | 1-based indices of slides to export; omit to export all slides |
| `format`       | `'png' \| 'jpg' \| 'svg' \| 'latex'` | `'png'` | Export format; `latex` returns a standalone LaTeX/TikZ document |
| `width`        | `number`         | -       | Output image width in pixels                                   |
| `height`       | `number`         | -       | Output image height in pixels                                  |
| `quality`      | `number`         | `0.92`  | Image quality (0–1, applies to `jpg` only)                     |
| `autoFit`      | `boolean`        | -       | Auto-fit output size to canvas content                         |
| `padding`      | `number`         | -       | Padding in pixels when `autoFit` is enabled                    |

**`ExportedSlideImage` (array item):**

| Property | Type             | Description                    |
| -------- | ---------------- | ------------------------------ |
| `index`  | `number`         | Slide index (1-based)          |
| `blob`   | `Blob`           | Exported binary data           |
| `format` | `'png' \| 'jpg' \| 'svg' \| 'latex'` | Actual export format |
| `width`  | `number`         | Actual export width in pixels  |
| `height` | `number`         | Actual export height in pixels |

### 3. History API (`editor.history`)

Control undo and redo.

- `getCount(): number`: Get the history entry count.
- `getCurrentIndex(): number`: Get the current history cursor.
- `undo(): Promise<void>`: Undo.
- `redo(): Promise<void>`: Redo.
- `jumpTo(index: number): Promise<void>`: Jump to a specific history entry.
- `canUndo() / canRedo(): boolean`: Check whether the respective operation is currently available.
- `clear(): Promise<void>`: Clear history.

```typescript
if (editor.history.canUndo()) {
  await editor.history.undo();
}

if (editor.history.canRedo()) {
  await editor.history.redo();
}

await editor.history.jumpTo(0);
await editor.history.clear();
```

### 4. Mode API (`editor.mode`)

Dynamically adjust the UI and master template style.

- `getUiConfig(): AlgeoEditorUiConfig`: Get the SDK-side cached UI configuration.
- `setUiConfig(config: Partial<AlgeoEditorUiConfig>): Promise<void>`: Dynamically toggle UI element visibility at runtime.
- `setMasterTemplate(template: string): Promise<SetMasterTemplateResult>`: Set the master template style. Supported since `2.9.0`.

```typescript
const ui = editor.mode.getUiConfig();

await editor.mode.setUiConfig({
  slidePanel: false,
  aiChatPanel: true,
});

await editor.mode.setMasterTemplate(masterTemplateContent);
```

`setMasterTemplate` forwards the `template` string to the iframe. The embedded editor applies it to the document slides; the SDK does not parse or modify the master template content.

You can download master template data that can be passed directly to `setMasterTemplate` from the [Dino-GSP master template page](https://dajiaoai.com/master-templates).

### 5. AI API (`editor.ai`)

> Supported since **2.8.0**. See [AI Chat in Editor](./ai-chat) for the full integration flow.

The AI API lets the host page pass the Dino-GSP backend stream, returned through the host backend, back to the embedded editor. It is usually used together with the `aiRequest` event.

- `setDraft(draft: AiDraftPayloadV1): Promise<void>`: Set the AI Chat draft with `text`, `images`, `openPanel`, and `focus`. Supported since `2.9.0`.
- `clearDraft(): Promise<void>`: Clear the AI Chat draft text and images. Supported since `2.9.0`.
- `consumeStream(input: { stream: ReadableStream<Uint8Array>; signal?: AbortSignal }): Promise<void>`: Consume the streaming response returned by the Dino-GSP backend.
- `pushStreamEvent(event: AiStreamEventV1): void`: Low-level event push API, mainly for SDK internals or integration debugging with the Dino-GSP backend. Normal integrations should prefer `consumeStream`.

```typescript
await editor.ai.setDraft({
  text: 'Create a geometry problem based on this figure',
  images: ['https://example.com/figure.png'],
  openPanel: true,
  focus: true,
});

await editor.ai.clearDraft();

editor.on('aiRequest', async ({ payload, signal }) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  });

  await editor.ai.consumeStream({
    stream: response.body!,
    signal,
  });
});
```

### 6. Lifecycle API

- `destroy(): Promise<void>`: Destroy the SDK instance, remove the iframe, clean up message listeners, and cancel pending requests.

```typescript
await editor.destroy();
```

## Event Listening

Use `editor.on(event, listener)` to subscribe; it returns an unsubscribe function. You can also use `editor.off(event, listener)` to unsubscribe manually.

**Supported events:**

| Event           | Event data                                                 | Description                                                                             |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `ready`         | `{ type: 'ready', mode, version }`                         | iframe initialization complete                                                          |
| `contentChange` | `{ type: 'contentChange', source: 'user', content }`       | Fires after the user edits inside the iframe; returns the full `FileContentLatest`         |
| `slideChange`   | `{ type: 'slideChange', index }`                           | Fires after the user switches slides inside the iframe; returns the current index       |
| `save`          | `{ type: 'save', stage: 'request' \| 'success', content }` | `stage: 'request'`: host handles persistence; `stage: 'success'`: save flow is complete |
| `aiRequest`     | `{ type: 'aiRequest', payload, signal }`                   | Embedded editor asks the host to run one AI request. Supported since `2.8.0`.          |
| `aiCancel`      | `{ type: 'aiCancel', runId, reason }`                      | The active AI request was canceled. Supported since `2.8.0`.                           |

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

---

### `aiRequest` Event

Fires when the user starts an AI conversation in the embedded editor. The host should send `payload` as-is to the host backend, let the host backend forward it to the Dino-GSP backend, and handle the returned stream through `editor.ai.consumeStream()`.

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error('AI service request failed');
  }

  await editor.ai.consumeStream({
    stream: response.body,
    signal,
  });
});
```

`payload` is the AI request context generated by the editor. For normal integrations, forward it as-is. See [AI Chat in Editor](./ai-chat) for the full flow.

---

### `aiCancel` Event

Fires when the user cancels, a newer request supersedes the active request, or the SDK instance is destroyed.

```typescript
editor.on('aiCancel', (event) => {
  console.log('AI request canceled:', event.runId, event.reason);
});
```

`reason` values:

| Value        | Description                              |
| ------------ | ---------------------------------------- |
| `user`       | The user canceled the request            |
| `superseded` | A newer request replaced the active one  |
| `destroyed`  | The SDK instance was destroyed           |

