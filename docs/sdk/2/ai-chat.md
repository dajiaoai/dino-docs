---
title: SDK 2.x 编辑器 AI 对话
description: 在 SDK 编辑模式下开启 AI 对话功能，了解接入流程、鉴权边界和计费模式
---

# 编辑器 AI 对话

SDK `2.8.0` 起，编辑模式支持开启 AI 对话面板。用户可以在内嵌编辑器中发起 AI 请求，宿主页面监听请求、调用自己的 AI 服务，再把流式结果回传给编辑器。

这个能力适合以下场景：

- 在题库、教案、课件系统中，让用户用自然语言生成或修改几何图形。
- 在自有 AI 助教中复用大角几何编辑器，把模型输出转成可交互几何内容。
- 在内容生产后台中，把 AI 生成和人工编辑放在同一个工作流里。

## 工作方式

AI 对话是一个宿主托管的桥接流程：

1. 用户在内嵌编辑器的 AI 对话面板中输入请求。
2. 内嵌编辑器向 SDK 发送 `aiRequest`。
3. 宿主页面监听 `editor.on('aiRequest', ...)`，调用自己的后端 AI 服务。
4. 宿主通过 `editor.ai.consumeStream()` 或 `editor.ai.pushStreamEvent()` 把流式结果回传给编辑器。
5. 编辑器展示 AI 回复，并根据返回内容更新对话状态和几何内容。

## 前置条件

1. 使用 `@dajiaoai/algeo-sdk@2.8.0` 或更高版本。
2. 使用编辑模式 `createEditor(...)`，并传入有效 `auth.appId`。
3. 在开放平台控制台中完成应用配置，并确保应用域名、白名单等配置符合当前环境。
4. 准备一个宿主后端接口，用于安全地调用 AI 模型或大角几何开放平台 AI/API 服务。

> 不建议在浏览器前端直接放置模型密钥或服务端 API token。`appId` 可以出现在前端，服务端密钥应只保存在宿主后端。

## 1. 创建编辑器并显示 AI 面板

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

如果您想先隐藏 AI 面板，之后再开启：

```typescript
await editor.mode.setUiConfig({
  aiChatPanel: true,
});
```

## 2. 监听 AI 请求

当用户在编辑器里发起 AI 对话时，SDK 会触发 `aiRequest`：

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
    throw new Error('AI 服务调用失败');
  }

  await editor.ai.consumeStream({
    stream: response.body,
    signal,
  });
});
```

`payload` 是 `AiRunPayloadV1`：

```typescript
interface AiRunPayloadV1 {
  model_id: string;
  messages: OpenAiChatMessageV1[];
  extra_openai_params?: Record<string, unknown>;
}
```

完整协议见 [数据协议 - AI Chat 协议](./protocol#ai-chat-协议-sdk-280)。

## 3. 后端接口建议

宿主后端通常负责三件事：

1. 校验当前用户是否有权限使用该应用的 AI 能力。
2. 选择实际模型或服务，例如自有模型服务、大角几何 API、OpenAI-compatible 服务等。
3. 把模型响应转成 SDK 支持的 SSE 流式事件。

一个推荐的后端响应形态是 SSE：

```text
event: response.output_text.delta
data: {"type":"response.output_text.delta","delta":"画一个三角形","response":{"id":"run_123","model":"gpt-4.1"}}

event: response.completed
data: {"type":"response.completed","response":{"id":"run_123","model":"gpt-4.1"}}
```

SDK 会把每个 SSE frame 转成 `AiStreamEventV1` 并发送给内嵌编辑器。

## 4. 直接推送已解析事件

如果您的后端不是 SSE，也可以在前端拿到数据后自行转换，再调用 `pushStreamEvent`：

```typescript
editor.ai.pushStreamEvent({
  type: 'raw',
  runId: 'run_123',
  event: 'response.output_text.delta',
  data: {
    type: 'response.output_text.delta',
    delta: '画一个三角形',
    response: {
      id: 'run_123',
      model: 'gpt-4.1',
    },
  },
});
```

终止时需要推送终止事件，例如：

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

## 5. 取消与错误处理

`aiRequest` 会带上 `AbortSignal`。当用户取消请求、新请求覆盖旧请求，或 SDK 实例销毁时，`signal` 会被触发：

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  signal.addEventListener('abort', () => {
    // 取消宿主侧正在进行的 AI 请求
  });
});
```

也可以监听 `aiCancel`：

```typescript
editor.on('aiCancel', ({ runId, reason }) => {
  console.log('AI 请求已取消', runId, reason);
});
```

`reason` 取值：

| 值           | 说明                       |
| ------------ | -------------------------- |
| `user`       | 用户主动取消               |
| `superseded` | 新请求覆盖当前请求         |
| `destroyed`  | SDK 实例销毁导致请求取消   |

如果宿主没有注册 `aiRequest` 监听器，编辑器会收到错误响应，提示宿主未配置处理器。

## 鉴权模式

### SDK 鉴权

编辑模式必须传入 `auth.appId`。`appId` 用于识别开放平台应用、校验接入来源和应用配置。

```typescript
const editor = await createEditor(container, {
  auth: {
    appId: 'YOUR_APP_ID',
  },
});
```

`appId` 不是服务端密钥，可以放在前端代码里。请勿把服务端 API token、模型密钥或计费凭证暴露到浏览器。

### AI 服务鉴权

AI 对话的实际模型调用由宿主后端完成。建议宿主后端自行完成：

- 用户登录态校验。
- 应用权限校验。
- 调用额度或套餐校验。
- 服务端 API token 管理。
- 风控、审计与日志记录。

浏览器端只把 `AiRunPayloadV1` 发给宿主后端，不直接访问模型供应商密钥。

## 计费模式

SDK AI 对话本身是桥接能力：SDK 负责把编辑器中的 AI 请求交给宿主，并把宿主返回的流式结果交回编辑器。

实际费用取决于宿主选择的 AI 服务：

| 接入方式                       | 费用承担方                         | 说明                                   |
| ------------------------------ | ---------------------------------- | -------------------------------------- |
| 宿主自有 AI 服务               | 宿主自行承担                       | 由宿主的模型供应商、算力或内部系统计费 |
| 大角几何开放平台 AI/API 服务   | 按开放平台相关 API/模型规则计费    | 需在宿主后端调用对应服务并管理凭证     |
| 第三方 OpenAI-compatible 服务  | 按第三方服务商规则计费             | SDK 不直接持有第三方服务密钥           |

建议在宿主后端记录每次 AI 请求的用户、应用、模型、token/用量、耗时、成功失败状态，便于做额度控制、账单核对和问题排查。

## 最小接入清单

- [ ] 升级到 `@dajiaoai/algeo-sdk@2.8.0` 或更高版本。
- [ ] 使用 `createEditor` 并传入 `auth.appId`。
- [ ] 在 `ui` 中开启 `aiChatPanel`。
- [ ] 监听 `aiRequest`。
- [ ] 在宿主后端完成用户鉴权、额度校验和 AI 服务调用。
- [ ] 使用 `consumeStream` 或 `pushStreamEvent` 回传结果。
- [ ] 处理取消、超时和错误状态。

