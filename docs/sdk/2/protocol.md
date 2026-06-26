# 数据协议

大角几何 SDK 2.x 包含两层协议：

- **文件数据协议**：基于 JSON 的领域专用语言（DSL），描述文档元数据、多页画板结构、AI 对话历史以及底层几何实体。
- **嵌入通信协议**：SDK 与内嵌编辑器/演示页之间通过 `postMessage` 交换请求、响应和事件。SDK 2.8.0 起，编辑器模式新增 AI Chat 请求与流式响应协议。

当前 SDK 版本：`@dajiaoai/algeo-sdk@2.8.0`<br>
当前协议包版本：`@dajiaoai/algeo-protocol@1.5.0`

## 文件数据结构

一个标准的文档 JSON 对象（`FileContentLatest`）包含以下核心字段：

```typescript
interface FileContentLatest {
  slides: SlideV2[];
  messages: SeedChatMessage[];
  metadata: {
    version: '11';
  };
}
```

其中每个 `SlideV2` 画板对象的结构为：

```typescript
interface SlideV2 {
  definitions: DefinitionV2[]; // 几何对象定义列表
  uvarMap: [string, number][]; // 用户变量（滑块等）的当前值映射
  styleSheet: SlideStyleSheetV2; // 画板样式表（背景色、坐标轴、网格、各对象样式等）
  doc: DocOp[]; // 画板富文本文档内容（Quill Delta 格式）
}
```

## 核心字段说明

| 字段                   | 类型                 | 说明                                                     |
| :--------------------- | :------------------- | :------------------------------------------------------- |
| `metadata.version`     | `'11'`               | 协议版本号，固定为字符串 `"11"`                          |
| `slides`               | `SlideV2[]`          | 画板数组，每个画板代表一个独立的几何画布                 |
| `slides[].definitions` | `DefinitionV2[]`     | 几何对象定义列表，描述点、线、圆、函数、滑块等对象       |
| `slides[].uvarMap`     | `[string, number][]` | 用户变量（滑块等）的当前值映射，格式为 `[变量名, 值]` 对 |
| `slides[].styleSheet`  | `SlideStyleSheetV2`  | 画板样式表，包含背景、坐标轴、网格及各对象的样式配置     |
| `slides[].doc`         | `DocOp[]`            | 画板富文本内容（Quill Delta Op 格式）                    |
| `messages`             | `SeedChatMessage[]`  | AI 对话历史记录，包含用户与助手的消息列表                |

## 进阶集成建议

1. **直接保存**：在编辑模式下，您可以直接将获取到的 JSON 全量存储到您的数据库。
2. **动态生成**：如果您需要在服务端或 AI 侧生成图形，建议通过 `REPL` 给画板发送绘图序列，而不是手动拼接 `definitions` 数组，因为底层图形定义语法（Style v2）较为复杂，手动拼接容易出错。

## 嵌入通信协议

SDK 与内嵌页面使用 `postMessage` 通信。绝大多数调用由 SDK 封装，业务侧通常不需要直接拼接消息；如果需要排查链路或自行实现宿主桥接，可参考以下结构。

### 通用响应

所有带 `requestId` 的请求都会收到统一响应：

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

内嵌页面加载完成后会发送：

```typescript
interface EmbedReadyMessage {
  type: 'ready';
  version: string;
}
```

### 常用请求

| 消息类型          | 方向             | 说明                         |
| :---------------- | :--------------- | :--------------------------- |
| `loadShareById`   | SDK -> 内嵌页面  | 按分享 ID 加载文件           |
| `loadFile`        | SDK -> 内嵌页面  | 加载完整 `FileContentLatest` |
| `switchSlide`     | SDK -> 内嵌页面  | 切换当前画板页               |
| `getSlideCount`   | SDK -> 内嵌页面  | 获取画板页数量               |
| `repl`            | SDK -> 内嵌页面  | 执行一条 REPL 指令           |
| `save`            | 内嵌页面 -> SDK  | 请求宿主保存当前文件         |
| `aiRequest`       | 内嵌页面 -> SDK  | 请求宿主执行一次 AI Chat     |
| `aiStreamEvent`   | SDK -> 内嵌页面  | 向内嵌页面推送 AI 流式事件   |
| `aiCancel`        | 双向事件         | 通知 AI 请求被取消           |

## AI Chat 协议（SDK 2.8.0+）

编辑器模式下，内嵌页面会通过 `aiRequest` 事件把 AI 请求交给宿主页面。宿主页面负责调用自己的 AI 服务，并通过 SDK 将流式结果回推给内嵌编辑器。

### AI 请求负载

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

宿主侧监听方式：

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

### AI 流式事件

SDK 支持两种方式把 AI 结果推回编辑器：

1. `editor.ai.consumeStream(...)`：消费符合 SSE 格式的 `ReadableStream<Uint8Array>`。
2. `editor.ai.pushStreamEvent(...)`：直接推送已经解析好的事件对象。

当前 `AiStreamEventV1` 为 raw SSE 事件：

```typescript
interface AiRawSseEventV1 {
  type: 'raw';
  runId: string;
  event: string;
  data: Record<string, unknown>;
}

type AiStreamEventV1 = AiRawSseEventV1;
```

SSE frame 示例：

```text
event: response.output_text.delta
data: {"type":"response.output_text.delta","delta":"画一个三角形","response":{"id":"run_123","model":"gpt-4.1"}}
```

终止事件会让 SDK 结束当前 AI run。当前识别的终止类型包括：

| 终止类型              | 说明         |
| :-------------------- | :----------- |
| `response.completed`  | 正常完成     |
| `response.failed`     | 执行失败     |
| `response.incomplete` | 响应不完整   |
| `error`               | 出现错误     |
| `run.cancelled`       | 请求被取消   |

### 取消语义

宿主侧 `aiRequest` 事件中会收到 `AbortSignal`：

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  signal.addEventListener('abort', () => {
    // 取消宿主侧正在进行的 AI 请求
  });
});
```

当用户取消、后续请求覆盖当前请求，或 SDK 实例销毁时，SDK 会触发 `aiCancel`：

```typescript
interface AiCancelEvent {
  type: 'aiCancel';
  runId: string | null;
  reason: 'user' | 'superseded' | 'destroyed';
}
```

## 相关错误码

| 错误码                      | 说明                         |
| :-------------------------- | :--------------------------- |
| `EMBED_LOAD_SHARE_FAILED`   | 加载分享文件失败             |
| `EMBED_LOAD_FILE_FAILED`    | 加载文件失败                 |
| `EMBED_APPLY_CONTENT_FAILED` | 应用文件内容失败             |
| `EMBED_SWITCH_SLIDE_FAILED` | 切换画板页失败               |
| `EMBED_INVALID_SLIDE_INDEX` | 画板页索引无效               |
| `EMBED_GET_SLIDE_COUNT_FAILED` | 获取画板页数量失败        |
| `EMBED_INVALID_REPL_COMMAND` | REPL 指令无效                |
| `EMBED_REPL_EXECUTE_FAILED` | REPL 执行失败                |
| `EMBED_UNKNOWN_METHOD`      | 未知方法                     |
| `EMBED_UNKNOWN_ERROR`       | 未知错误                     |
| `EMBED_MISSING_APP_ID`      | 缺少编辑器模式必需的 appId   |
| `EMBED_BAD_REQUEST`         | 请求格式错误或宿主未配置处理器 |
| `EMBED_IFRAME_NOT_READY`    | iframe 尚未加载完成          |
| `EMBED_TIMEOUT`             | 请求超时                     |
| `EMBED_DESTROYED`           | SDK 实例已销毁               |
