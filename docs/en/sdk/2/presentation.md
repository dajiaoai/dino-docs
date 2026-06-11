---
title: SDK 2.x Presentation Mode
description: Presentation-mode entry points, methods, and usage focus
---

# Presentation Mode

Presentation mode is primarily for content distribution and display scenarios in third-party systems, such as online question banks and courseware platforms.

## Characteristics

- **Lightweight and efficient**: Does not load the editing toolset, resulting in lower resource usage.
- **Deep control**: Supports precise intervention in canvas state via API.

## Creating an Instance

```typescript
import { createPresentation, EmbeddedPresentation } from '@dajiaoai/algeo-sdk';

/**
 * @param container  DOM node to mount the canvas
 * @param options    Initialization options
 */
const presentation: EmbeddedPresentation = await createPresentation(container, {
  shareId: 'optional-initial-id',
});
```

### UI Configuration

```typescript
const presentation: EmbeddedPresentation = await createPresentation(container, {
  ui: {
    logo: true,
  },
});
```

| Property  | Type      | Default | Description                                                  |
| --------- | --------- | ------- | ------------------------------------------------------------ |
| `ui.logo` | `boolean` | `true`  | Whether to show the logo watermark. Supported since `2.7.0`. |

## API Reference

### `loadShareById(id: string): Promise<Result>`

Load content by a Dino-GSP share ID.

- **Parameter**: `id`: string (e.g. `'33TA3484'`)
- **Returns**: Metadata indicating load success or failure.

### `loadFile(content: FileContentLatest): Promise<Result>`

Load structured JSON data conforming to the FileContentLatest protocol.

- **Parameter**: `content`: see [Protocol Reference](./protocol)

### `switchSlide(index: number): Promise<Result>`

Jump to the slide at the specified index (0-based).

- **Parameter**: `index`: number

### `getSlideCount(): Promise<{ count: number }>`

Get the total number of slides in the current document.

### `repl(command: string): Promise<Result>`

Core API: send a REPL execution sequence to the canvas. Can be used for automated drawing, parameter setting, and more.

- **Example**: `presentation.repl('def A := Point(0,0)')`
- **Full command reference**: [REPL Capabilities](/en/sdk/repl)

### `destroy(): void`

Destroy the current instance, remove DOM content, and release communication listeners.

## Event Subscription

`on(event, listener)` returns an unsubscribe function that should be called before component unmount or instance destruction to avoid memory leaks.

```typescript
// Subscribe to the ready event; proceed with operations once the canvas is ready
const unsubscribe = presentation.on('ready', (event) => {
  console.log('Canvas ready, iframe version:', event.version);
  console.log('Current mode:', event.mode);
});

// Unsubscribe when no longer needed
unsubscribe();
```

| Event   | Triggered when                                      | Callback type                                              |
| ------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `ready` | iframe finishes initialization; API calls can begin | `{ type: 'ready', mode: string, version: string \| null }` |

