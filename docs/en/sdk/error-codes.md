---
title: SDK Error Codes
description: Look up errors from the embedded SDK and canvas, including those documented for SDK 1.2.1.
---

# SDK Error Codes

Read `code` on the SDK error. The table includes SDK-generated codes, embedded page codes, and codes documented for SDK 1.2.1. Where a row lists two values, match the exact string returned.

| Code | Meaning |
| --- | --- |
| `EMBED_MISSING_APP_ID` | The embedded editor was initialized without an `appId`. |
| `EMBED_BAD_REQUEST` / `BAD_REQUEST` | Invalid arguments or configuration. |
| `EMBED_IFRAME_NOT_READY` | The iframe is not ready. Wait for initialization to complete before making the call. |
| `EMBED_TIMEOUT` | Initialization or the request timed out. The default timeout is 30 seconds. |
| `EMBED_DESTROYED` | The SDK instance was destroyed before the call or while waiting for a response. |
| `EMBED_LOAD_SHARE_FAILED` | Failed to load a remote share. Check the share ID or network connection. |
| `EMBED_LOAD_FILE_FAILED` | Failed to load a project file. Check the project JSON format. |
| `EMBED_APPLY_CONTENT_FAILED` | Failed to apply project content. |
| `LOAD_FAILED` | The share is missing or could not be parsed, or the supplied project file is invalid. |
| `LOAD_CONTENT_FAILED` | The embedded canvas could not load the project content. |
| `GET_CONTENT_FAILED` | Failed to read project content. |
| `EMBED_SWITCH_SLIDE_FAILED` / `SWITCH_SLIDE_FAILED` | Failed to switch canvases. |
| `EMBED_INVALID_SLIDE_INDEX` / `INVALID_SLIDE_INDEX` | The canvas index is invalid or out of range. |
| `EMBED_GET_SLIDE_COUNT_FAILED` / `GET_SLIDE_COUNT_FAILED` | Failed to read the canvas count. |
| `EMBED_INVALID_REPL_COMMAND` / `INVALID_REPL_COMMAND` | The REPL command is empty or invalid. |
| `EMBED_REPL_EXECUTE_FAILED` / `REPL_EXECUTE_FAILED` | Failed to execute the REPL command. |
| `SET_MASTER_TEMPLATE_FAILED` | Failed to apply the master template. |
| `FONT_LOAD_FAILED` | Failed to load the font. |
| `UNSUPPORTED_CAMERA_MODE` | The target canvas type does not support the requested camera mode. |
| `INVALID_VIEW_CAMERA_3D` | Invalid 3D view camera parameters. |
| `INVALID_VIEW_BOUNDS` | Invalid canvas view bounds. |
| `EXPORT_IMAGE_FAILED` | Failed to export an image or TikZ. |
| `INVALID_HISTORY_INDEX` | Invalid history index. |
| `EMBED_UNKNOWN_METHOD` / `UNKNOWN_METHOD` | The embedded page does not support the method. |
| `EMBED_UNKNOWN_ERROR` / `UNKNOWN_ERROR` | An unclassified SDK or embedded page error. Check `message` and optional `details`. |
