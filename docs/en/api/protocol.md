# Protocol Reference

This document describes the postMessage communication protocol between the Dino-GSP embedded canvas and the parent page.

Type definitions (e.g. `FileContent`, `Slide`) are available in the [algeo-protocol repository](https://github.com/dajiaoai/algeo-protocol).

## Error Codes (Embed Protocol) {#error-codes}

| Code                         | Description                                                                 |
| ---------------------------- | --------------------------------------------------------------------------- |
| `EMBED_LOAD_SHARE_FAILED`    | Load share failed (share not found, parse error, etc.; loadShareById)       |
| `EMBED_LOAD_FILE_FAILED`     | Load file failed (invalid content; loadFile)                                |
| `EMBED_APPLY_CONTENT_FAILED` | Failed to apply content to canvas                                           |
| `EMBED_SWITCH_SLIDE_FAILED`  | Switch slide failed                                                          |
| `EMBED_INVALID_SLIDE_INDEX`  | Invalid slide index                                                          |
| `EMBED_GET_SLIDE_COUNT_FAILED` | Failed to get slide count                                                  |
| `EMBED_INVALID_REPL_COMMAND` | Invalid REPL command (empty or non-string)                                   |
| `EMBED_REPL_EXECUTE_FAILED`  | REPL execution failed                                                        |
| `EMBED_UNKNOWN_METHOD`       | Unknown postMessage method                                                   |
| `EMBED_UNKNOWN_ERROR`        | Unknown error                                                                |
| `EMBED_BAD_REQUEST`          | Bad request                                                                  |
| `EMBED_IFRAME_NOT_READY`     | iframe not ready                                                             |
| `EMBED_TIMEOUT`              | Request timeout                                                              |
| `EMBED_DESTROYED`            | Instance destroyed                                                           |
