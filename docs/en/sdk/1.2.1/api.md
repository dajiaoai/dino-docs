---
title: SDK 1.2.1 API Reference
description: AlgeoSdk class, methods, and event reference for SDK 1.2.1
---

# SDK 1.2.1 API Reference

This document describes the public API provided by the `AlgeoSdk` class in version 1.2.1.

## Creating an Instance

### `AlgeoSdk.create(container, options): Promise<AlgeoSdk>`

Asynchronously create and initialize an SDK instance. Resolves when the iframe loads and receives the `ready` message.

- **container**: `HTMLElement` — DOM container for the iframe.
- **options**: `AlgeoSdkOptions` — Creation configuration.
  - `initialId`: `string` (optional) — Initial share ID to load.

---

## Instance Methods

All instance methods return a `Promise` and resolve/reject after the iframe responds or times out.

### `loadShareById(id: string): Promise<void>`

Load the canvas content for the specified share ID.

### `loadFile(content: FileContentLatest): Promise<void>`

Inject canvas JSON content conforming to the protocol spec.

### `switchSlide(index: number): Promise<void>`

Switch to the slide at the specified index (0-based).

### `getSlideCount(): Promise<{ count: number }>`

Query the total number of slides in the currently open file.

### `repl(command: string): Promise<{ output: string }>`

Execute a REPL command in the current canvas context.

### `destroy(): void`

Manually destroy the SDK instance, removing the iframe and its listeners.

