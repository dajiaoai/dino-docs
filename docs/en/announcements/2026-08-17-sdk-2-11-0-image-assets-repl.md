---
title: SDK 2.11.0 Adds Image Libraries, Third-Party Images, and REPL Image Support
description: SDK 2.11.0 connects custom image libraries to the editor, lets MCP and API workflows insert third-party images into slides, and adds Image definitions to the REPL protocol.
---

# SDK 2.11.0 Adds Image Libraries, Third-Party Images, and REPL Image Support

- Type: New capability
- Release date: 2026-08-17
- Effective date: 2026-08-17
- Affected users: Developers using SDK 2.x embedded editor mode, MCP, the Intelligent Image Generation API, or REPL
- Action required: Existing integrations require no changes. To use the new capabilities, provide absolute HTTP(S) image URLs that are accessible from the browser or server.

## What's New

This release connects image insertion across the embedded editor, MCP/API, and REPL:

1. **Custom image libraries in SDK editor mode**: Pass a `resourceLibrary` Provider when creating the editor. The host handles material queries, pagination, search, and authorization, while the embedded editor displays the materials and inserts the selected image into the current slide.
2. **Third-party images in MCP/API slides**: MCP and the Intelligent Image Generation API can now use an absolute HTTP(S) image URL as an image material in a slide. When exporting an image, the server loads and renders these remote image resources.
3. **Image definitions in the REPL protocol**: Use the `Image` constructor to define a remote image as a slide object, then continue to inspect it, style it, and export the project through REPL.

## Custom SDK Image Libraries

SDK integrators can register a material query Provider when creating the editor:

```ts
const editor = await createEditor(container, {
  auth: { appId: 'YOUR_APP_ID' },
  resourceLibrary: {
    async query(params, { signal }) {
      const response = await fetch('/api/materials/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal,
      });

      return response.json();
    },
  },
});
```

Images remain stored and authorized by the integrator. If `resourceLibrary` is not configured, the editor does not show the image library entry.

## Insert Third-Party Images through MCP/API

In an MCP or Intelligent Image Generation API task, you can ask the Agent to place a specified remote image into the slide. A third-party image URL must:

- Be an absolute `http://` or `https://` URL.
- Be directly accessible to the Dino-GSP MCP/API server.
- Not be a local file path, `file://` URL, `blob:` URL, or Base64 content.

If the image comes from a chat attachment, local file, or clipboard, upload it first to a publicly accessible HTTP(S) URL or one with a valid temporary signature. You can then add that URL to the slide as an image object.

## REPL Image Definitions

Insert a third-party image through REPL:

```text
def img := Image("https://example.com/image.png")
```

The `Image` argument is the image resource identifier. In MCP/API server environments, this identifier should be an absolute HTTP(S) image URL that the server can access.

Use the help command to view the complete syntax supported by the current environment:

```text
help Image
```

## Related Links

- [Insert Images from a Material Library](/en/sdk/2/image-material-library)
- [Editor Mode](/en/sdk/2/editor)
- [MCP Integration](/en/ai/mcp)
- [Intelligent Image Generation API](/en/api/agent)
- [REPL Capabilities](/en/sdk/repl)
