---
title: API Error Codes
description: Look up HTTP status codes, structured errors, Agent task errors, and embedded AI stream errors.
---

# API Error Codes

Look up HTTP status codes, structured errors, Agent task errors, and embedded AI stream errors.

## HTTP status codes {#http-status}

Failed HTTP API requests return `success: false`. For a string or validation object, use the HTTP status and message.

| Status | Meaning |
| --- | --- |
| `400` | Invalid request format or fields, such as JSON, form data, query parameters, project content, or a master template. |
| `401` | Missing or malformed Bearer credentials, or an invalid or inactive API key. |
| `402` | Insufficient credits or an embedded AI request that failed the credit eligibility check. |
| `403` | No credit account is bound, or the account is unavailable. |
| `404` | The task or embedded AI run is missing, has an invalid ID, or is outside the current API key scope. Task creation can also return this status if the created record cannot be reloaded. |
| `409` | The same `x-request-id` is in progress, or a state or credit update conflicts. |
| `422` | The request was parsed, but the canvas, view, dimensions, or primitives cannot be rendered as requested. |
| `499` | 3D rendering was cancelled. A disconnected client may receive no response. |
| `500` | The service failed to process the request. An out-of-range `slideIndex` also returns this status for legacy PNG, SVG, and TikZ. |
| `502` | An unrecognized response was returned. |
| `503` | The 3D render queue is full. |
| `504` | The 3D render deadline was exceeded, including time spent waiting in the queue. |

## Authorization and billing codes {#auth-billing}

These are the HTTP mappings for authorization and billing errors. Some paths return a message string only.

| Code / HTTP | Meaning |
| --- | --- |
| `INVALID_INPUT` / `400` | Authorization or billing input failed validation. |
| `UNAUTHENTICATED` / `401` | The authorization service could not verify the API key. |
| `INSUFFICIENT_CREDITS` / `402` | Insufficient credits. |
| `ACCOUNT_NOT_FOUND` / `403` | The authorization or billing service could not find the credit account. |
| `INVALID_STATE` / `409` | The current state does not allow the operation. |
| `CAS_CONFLICT` / `409` | Concurrent credit updates conflicted and internal retries were exhausted. |
| `CONFLICT` / `409` | An authorization or billing operation conflicted. |

## Render error codes {#render}

Read the render error code from `error.code`.

| Code / HTTP | Meaning |
| --- | --- |
| `UNSUPPORTED_3D_GEOMETRY` / `422` | Legacy PNG, SVG, and TikZ require an entirely 2D project. A 2D target canvas in PNG v2 also cannot contain 3D primitives. |
| `RENDER_INVALID_REQUEST` / `422` | The target canvas is invalid, the view and canvas dimensions differ, the bounds, camera, or crop are invalid, or either physical PNG dimension exceeds 2048 pixels. |
| `UNSUPPORTED_3D_PRIMITIVE` / `422` | The 3D canvas contains a primitive the renderer does not support. |
| `RENDER_CANCELLED` / `499` | Cancelled after a client disconnect or render worker pool shutdown. Start a new request if the connection is available and the export is still needed. |
| `RENDER_WORKER_FAILED` / `500` | The render failed or the worker exited or shut down. Check `retryable` in the response. |
| `RENDER_QUEUE_FULL` / `503` | The 3D render queue is full. Retry after the number of seconds in the `Retry-After` header. |
| `RENDER_TIMEOUT` / `504` | 3D rendering exceeded the deadline, including time spent in the queue. The request can be retried. |

## Agent task error codes {#agent-task}

The task list and detail APIs return failed tasks with HTTP `200`. When a task has `status: "error"`, read its `extra.errorCode` and `extra.errorMessage`.

| Code | Meaning |
| --- | --- |
| `input_image_fetch_failed` | The task could not retrieve an input image. |
| `artifact_upload_not_configured` | Project artifact upload is unavailable because the service configuration is missing. |
| `invalid_ai_environment` | The server-side AI environment is invalid or missing configuration. |
| `agent_execution_failed` | The Agent failed to execute the task. |

## Embedded AI stream error codes {#embedded-ai}

Once HTTP `200` opens the stream, read `code` and `error` from the JSON payload of a local terminal SSE `error` event. Stream relay or read failures may only carry a message. Upstream `response.failed` and `error` events use the provider’s own payload format.

| Code | Meaning |
| --- | --- |
| `invalid_ai_environment` | The server-side AI environment is invalid or missing configuration. |
| `unsupported_embedded_ai_model` | The model used for the streaming run is unsupported. |
| `embedded_ai_execution_failed` | The embedded AI run failed. |
