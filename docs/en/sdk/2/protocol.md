---
title: SDK 2.x Protocol and Data Format
description: FileContentLatest data structure and integration guidance
---

# Protocol and Data Format

Dino-GSP SDK uses a JSON-based domain-specific language (DSL). The protocol describes document metadata, multi-slide structure, and the underlying geometric entities.

## Basic Structure

A standard document JSON object (`FileContentLatest`) contains the following core fields:

```typescript
interface FileContentLatest {
  slides: SlideV2[];
  messages: SeedChatMessage[];
  metadata: {
    version: '11';
  };
}
```

Each `SlideV2` slide object has the following structure:

```typescript
interface SlideV2 {
  definitions: DefinitionV2[]; // list of geometric object definitions
  uvarMap: [string, number][]; // current value map for user variables (sliders, etc.)
  styleSheet: SlideStyleSheetV2; // canvas stylesheet (background, axes, grid, per-object styles, etc.)
  doc: DocOp[]; // canvas rich-text content (Quill Delta format)
}
```

## Core Field Reference

| Field                  | Type                 | Description                                                                            |
| :--------------------- | :------------------- | :------------------------------------------------------------------------------------- |
| `metadata.version`     | `'11'`               | Protocol version number; always the string `"11"`                                      |
| `slides`               | `SlideV2[]`          | Slide array; each slide represents an independent geometry canvas                      |
| `slides[].definitions` | `DefinitionV2[]`     | List of geometric object definitions: points, lines, circles, functions, sliders, etc. |
| `slides[].uvarMap`     | `[string, number][]` | Current value map for user variables (sliders, etc.), as `[name, value]` pairs         |
| `slides[].styleSheet`  | `SlideStyleSheetV2`  | Canvas stylesheet including background, axes, grid, and per-object style config        |
| `slides[].doc`         | `DocOp[]`            | Canvas rich-text content (Quill Delta Op format)                                       |
| `messages`             | `SeedChatMessage[]`  | AI conversation history including user and assistant messages                          |

## Integration Tips

1. **Direct storage**: In editor mode, you can save the retrieved JSON object as-is directly to your database.
2. **Dynamic generation**: If you need to generate figures on the server or AI side, it is recommended to send drawing sequences to the canvas via `REPL` rather than manually constructing the `definitions` array. The underlying figure definition syntax (Style v2) is complex, and manual construction is error-prone.

