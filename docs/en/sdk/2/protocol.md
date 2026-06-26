---
title: SDK 2.x Protocol and Data Format
description: FileContentLatest data structure and integration guidance
---

# Protocol and Data Format

Dino-GSP SDK 2.x has two protocol layers:

- **File content protocol**: a JSON-based domain-specific language (DSL) describing document metadata, multi-slide content, AI chat history, and geometry entities.
- **Embed messaging protocol**: `postMessage` messages exchanged between the SDK and the embedded editor/presentation page. Starting from SDK 2.8.0, editor mode includes the AI Chat request and streaming response protocol.

Current SDK version: `@dajiaoai/algeo-sdk@2.8.0`<br>
Current protocol package: `@dajiaoai/algeo-protocol@1.5.0`

## File Content Structure

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

## Embed Messaging Protocol

The SDK communicates with the embedded page through `postMessage`. Most calls are wrapped by the SDK, so application code usually does not need to construct messages manually. The structures below are useful when debugging the bridge or implementing a custom host integration.

### Common Response

Every request with a `requestId` receives a common response:

```typescript
interface EmbedResponseMessage {
  type: 'response';
  requestId: string;
  success: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

When the embedded page is ready, it sends:

```typescript
interface EmbedReadyMessage {
  type: 'ready';
  version: string;
}
```

### Common Messages

| Message Type      | Direction          | Description                         |
| :---------------- | :----------------- | :---------------------------------- |
| `loadShareById`   | SDK -> embed page  | Load a file by share ID             |
| `loadFile`        | SDK -> embed page  | Load a full `FileContentLatest`     |
| `switchSlide`     | SDK -> embed page  | Switch the current slide            |
| `getSlideCount`   | SDK -> embed page  | Get the number of slides            |
| `repl`            | SDK -> embed page  | Execute one REPL command            |
| `save`            | embed page -> SDK  | Ask the host to save the file       |
| `aiRequest`       | embed page -> SDK  | Ask the host to run one AI request  |
| `aiStreamEvent`   | SDK -> embed page  | Push an AI streaming event          |
| `aiCancel`        | bidirectional event | Notify that an AI request was canceled |

## AI Chat Protocol (SDK 2.8.0+)

In editor mode, the embedded page sends an `aiRequest` event to the host page. The host is responsible for calling its own AI service and streaming the result back to the embedded editor through the SDK.

### AI Request Payload

```typescript
interface AiRunPayloadV1 {
  model_id: string;
  messages: OpenAiChatMessageV1[];
  extra_openai_params?: Record<string, unknown>;
}

interface OpenAiChatMessageV1 {
  role: string;
  content:
    | string
    | Array<{
        type: string;
        [key: string]: unknown;
      }>;
  name?: string;
  [key: string]: unknown;
}
```

Host-side listener example:

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  });

  await editor.ai.consumeStream({
    stream: response.body!,
    signal,
  });
});
```

### AI Stream Events

The SDK supports two ways to send AI results back to the editor:

1. `editor.ai.consumeStream(...)`: consumes a `ReadableStream<Uint8Array>` in SSE format.
2. `editor.ai.pushStreamEvent(...)`: pushes an already parsed event object.

The current `AiStreamEventV1` is a raw SSE event:

```typescript
interface AiRawSseEventV1 {
  type: 'raw';
  runId: string;
  event: string;
  data: Record<string, unknown>;
}

type AiStreamEventV1 = AiRawSseEventV1;
```

SSE frame example:

```text
event: response.output_text.delta
data: {"type":"response.output_text.delta","delta":"Draw a triangle","response":{"id":"run_123","model":"gpt-4.1"}}
```

Terminal events end the active AI run. The SDK currently recognizes:

| Terminal Type         | Description        |
| :-------------------- | :----------------- |
| `response.completed`  | Completed normally |
| `response.failed`     | Failed             |
| `response.incomplete` | Incomplete result  |
| `error`               | Error              |
| `run.cancelled`       | Canceled           |

### Cancellation Semantics

The host receives an `AbortSignal` in the `aiRequest` event:

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  signal.addEventListener('abort', () => {
    // Cancel the host-side AI request.
  });
});
```

When the user cancels, a new request supersedes the active one, or the SDK instance is destroyed, the SDK emits `aiCancel`:

```typescript
interface AiCancelEvent {
  type: 'aiCancel';
  runId: string | null;
  reason: 'user' | 'superseded' | 'destroyed';
}
```

## Error Codes

| Error Code                    | Description                                      |
| :---------------------------- | :----------------------------------------------- |
| `EMBED_LOAD_SHARE_FAILED`     | Failed to load a shared file                     |
| `EMBED_LOAD_FILE_FAILED`      | Failed to load file content                      |
| `EMBED_APPLY_CONTENT_FAILED`  | Failed to apply file content                     |
| `EMBED_SWITCH_SLIDE_FAILED`   | Failed to switch slide                           |
| `EMBED_INVALID_SLIDE_INDEX`   | Invalid slide index                              |
| `EMBED_GET_SLIDE_COUNT_FAILED` | Failed to get slide count                       |
| `EMBED_INVALID_REPL_COMMAND`  | Invalid REPL command                             |
| `EMBED_REPL_EXECUTE_FAILED`   | Failed to execute REPL command                   |
| `EMBED_UNKNOWN_METHOD`        | Unknown method                                   |
| `EMBED_UNKNOWN_ERROR`         | Unknown error                                    |
| `EMBED_MISSING_APP_ID`        | Missing required `appId` for editor mode         |
| `EMBED_BAD_REQUEST`           | Bad request or missing host-side handler         |
| `EMBED_IFRAME_NOT_READY`      | iframe is not ready                              |
| `EMBED_TIMEOUT`               | Request timed out                                |
| `EMBED_DESTROYED`             | SDK instance has been destroyed                  |
