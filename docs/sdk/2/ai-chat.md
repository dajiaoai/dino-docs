---
title: SDK 2.x 编辑器 AI 对话
description: 在 SDK 编辑模式下开启 AI 对话功能，了解接入流程、鉴权边界和计费模式
---

# 编辑器 AI 对话

SDK `2.8.0` 起，编辑模式支持开启 AI 对话面板。用户可以在内嵌编辑器中发起 AI 请求，宿主页面监听请求，将请求转发到大角几何后端，再把大角几何后端返回的流式结果交给 SDK 处理。

您可以先打开 [13-ai-chat.html 示例](https://dajiaoai.github.io/algeo-sdk/examples/13-ai-chat.html) 体验完整接入效果。

这个能力适合以下场景：

- 在题库、教案、课件系统中，让用户用自然语言生成或修改几何图形。
- 在 AI 助教中复用大角几何编辑器，把大角几何后端生成的结果转成可交互几何内容。
- 在内容生产后台中，把 AI 生成和人工编辑放在同一个工作流里。

## 工作方式

AI 对话是一个宿主托管的桥接流程：

1. 用户在内嵌编辑器的 AI 对话面板中输入请求。
2. 内嵌编辑器向 SDK 发送 `aiRequest`。
3. 宿主页面监听 `editor.on('aiRequest', ...)`，把请求发给自己的后端。
4. 宿主后端完成业务鉴权、额度校验后，将请求转发给大角几何后端。
5. 宿主页面通过 `editor.ai.consumeStream()` 把大角几何后端返回的流式结果交给编辑器。
6. 编辑器展示 AI 回复，并根据返回内容更新对话状态和几何内容。

## 前置条件

1. 使用 `@dajiaoai/algeo-sdk@2.8.0` 或更高版本。
2. 使用编辑模式 `createEditor(...)`，并传入有效 `auth.appId`。
3. 在开放平台控制台中完成应用配置，并确保应用域名、白名单等配置符合当前环境。
4. 准备一个宿主后端接口，用于安全地转发请求到大角几何后端。

> 不建议在浏览器前端直接放置服务端 API token 或计费凭证。`appId` 可以出现在前端，服务端密钥应只保存在宿主后端。

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

`payload` 是编辑器生成的 AI 请求上下文，接入方通常不需要理解或手动拼接其中的全部字段。推荐做法是：在 `aiRequest` 回调中把 `payload` 原样转发给您的宿主后端，宿主后端再原样转发给大角几何后端。模型选择、上下文解析和几何指令处理都由大角几何后端完成。

只有在排查问题、记录审计日志或与大角几何后端联调时，才需要关注它的具体字段；普通接入场景请按原样转发。

## 3. 宿主后端转发

宿主后端不需要自行实现 AI 模型调用或流式协议，通常只负责三件事：

1. 校验当前用户是否有权限使用该应用的 AI 能力。
2. 校验当前应用的额度、套餐或业务侧使用规则。
3. 将 `payload` 原样转发给大角几何后端，并把大角几何后端返回的响应透传给前端。

前端示例中的 `/api/algeo-ai/chat` 是宿主自己的后端接口示例，不是浏览器直接请求大角几何后端：

```typescript
// 宿主后端伪代码：实际地址、鉴权头和参数以大角几何开放平台提供的信息为准。
app.post('/api/algeo-ai/chat', async (req, res) => {
  await assertUserCanUseAi(req.user);

  const upstream = await fetch(process.env.DAJIAOAI_AI_CHAT_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAJIAOAI_API_TOKEN}`,
    },
    body: JSON.stringify(req.body),
    signal: req.signal,
  });

  res.status(upstream.status);
  upstream.body?.pipeTo(Writable.toWeb(res));
});
```

## 4. 取消与错误处理

当用户取消请求、新请求覆盖旧请求，或 SDK 实例销毁时，推荐通过 `aiCancel` 事件感知取消状态：

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

AI 对话的实际模型调用由大角几何后端完成。建议宿主后端完成：

- 用户登录态校验。
- 应用权限校验。
- 调用额度或套餐校验。
- 大角几何服务端 API token 管理。
- 风控、审计与日志记录。

浏览器端只负责把 `payload` 发给宿主后端，不直接访问大角几何服务端 API token。宿主后端应把该 `payload` 作为请求主体继续转发给大角几何后端，无需在前端拆解协议字段。

## 计费模式

SDK AI 对话本身是桥接能力：SDK 负责把编辑器中的 AI 请求交给宿主，并把大角几何后端经由宿主返回的流式结果交回编辑器。

实际费用按照大角几何开放平台 AI 能力的计费规则计算。宿主后端可以根据自身业务再做用户额度、套餐或二次计费展示。

| 计费环节                 | 说明                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| 大角几何画板内 AI 能力    | 按照实际 `usage × 模型价格` 扣费，可在控制台应用详情内查看每次调用消耗的点数 |
| 宿主业务额度              | 宿主可在自己的后端做用户额度、套餐、次数或风控限制，也可通过 SSE 返回的 `usage` + `model` 自行计算 |
| 浏览器前端                | 不持有服务端计费凭证，也不直接访问大角几何后端                       |

建议在宿主后端记录每次 AI 请求的用户、应用、耗时、成功失败状态和大角几何后端返回的用量信息，便于做额度控制、账单核对和问题排查。

## 最小接入清单

- 升级到 `@dajiaoai/algeo-sdk@2.8.0` 或更高版本。
- 使用 `createEditor` 并传入 `auth.appId`。
- 在 `ui` 中开启 `aiChatPanel`。
- 监听 `aiRequest`。
- 在宿主后端完成用户鉴权和额度校验。
- 宿主后端将请求转发到大角几何后端。
- 前端使用 `consumeStream` 处理大角几何后端经由宿主返回的流式结果。
- 处理取消、超时和错误状态。
