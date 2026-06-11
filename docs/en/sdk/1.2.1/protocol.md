---
title: SDK 1.2.1 Protocol Reference
description: Error codes and status definitions for SDK 1.2.1
---

# SDK 1.2.1 Protocol Reference

This document lists the error codes and their meanings returned by the SDK in version 1.2.1. When an SDK method call (such as `loadShareById`) fails, you can inspect the `code` property on the caught error object.

## Error Code Reference

| Code                         | Description                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `EMBED_LOAD_SHARE_FAILED`    | Failed to load the remote share ID. Check whether the share ID exists and the network connection. |
| `EMBED_LOAD_FILE_FAILED`     | Failed to inject FileContentLatest content. Verify that the JSON format conforms to the spec.        |
| `EMBED_SWITCH_SLIDE_FAILED`  | Failed to switch slide.                                                                           |
| `EMBED_INVALID_SLIDE_INDEX`  | Invalid slide index. Typically means the index exceeds the total slide count.                     |
| `EMBED_INVALID_REPL_COMMAND` | Invalid or empty REPL command.                                                                    |
| `EMBED_UNKNOWN_METHOD`       | The current version of the embedded page does not support this operation.                         |
| `EMBED_IFRAME_NOT_READY`     | Canvas not yet ready. Call APIs only after the `ready` event fires.                               |
| `EMBED_TIMEOUT`              | Request timed out (default 30 s).                                                                 |

