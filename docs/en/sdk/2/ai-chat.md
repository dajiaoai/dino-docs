---
title: SDK 2.x AI Chat in Editor
description: Enable AI Chat in SDK editor mode and understand the integration flow, authentication boundaries, and billing model
---

# AI Chat in Editor

Starting from SDK `2.8.0`, editor mode supports an AI Chat panel. Users can start AI requests inside the embedded editor. The host page listens for those requests, calls its own AI service, and streams results back to the editor.

This capability is useful when you want to:

- Let users generate or modify geometry with natural language inside a question bank, lesson-planning system, or courseware authoring tool.
- Reuse the Dino-GSP editor inside your own AI tutor while converting model output into interactive geometry.
- Put AI generation and manual editing into the same content-production workflow.

## How It Works

AI Chat is a host-managed bridge:

1. The user enters a prompt in the embedded editor's AI Chat panel.
2. The embedded editor sends an `aiRequest` to the SDK.
3. The host page listens with `editor.on('aiRequest', ...)` and calls its own backend AI service.
4. The host streams results back through `editor.ai.consumeStream()` or `editor.ai.pushStreamEvent()`.
5. The editor displays the AI response and updates conversation/geometry state.

## Prerequisites

1. Use `@dajiaoai/algeo-sdk@2.8.0` or later.
2. Use editor mode through `createEditor(...)` with a valid `auth.appId`.
3. Configure your application in the Open Platform console, including allowed domains and related access settings.
4. Prepare a host backend endpoint that safely calls your AI model or Dino-GSP Open Platform AI/API services.

> Do not put model keys or server-side API tokens in browser code. `appId` can be used on the frontend; server credentials should stay on your backend.

## 1. Create the Editor and Show AI Chat

```typescript
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(document.getElementById('algeo-editor')!, {
  auth: {
    appId: 'YOUR_APP_ID',
  },
  ui: {
    navbar: true,
    aiChatPanel: true,
  },
});
```

You can also enable the AI Chat panel later:

```typescript
await editor.mode.setUiConfig({
  aiChatPanel: true,
});
```

## 2. Listen for AI Requests

When the user starts an AI conversation in the editor, the SDK emits `aiRequest`:

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  const response = await fetch('/api/algeo-ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error('AI service request failed');
  }

  await editor.ai.consumeStream({
    stream: response.body,
    signal,
  });
});
```

`payload` is `AiRunPayloadV1`:

```typescript
interface AiRunPayloadV1 {
  model_id: string;
  messages: OpenAiChatMessageV1[];
  extra_openai_params?: Record<string, unknown>;
}
```

See [Protocol and Data Format - AI Chat Protocol](./protocol#ai-chat-protocol-sdk-280) for the full protocol.

## 3. Backend Endpoint Guidance

The host backend usually does three things:

1. Check whether the current user is allowed to use AI features for this app.
2. Choose the actual model or service, such as your own model service, Dino-GSP API, or an OpenAI-compatible service.
3. Convert the model response into SDK-compatible SSE stream events.

A recommended backend response format is SSE:

```text
event: response.output_text.delta
data: {"type":"response.output_text.delta","delta":"Draw a triangle","response":{"id":"run_123","model":"gpt-4.1"}}

event: response.completed
data: {"type":"response.completed","response":{"id":"run_123","model":"gpt-4.1"}}
```

The SDK converts each SSE frame into `AiStreamEventV1` and forwards it to the embedded editor.

## 4. Push Parsed Events Directly

If your backend does not return SSE, you can convert the response yourself and call `pushStreamEvent`:

```typescript
editor.ai.pushStreamEvent({
  type: 'raw',
  runId: 'run_123',
  event: 'response.output_text.delta',
  data: {
    type: 'response.output_text.delta',
    delta: 'Draw a triangle',
    response: {
      id: 'run_123',
      model: 'gpt-4.1',
    },
  },
});
```

Push a terminal event when the run ends:

```typescript
editor.ai.pushStreamEvent({
  type: 'raw',
  runId: 'run_123',
  event: 'response.completed',
  data: {
    type: 'response.completed',
    response: {
      id: 'run_123',
      model: 'gpt-4.1',
    },
  },
});
```

## 5. Cancellation and Errors

`aiRequest` includes an `AbortSignal`. When the user cancels, a newer request supersedes the active request, or the SDK instance is destroyed, the signal is aborted:

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  signal.addEventListener('abort', () => {
    // Cancel the host-side AI request.
  });
});
```

You can also listen for `aiCancel`:

```typescript
editor.on('aiCancel', ({ runId, reason }) => {
  console.log('AI request canceled', runId, reason);
});
```

`reason` values:

| Value        | Description                              |
| ------------ | ---------------------------------------- |
| `user`       | The user canceled the request            |
| `superseded` | A newer request replaced the active one  |
| `destroyed`  | The SDK instance was destroyed           |

If the host does not register an `aiRequest` listener, the editor receives an error response indicating that no handler is configured.

## Authentication Model

### SDK Authentication

Editor mode requires `auth.appId`. The `appId` identifies your Open Platform application and is used to validate access origin and application configuration.

```typescript
const editor = await createEditor(container, {
  auth: {
    appId: 'YOUR_APP_ID',
  },
});
```

`appId` is not a server secret and may appear in frontend code. Do not expose server API tokens, model keys, or billing credentials in the browser.

### AI Service Authentication

The actual model request is handled by the host backend. The backend should handle:

- User login/session validation.
- Application permission checks.
- Quota or subscription checks.
- Server-side API token management.
- Risk control, audit logs, and request tracing.

The browser sends `AiRunPayloadV1` to the host backend; it should not directly access model-provider secrets.

## Billing Model

SDK AI Chat is a bridge capability. The SDK forwards AI requests from the editor to the host and forwards host streaming results back to the editor.

Actual cost depends on the AI service selected by the host:

| Integration Method                 | Who Pays                         | Notes                                      |
| ---------------------------------- | -------------------------------- | ------------------------------------------ |
| Host-owned AI service              | The host                         | Charged by the host's model/vendor/system  |
| Dino-GSP Open Platform AI/API      | Billed by Open Platform rules    | Call the service from your backend         |
| Third-party OpenAI-compatible API  | Billed by the third-party vendor | The SDK does not hold third-party secrets  |

We recommend recording user, application, model, token/usage, latency, and success/failure status on the host backend for quota control, billing reconciliation, and debugging.

## Minimal Integration Checklist

- [ ] Upgrade to `@dajiaoai/algeo-sdk@2.8.0` or later.
- [ ] Use `createEditor` with `auth.appId`.
- [ ] Enable `aiChatPanel` in `ui`.
- [ ] Listen for `aiRequest`.
- [ ] Handle user auth, quota checks, and AI service calls on the host backend.
- [ ] Stream results back with `consumeStream` or `pushStreamEvent`.
- [ ] Handle cancellation, timeouts, and errors.

