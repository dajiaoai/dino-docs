---
title: Use Master Templates with MCP
description: Apply a master template to selected canvases, all canvases, or canvases created later through MCP
---

# Use Master Templates with MCP

A master template gives a project a consistent visual style, including the canvas background, grid, axes, and default styles for points, lines, circles, text, and other objects. Through MCP, an AI client can load a master template before drawing or apply one to existing canvases.

## Before you start

1. Connect the service as described in [MCP Integration](./).
2. Choose and download a master template JSON file from [Dino-GSP Master Templates](https://dajiaoai.com/master-templates).

## Quick start

Once the master template is ready, tell the AI only the **template source** and the **application scope**. The client will normally call `load_template` automatically, so you do not need to enter tool parameters manually.

### Option 1: Upload a local template

Upload the downloaded master template JSON to the conversation, then send:

```text
Read the master template file I uploaded, apply it to every existing canvas,
and make it the default for canvases created later.
Then draw an equilateral triangle with side length 4.
```

### Option 2: Provide a template URL

If the master template JSON is directly available through a public HTTPS URL, send:

```text
Load the master template at https://example.com/template.json, apply it to
canvases 1 and 3, and make it the default for canvases created later.
```

## The `load_template` tool

`load_template` loads a master template into the current MCP session. Each call needs one template source and at least one application mode.

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `template_content` | object | Exactly one template source | Inline master template JSON. Use this after the client has read a local template file. |
| `template_url` | string | Exactly one template source | A public HTTPS URL for the master template JSON. |
| `applyToSlideIndexes` | number[] | At least one application mode | Apply immediately to these 1-based canvas numbers. The array cannot be empty. |
| `applyToAllSlides` | boolean | At least one application mode | When `true`, apply immediately to every existing canvas. This takes precedence over `applyToSlideIndexes`. |
| `setAsGlobal` | boolean | At least one application mode | When `true`, use the template as the default for canvases created later in the current session. It can be combined with either immediate application option. |

Every call must follow these rules:

- Provide exactly one of `template_content` and `template_url`.
- Provide `applyToSlideIndexes`, `applyToAllSlides: true`, or `setAsGlobal: true`.
- Canvas numbers start at `1` and cannot exceed the number of canvases in the current project.

### How to choose

| Goal | Parameter choice |
| --- | --- |
| Use an uploaded template or a template already read by the client | `template_content` |
| Use a public remote template | `template_url` |
| Apply only to selected existing canvases | `applyToSlideIndexes` |
| Apply to every existing canvas | `applyToAllSlides: true` |
| Apply only to canvases created later | `setAsGlobal: true` |
| Apply to existing and future canvases | Combine `applyToAllSlides: true` and `setAsGlobal: true` |

::: info
If both `applyToSlideIndexes` and `applyToAllSlides: true` are provided, `applyToAllSlides` takes precedence.
:::

## FAQ

### Why did existing canvases not change after loading a template?

If you used only `setAsGlobal: true`, the template applies only to canvases created later in the current session. Also set `applyToAllSlides: true`, or select existing canvases with `applyToSlideIndexes`.

### Why did one object not fully adopt the template style?

A master template defines type defaults. If an existing object has a per-object style saved by object ID, that style is preserved. Ask the AI to clear or adjust that object's individual style and check again.

### How is template use billed?

Each successful `load_template` call is billed as a basic tool call. See [MCP Billing](./billing) for details.
