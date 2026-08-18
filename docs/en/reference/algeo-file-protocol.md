---
title: Dino-GSP Project File (.algeo) Protocol
description: JSON structure, versions, canvases, and master templates in a Dino-GSP project file
---

# Dino-GSP Project File (`.algeo`) Protocol

A Dino-GSP project file stores an editable, interactive geometry project.

This page describes the latest V11 protocol.

## File and version

| Item | Current standard |
| --- | --- |
| Extension | `.algeo` or `.json` |
| Content | UTF-8 JSON |
| MIME type | `application/vnd.dino-algeo.project+json` |
| Latest protocol version | String `"11"` |
| Version field | `metadata.version` |

::: warning
`metadata.version` must be a string. Do not migrate an old file by changing this value manually. Load it with a compatible Dino-GSP editor or SDK and export it again.
:::

## Top-level structure

```typescript
interface FileContentLatest {
  slides: SlideV2[];
  messages: SeedChatMessage[][];
  templateStyle?: SlideStyleSheetV2;
  metadata: {
    version: '11';
    shareOptions?: ShareOptions;
  };
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `slides` | `SlideV2[]` | Yes | Ordered list of canvases in the project. |
| `messages` | `SeedChatMessage[][]` | Yes | AI conversations. The outer array contains conversations; each inner array contains its messages. Use `[]` when there are none. |
| `templateStyle` | `SlideStyleSheetV2` | No | Project master template with the same shape as a canvas `styleSheet`. |
| `metadata` | object | Yes | File version and sharing options. |

## Canvas `SlideV2`

```typescript
interface SlideV2 {
  definitions: DefinitionV2[];
  uvarMap: [string, number][];
  styleSheet: SlideStyleSheetV2;
  doc: DocOp[];
  camera?: SlideCamera | SlideCamera3D;
}
```

| Field | Type | Description |
| --- | --- | --- |
| `definitions` | `DefinitionV2[]` | Definitions for points, lines, circles, functions, text, sliders, buttons, images, and other objects. Order affects dependency resolution. |
| `uvarMap` | `[string, number][]` | Current user-variable values as `[name, value]` pairs, including dynamic state such as dragged coordinates and slider values. |
| `styleSheet` | `SlideStyleSheetV2` | Canvas background, axes, grid, type defaults, and per-object styles. |
| `doc` | `DocOp[]` | Associated rich-text content in Quill Delta Op form. |
| `camera` | `SlideCamera \| SlideCamera3D` | Optional 2D or 3D camera state. |

## Project master template

`templateStyle` is an optional project-level master template with the same shape as `slides[].styleSheet`. It is stored separately from the current style of each canvas:

- `templateStyle` is the reusable project master.
- `slides[].styleSheet` is the style currently stored on an individual canvas.
- Applying a master template preserves per-object styles keyed by object ID.

A project master should contain reusable visual styles only. Axis or grid ranges, intervals, visibility and locking state, and per-object styles should not propagate as master-template properties.

## Reading and writing guidance

- Store the complete object, not only `slides[].definitions`; variable values, styles, rich text, cameras, conversations, and the master template are all project content.
- `JSON.stringify(content, null, 2)` produces an inspectable `.algeo` or `.json` file. Parse JSON first when reading, then validate the protocol version and required fields.
- Do not manually generate complex geometry DSL. Prefer complete content returned by the SDK, or generate projects through REPL, MCP, or the Agent API.
- Do not guess the meaning of fields in an unknown version. Upgrade the integration component or convert the file with a compatible editor.

## Use in each integration

- **SDK**: Read and write complete projects with editor-mode `getContent()` / `loadContent()`, or presentation-mode `loadFile()`.
- **HTTP API**: The Render API accepts complete `FileContentLatest` in its `content` field.
- **MCP**: `import_project` imports a complete project and `export_project` exports an `.algeo` file.
