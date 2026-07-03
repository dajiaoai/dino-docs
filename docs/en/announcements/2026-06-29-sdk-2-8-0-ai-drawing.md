---
title: Embedded Editor AI Drawing, API, and Usage Reporting Are Now Available
description: Starting from SDK 2.8.0, embedded editor mode can enable the AI Chat panel, with the embedded-mode AI drawing API, console usage reporting, and billing flow now available.
---

# Embedded Editor AI Drawing, API, and Usage Reporting Are Now Available

- Type: New capability
- Published: 2026-06-29
- Effective date: 2026-06-29
- Audience: Developers using SDK editor mode, embedded AI drawing, or Open Platform APIs
- Action required: To enable this capability, upgrade the SDK, integrate the embedded-mode AI drawing API, and implement host-side request forwarding and quota checks

## What Changed

This launch includes three parts:

1. **SDK 2.8.0 supports AI drawing in the embedded editor**: editor mode can enable the AI Chat panel. When users start an AI drawing request, the host page listens for the SDK `aiRequest` event and passes the returned stream back to the editor with `editor.ai.consumeStream()`.
2. **The embedded-mode AI drawing API is available**: the host backend can forward the editor-generated AI request context to the Dino-GSP backend as-is. Dino-GSP handles model calls, geometry instruction generation, and streaming results. The browser does not need to, and should not, hold server-side API tokens.
3. **Console usage reporting is available**: the Open Platform console now shows application-level AI call usage and point consumption, making quota management, billing reconciliation, and debugging easier.

The overall flow is: the user enters a request in the embedded editor, the SDK emits `aiRequest`, the host backend performs user auth and quota checks before calling the Dino-GSP AI drawing API, and the frontend passes the returned stream back to the SDK so the editor can update conversation and drawing state.

## Billing Flow

Embedded editor AI drawing is bridged by the SDK. Actual billing is based on AI token usage produced by the Dino-GSP backend.

| Layer | Notes |
| --- | --- |
| Charged account | The application account that calls Dino-GSP Open Platform AI capabilities |
| Charge timing | Any request that produces AI token usage is charged by actual consumption; failure, cancellation, or disconnection does not automatically mean no charge |
| Pricing basis | Calculated by actual token `usage × model` price |
| Usage visibility | Call records and point consumption are available in the Open Platform console application details |
| Host quota | The host system may still enforce its own user quota, plans, usage count, or risk rules on the host backend |

## Use Cases

- Embed the Dino-GSP editor in your own product and let users generate or modify geometry through natural language
- Build AI tutoring, problem explanation, lesson authoring, and courseware editing workflows with geometry drawing
- Keep authentication, billing, logging, and risk controls within the host system boundary

## How to Start

1. Upgrade to `@dajiaoai/algeo-sdk@2.8.0` or later.
2. Create the embedded editor with `createEditor(...)` and provide a valid `auth.appId`.
3. Configure your application in the Open Platform console and prepare a server-side API token.
4. Enable or keep the default `ui.aiChatPanel` setting.
5. Listen for `aiRequest` and forward `payload` as-is to your host backend.
6. After user auth and quota checks, the host backend calls the Dino-GSP embedded-mode AI drawing API.
7. Consume the returned stream on the frontend with `editor.ai.consumeStream()`.
8. Review application usage and point consumption in the console after launch.

## Related Links

- [AI Chat in Editor](/en/sdk/2/ai-chat)
- [Editor Mode](/en/sdk/2/editor)
- [SDK Examples](https://dajiaoai.github.io/algeo-sdk/)
