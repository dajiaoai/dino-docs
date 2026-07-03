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
4. 宿主后端完成业务鉴权、额度校验后，调用大角几何内嵌模式 AI 生图 API。
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

`payload` 是编辑器生成的 AI 请求上下文，接入方通常不需要理解或手动拼接其中的全部字段。推荐做法是：在 `aiRequest` 回调中把 `payload` 发给您的宿主后端，宿主后端再原样转发给大角几何后端。模型选择、上下文解析和几何指令处理都由大角几何后端完成。

只有在排查问题、记录审计日志或与大角几何后端联调时，才需要关注它的具体字段；普通接入场景请按原样转发。

## 3. 设置或清空 AI 草稿

SDK `2.9.0` 起，宿主页面可以主动向 AI 对话框写入草稿内容。典型场景是：宿主解析到当前点位或图形后，自动把提示词和相关图片放入 AI 面板，用户可以继续编辑文本、增删图片，再手动发起 AI 对话。

```typescript
await editor.ai.setDraft({
  text: '请根据这张图生成一道几何题',
  images: ['https://example.com/figure.png'],
  openPanel: true,
  focus: true,
});
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | AI 对话框中的草稿文本 |
| `images` | `string[]` | 附加到 AI 对话框的图片 URL 列表 |
| `openPanel` | `boolean` | 是否自动打开 AI 对话面板 |
| `focus` | `boolean` | 是否在设置草稿后聚焦到 AI 输入框 |

清空草稿：

```typescript
await editor.ai.clearDraft();
```

## 4. 宿主后端转发

宿主后端不需要自行实现 AI 模型调用或流式协议，通常只负责三件事：

1. 校验当前用户是否有权限使用该应用的 AI 能力。
2. 校验当前应用的额度、套餐或业务侧使用规则。
3. 调用大角几何内嵌模式 AI 生图 API，并把大角几何后端返回的 SSE 响应透传给前端。

前端示例中的 `/api/algeo-ai/chat` 是宿主自己的后端接口示例，不是浏览器直接请求大角几何后端：

```typescript
const DAJIAOAI_AI_RUN_ENDPOINT =
  'https://api.dajiaoai.com/api/v1/embedded/ai/run';

app.post('/api/algeo-ai/chat', async (req, res) => {
  await assertUserCanUseAi(req.user);

  const upstream = await fetch(DAJIAOAI_AI_RUN_ENDPOINT, {
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

## 5. 大角几何生图 API

宿主后端实际调用的是大角几何开放平台的内嵌模式 AI 生图接口。这个接口返回标准 SSE 流，可以直接透传给前端，再交给 `editor.ai.consumeStream()`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/v1/embedded/ai/run` | 创建一次 AI 绘图请求，并以 SSE 流式返回结果 |
| `POST` | `/api/v1/embedded/ai/cancel` | 取消指定 run 的前端流式投递 |

### 创建 run

- Base URL：`https://api.dajiaoai.com`
- 鉴权：`Authorization: Bearer <API_KEY>`
- Content-Type：`application/json`
- 请求体：直接使用 SDK `aiRequest` 事件中的 `payload`
- 响应：`text/event-stream`

宿主后端无需手动组装模型参数或消息结构，直接把前端传来的 `payload` 作为请求体转发即可：

```typescript
const upstream = await fetch('https://api.dajiaoai.com/api/v1/embedded/ai/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.DAJIAOAI_API_TOKEN}`,
  },
  body: JSON.stringify(payload),
});
```

接口会先返回一个 `run.created` 事件，让客户端知道本次请求的 `run_id`：

```text
event: run.created
data: {"run_id":"run_xxx"}
```

之后会持续返回 `response.*` 事件。接入方不需要自己解析这些事件来更新画板，只要把整个 `response.body` 交给 SDK：

```typescript
await editor.ai.consumeStream({
  stream: response.body,
  signal,
});
```

### 取消 run

当用户取消生成时，可以调用取消接口：

```http
POST https://api.dajiaoai.com/api/v1/embedded/ai/cancel
Authorization: Bearer djo_xxx
Content-Type: application/json
```

```json
{
  "run_id": "run_xxx",
  "reason": "user_cancel"
}
```

取消接口用于停止当前 SSE 投递。已经提交到大角几何后端的 AI 请求可能仍会继续产生 token 用量并结算，因此宿主侧不应展示“取消即不计费”，应以控制台或后端返回的最终用量为准。

## 6. 取消与错误处理

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

浏览器端只负责把 `payload` 发给宿主后端，不直接访问大角几何服务端 API token。宿主后端应将该 `payload` 继续转发给大角几何后端。

## 计费模式

SDK AI 对话本身是桥接能力：SDK 负责把编辑器中的 AI 请求交给宿主，并把大角几何后端经由宿主返回的流式结果交回编辑器。

实际费用按照大角几何开放平台 AI 能力的计费规则计算。宿主后端可以根据自身业务再做用户额度、套餐或二次计费展示。

| 计费环节                 | 说明                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| 大角几何画板内 AI 能力    | 按照实际 token `usage × 模型价格` 扣费，可在控制台应用详情内查看每次调用消耗的点数 |
| 宿主业务额度              | 宿主可在自己的后端做用户额度、套餐、次数或风控限制，也可通过 SSE 返回的 `usage` + `model` 自行计算 |
| 浏览器前端                | 不持有服务端计费凭证，也不直接访问大角几何后端                       |

扣费按大角几何后端产生的实际 AI token 用量结算。`/api/v1/embedded/ai/run` 与其他开放平台 API 共用同一积分账户，不需要为内嵌模式单独充值。客户端主动取消或断开 SSE 连接，只表示停止当前流式投递，不一定会中断后端已经开始执行的 AI 请求；只要产生了 token 用量，就会按实际消耗扣费。

建议在宿主后端记录每次 AI 请求的用户、应用、耗时、成功失败状态和大角几何后端返回的用量信息，便于做额度控制、账单核对和问题排查。

## 最小接入清单

- 升级到 `@dajiaoai/algeo-sdk@2.8.0` 或更高版本。
- 使用 `createEditor` 并传入 `auth.appId`。
- 在 `ui` 中开启 `aiChatPanel`。
- 监听 `aiRequest`。
- 在宿主后端完成用户鉴权和额度校验。
- 宿主后端调用 `/api/v1/embedded/ai/run`，并把 SSE 响应透传给前端。
- 前端使用 `consumeStream` 处理大角几何后端经由宿主返回的流式结果。
- 处理取消、超时和错误状态。
