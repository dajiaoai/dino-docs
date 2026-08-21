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
  auth: { appId: 'YTVJDQZR' },
  shareId: 'optional-initial-id',
});
```

See [Getting Started: Getting an appId](./getting-started.html#_4-getting-an-appid) for how to get an `appId`.

### UI Configuration

```typescript
const presentation: EmbeddedPresentation = await createPresentation(container, {
  auth: { appId: 'YTVJDQZR' },
  ui: {
    logo: true,
    slidePanel: true,
    pencilToolbar: true,
    zoomControl: true,
  },
});
```

| Property             | Type      | Default | Description                                                   |
| -------------------- | --------- | ------- | ------------------------------------------------------------- |
| `ui.logo`            | `boolean` | `true`  | Whether to show the logo watermark. Supported since `2.7.0`.  |
| `ui.slidePanel`      | `boolean` | `true`  | Whether to show the slide manager. Supported since `2.10.0`.  |
| `ui.pencilToolbar`   | `boolean` | `true`  | Whether to show the pencil toolbar. Supported since `2.10.0`. |
| `ui.zoomControl`     | `boolean` | `true`  | Whether to show the zoom controls. Supported since `2.10.0`.  |

## API Reference

After creation, the SDK checks the current page `hostname` against the Open Platform
allowlist using `auth.appId`. If the check fails, the iframe still initializes and an
instance is returned, but subsequent presentation APIs reject and log the method name.

### `loadShareById(id: string): Promise<{ success: true }>`

Load content by a Dino-GSP share ID.

- **Parameter**: `id`: string (e.g. `'33TA3484'`)
- **Returns**: `{ success: true }`

### `loadFile(content: FileContentLatest): Promise<{ success: true }>`

Load structured JSON data conforming to the FileContentLatest protocol.

- **Parameter**: `content`: see [Dino-GSP Project File Protocol](/en/reference/algeo-file-protocol)

### `switchSlide(index: number): Promise<{ success: true }>`

Jump to the slide at the specified index (0-based).

- **Parameter**: `index`: number

### `getSlideCount(): Promise<{ count: number }>`

Get the total number of slides in the current document.

### `repl(command: string): Promise<{ output: string }>`

Core API: send a REPL execution sequence to the canvas. Can be used for automated drawing, parameter setting, and more.

- **Example**: `presentation.repl('def A := Point(0,0)')`
- **Full command reference**: [REPL Capabilities](/en/sdk/repl)

### `mode`

- `getUiConfig()`: Get the current UI configuration.
- `setUiConfig(config)`: Update the UI configuration.
- `setMasterTemplate(template)`: Apply the master template style to the currently loaded slides.

```typescript
await presentation.mode.setUiConfig({
  slidePanel: false,
  pencilToolbar: false,
  zoomControl: false,
});
```

#### `mode.setMasterTemplate(template: string)`

Starting from `2.9.0`, presentation mode supports applying a master template through `mode.setMasterTemplate` to align canvas backgrounds, grids, axes, and default object styles across the currently loaded slides. 

```typescript
await presentation.mode.setMasterTemplate(masterTemplateContent);
```

You can download master template data that can be passed directly to `setMasterTemplate` from the [Dino-GSP master template page](https://dajiaoai.com/master-templates).

### `resize(): void`

Supported since `2.10.0`.

Ask the embedded page to remeasure its container and redraw the canvas. The SDK calls
this automatically when the container size changes; call
`presentation.resize()` manually after other host layout changes when needed.

### `destroy(): Promise<void>`

Destroy the instance, remove the iframe and listeners, and reject all pending requests.

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
