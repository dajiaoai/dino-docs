---
title: How to Use Style Master Templates
description: Download a master template and reuse consistent visual styles across MCP, the Embedded SDK, AI figure generation, and rendering APIs
---

# How to Use Style Master Templates

A style master template provides consistent canvas backgrounds, grids, axes, and default styles for objects such as points, lines, circles, and text. When preparing geometry diagrams for question banks, lessons, or publication, you can reuse the same template across drawing, embedded display, and export workflows.

In this tutorial, “master template” and “style master template” refer to the same style data. A template does not contain the geometric construction for a problem. Existing projects must still be loaded separately, and new diagrams still require a drawing prompt.

![Style master template demonstration](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/e0bcf737-screenshot-20260920-143134.png)

[Try the style master template demo](https://dajiaoai.github.io/algeo-sdk/examples/15-presentation-master-template.html)

## 1. Download a template

Open the [Dino-GSP master templates](https://dajiaoai.com/master-templates) page, choose a style, and download its JSON file. The examples below name this file `template.json`.

| Use case | Entry point | Template format |
| --- | --- | --- |
| Have AI draw through MCP | `load_template` | An object in `template_content`, or a public HTTPS URL in `template_url` |
| Edit or present with the Embedded SDK | `mode.setMasterTemplate(template)` | JSON string |
| Generate figures through the HTTP API | `template` in `/api/agent/run` | JSON string in a form field |
| Export images or TikZ through the HTTP API | `template` in a rendering endpoint | Object in the JSON request body |

## 2. Apply a template when drawing or displaying

### MCP: tell AI where the template is and where to apply it

Complete [MCP setup](/en/ai/mcp/), upload the template JSON to the conversation, and send:

```text
Read the template file I uploaded, apply it to all existing canvases,
and set it as the default template for canvases created later.
Then draw an equilateral triangle with side length 4.
```

If the file is hosted at a public HTTPS URL, you can also ask AI to load it from there. The following example shows the parameters for `load_template`. Replace the example URL with an accessible URL pointing directly to your JSON file:

```json
{
  "template_url": "https://example.com/template.json",
  "applyToAllSlides": true,
  "setAsGlobal": true
}
```

`applyToAllSlides` affects all existing canvases. `setAsGlobal` affects canvases created later in the current session. To modify only selected canvases, replace `applyToAllSlides` with `applyToSlideIndexes: [1, 3]`. Canvas indexes start at `1`.

Pass local file contents as an object through `template_content`. Provide either `template_content` or `template_url`, but not both. See [Using Master Templates in MCP](/en/ai/mcp/master-template) for the full parameters and application rules.

### SDK: set the template after loading the project

The SDK supports `mode.setMasterTemplate()` starting with `2.9.0`. Create an instance and load your project following the [Editor Mode](/en/sdk/2/editor) or [Presentation Mode](/en/sdk/2/presentation) documentation, then pass the template as a JSON string.

The following example assumes your host website serves the downloaded file at `/template.json` and `editor` has finished initializing:

```typescript
const response = await fetch('/template.json');
if (!response.ok) {
  throw new Error(`Failed to read template: ${response.status}`);
}
const masterTemplateContent = await response.text();

await editor.mode.setMasterTemplate(masterTemplateContent);
```

In presentation mode, use the same string to apply the template to the currently loaded canvas:

```typescript
await presentation.mode.setMasterTemplate(masterTemplateContent);
```

Wait for the call to finish before inspecting the canvas or exporting it.

### AI figure generation API: include the template when creating a task

Submit the template with your drawing prompt. Run the following command in the directory containing `template.json`, replacing `djo_xxx` with your API Key:

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1" \
  -F "content=Draw an equilateral triangle with side length 4 and label its vertices A, B, C." \
  -F "template=<./template.json"
```

`template=<./template.json` reads the file contents into a text form field. This field requires a JSON string; do not replace it with the file-upload syntax `template=@./template.json`.

After the endpoint returns a `taskId`, query task details as described in the [AI Figure Generation API](/en/api/agent) and retrieve the result once the task finishes.

## 3. Reuse the template in rendering APIs

You can also specify a template when exporting an existing project. Save the complete project as `project.algeo` in the same directory as `template.json`. The following example requires `jq`, which reads both files as JSON objects and constructs a PNG export request:

```bash
jq -n \
  --slurpfile project project.algeo \
  --slurpfile template template.json \
  '{content: $project[0], slideIndex: 1, template: $template[0]}' | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

Here, `template` is an object; do not wrap it in a string with `JSON.stringify()`. If omitted, the target canvas keeps its existing styles. This example uses the camera settings saved in the canvas. On success, retrieve the image from the response's `url` field.

The [PNG](/en/api/render-v2), [SVG](/en/api/render-svg), and [TikZ](/en/api/render-tikz) export endpoints all support a `template` object. Follow the documentation for each endpoint when supplying other request parameters.

## Frequently Asked Questions (Q&A)

### How can I confirm that the template has been applied?

Use a canvas containing points, lines, and text labels to check the background, line colors, line widths, and text styles. Then switch canvases or export to confirm the template has been applied wherever intended.

### Why does an object keep its original color?

A template supplies default styles for object types. Existing styles assigned to individual objects by ID are preserved, so some objects may retain their own colors or line widths. To make them consistent, inspect and remove or adjust those individual styles.

### Why doesn't the template make composition and image dimensions consistent?

Templates reuse visual styles. Axis and grid ranges, spacing, visibility, and lock states should not propagate across canvases through a template. See the [Project File Protocol](../reference/algeo-file-protocol) for the relationship between project templates and canvas styles.

To keep composition and pixel dimensions consistent across workflows, also standardize the export bounds and scale parameters. See [Consistent Image Export Across Workflows](./consistent-image-export).
