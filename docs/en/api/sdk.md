---
title: SDK API Reference
description: API docs - AlgeoSdk.create, loadShareById, loadFile, switchSlide, repl, and more
---

# SDK API Reference

## Constants

### VERSION

SDK version string, injected at build time.

```javascript
import { VERSION } from '@dajiaoai/algeo-sdk';
console.log('Dino-GSP SDK version:', VERSION);
```

## Class AlgeoSdk

### AlgeoSdk.create(container, options?): Promise\<AlgeoSdk\>

Asynchronously create and initialize an SDK instance. Resolves when the iframe loads and receives the ready message.

| Parameter  | Type              | Description                    |
| ---------- | ----------------- | ------------------------------ |
| `container`| `HTMLElement`     | DOM container for the iframe   |
| `options`  | `AlgeoSdkOptions` | Optional configuration         |

**AlgeoSdkOptions:**

| Property    | Type     | Default                   | Description                                                       |
| ----------- | -------- | ------------------------- | ----------------------------------------------------------------- |
| `baseUrl`   | `string` | `'https://dajiaoai.com'`  | Base URL for the embed page                                       |
| `initialId` | `string` | `''`                      | Initial share ID to load; empty for a blank canvas                |

### Instance Properties (read-only)

| Property  | Type             | Description                                              |
| --------- | ---------------- | -------------------------------------------------------- |
| `ready`   | `boolean`        | Whether ready (received iframe ready notification)       |
| `version` | `string \| null` | Embed page protocol version                              |

### Instance Methods

Organized by use case for quick reference.

| I want to…              | Method                            |
| ----------------------- | --------------------------------- |
| Load shared content     | [loadShareById](#loadsharebyid)   |
| Import file data        | [loadFile](#loadfile)             |
| Switch slide / page     | [switchSlide](#switchslide)       |
| Get slide count         | [getSlideCount](#getslidecount)   |
| Programmatic canvas ops | [repl](#repl)                     |
| Destroy and cleanup     | [destroy](#destroy)               |

---

#### loadShareById

Load canvas content by share ID. Use when you have an existing share link.

`loadShareById(id: string)` → `Promise<{ success: true }>`

| Parameter | Description              |
| --------- | ------------------------ |
| `id`      | Share ID, e.g. `'33TA3484'` |

---

#### loadFile

Load full file content (overwrite mode). Must conform to FileContentV10 format. Use when importing structured data from question banks, textbooks, etc.

`loadFile(content: FileContentV10)` → `Promise<{ success: true }>`

| Parameter  | Description                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `content`  | File content object; see [algeo-protocol repository](https://github.com/dajiaoai/algeo-protocol) for type definitions |

---

#### switchSlide

Switch to the slide at the given index (0-based). Use for multi-page canvases and slide-style presentations.

`switchSlide(index: number)` → `Promise<{ success: true }>`

| Parameter | Description              |
| --------- | ------------------------ |
| `index`   | Slide index, 0-based      |

---

#### getSlideCount

Get the total number of slides in the currently loaded content. Often used with `switchSlide` for paging and navigation.

`getSlideCount()` → `Promise<{ count: number }>`

---

#### repl

Execute a single REPL command. REPL is the canvas’s interactive command interface, providing full control for AI and developers: slide management, defining geometry objects, querying state, style control, etc. Output is in AI-oriented document/text format (tables, structured text) for easy parsing and decision-making.

See [REPL Capabilities](../guide/repl).

`repl(command: string)` → `Promise<{ output: string }>`

| Parameter  | Description                                                                       |
| ---------- | --------------------------------------------------------------------------------- |
| `command`  | Single REPL command, e.g. `help`, `list`, `list_slides`, `def A := Point(0,0)`    |

---

#### destroy

Remove the iframe and event listeners, and reject all pending requests. Call when unmounting the component.

`destroy()` → `void`
