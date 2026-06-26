# 编辑模式 (Editor Mode)

编辑模式为宿主应用提供了一个完整的几何创作环境，支持 UI 定制、画板管理、撤销/重做以及结构化导出。

## 场景特点

- **功能完备**：内置完整的动态几何引擎与工具栏。
- **UI 可定制**：可以隐藏特定面板以匹配您的应用布局。
- **严格鉴权**：必须提供有效的 `appId` 完成初始化。

## 实例创建

```typescript
import { createEditor, EmbeddedEditor } from '@dajiaoai/algeo-sdk';

const editor: EmbeddedEditor = await createEditor(container, {
  auth: { appId: 'YTVJDQZR' },
  ui: {
    navbar: false,
  },
});
```

`appId` 获取方式详见 [快速开始](./getting-started.html#_4-获取-appid)。

### UI 配置

编辑模式支持通过 `ui` 配置控制各个面板的显示/隐藏。

| 属性              | 类型      | 默认值 | 说明                                            |
| ----------------- | --------- | ------ | ----------------------------------------------- |
| `ui.navbar`       | `boolean` | `true` | 是否显示顶部导航栏（包含保存按钮、文件信息等）  |
| `ui.slidePanel`   | `boolean` | `true` | 是否显示画板缩略图面板                          |
| `ui.toolboxPanel` | `boolean` | `true` | 是否显示绘图工具栏                              |
| `ui.algebraPanel` | `boolean` | `true` | 是否显示代数面板                                |
| `ui.docPanel`     | `boolean` | `true` | 是否显示文档面板                                |
| `ui.helpEntry`    | `boolean` | `true` | 是否显示编辑模式的帮助入口。从 `2.7.0` 起支持。 |
| `ui.aiChatPanel`  | `boolean` | `true` | 是否显示 AI 对话面板。从 `2.8.0` 起支持。       |

## API 模块参考

SDK 将编辑器的 API 进行了模块化拆分：

### 创建参数 (`AlgeoEditorCreateOptions`)

```typescript
interface AlgeoEditorCreateOptions {
  auth?: {
    appId: string;
  };
  shareId?: string;
  initialContent?: FileContentLatest;
  ui?: AlgeoEditorUiConfig;
}
```

| 参数             | 类型                   | 必填 | 说明                                                   |
| ---------------- | ---------------------- | ---- | ------------------------------------------------------ |
| `auth.appId`     | `string`               | 是   | 开放平台应用 ID，用于编辑模式鉴权                      |
| `shareId`        | `string`               | 否   | 初始化时加载的分享文件 ID                              |
| `initialContent` | `FileContentLatest`    | 否   | 初始化后覆盖加载的文件内容，优先级高于空白编辑器状态   |
| `ui`             | `AlgeoEditorUiConfig`  | 否   | 编辑器 UI 显隐配置                                     |

### 1. 文档 API (`editor.document`)

处理内容的整体加载与获取。

- `loadContent(content: FileContentLatest): Promise<void>`: 覆盖加载当前内容。
- `getContent(): Promise<FileContentLatest>`: 获取当前编辑器中的完整 DSL 数据。

```typescript
await editor.document.loadContent(content);
const content = await editor.document.getContent();
```

调用 `loadContent` 会替换当前工程内容，并触发编辑器内部状态同步；调用 `getContent` 会从内嵌编辑器读取最新内容，适合保存前兜底确认。

### 2. 画板 API (`editor.slides`)

管理多页画板。

- `getCount(): number`: 获取总页数。
- `getCurrentIndex(): number`: 获取当前所在页码。
- `switchTo(index: number): Promise<void>`: 切换到指定页。
- `add(): Promise<SlideIndexResult>`: 在末尾添加新画板。
- `addAt(index: number): Promise<SlideIndexResult>`: 在指定位置插入新画板。
- `remove(index: number): Promise<void>`: 删除指定画板。
- `duplicate(index: number, targetIndex?: number): Promise<SlideIndexResult>`: 复制指定画板，可指定插入位置。
- `reorder(fromIndex: number, toIndex: number): Promise<void>`: 调整画板顺序。
- `exportImage(options?: ExportSlideImageOptions): Promise<ExportedSlideImage[]>`: 导出画板图片。

```typescript
const total = editor.slides.getCount();
const current = editor.slides.getCurrentIndex();

await editor.slides.switchTo(1);
const added = await editor.slides.add();
const inserted = await editor.slides.addAt(0);
const duplicated = await editor.slides.duplicate(current, current + 1);

await editor.slides.reorder(0, 2);
await editor.slides.remove(1);
```

```typescript
interface SlideIndexResult {
  index: number;
}
```

`switchTo`、`remove`、`duplicate`、`reorder` 中的索引均为 **0-based**。`exportImage` 的 `slideIndices` 为 **1-based**，用于贴近导出场景中的页码表达。

#### 2.1 `exportImage(options?)`

> 从 **2.6.0** 起支持

将指定画板（或全部画板）导出为图片，返回 `ExportedSlideImage[]` 数组。

```typescript
editor.slides.exportImage(options?: ExportSlideImageOptions): Promise<ExportedSlideImage[]>
```

**`ExportSlideImageOptions`（可选参数）：**

| 参数           | 类型             | 默认值  | 说明                                                |
| -------------- | ---------------- | ------- | --------------------------------------------------- |
| `slideIndices` | `number[]`       | -       | 要导出的画板索引数组（1-based）；不传则导出全部画板 |
| `format`       | `'png' \| 'jpg'` | `'png'` | 图片格式                                            |
| `width`        | `number`         | -       | 导出图片宽度（像素）                                |
| `height`       | `number`         | -       | 导出图片高度（像素）                                |
| `quality`      | `number`         | `0.92`  | 图片质量（0~1，仅 `jpg` 格式生效）                  |
| `autoFit`      | `boolean`        | -       | 是否自动适应画板内容缩放                            |
| `padding`      | `number`         | -       | 自动适应时的内边距（像素）                          |

**`ExportedSlideImage`（返回数组元素）：**

| 属性     | 类型             | 说明                 |
| -------- | ---------------- | -------------------- |
| `index`  | `number`         | 画板索引（1-based）  |
| `blob`   | `Blob`           | 图片二进制数据       |
| `format` | `'png' \| 'jpg'` | 实际导出格式         |
| `width`  | `number`         | 实际导出宽度（像素） |
| `height` | `number`         | 实际导出高度（像素） |

### 3. 历史 API (`editor.history`)

控制撤销与重做。

- `getCount(): number`: 获取当前历史记录数量。
- `getCurrentIndex(): number`: 获取当前历史游标位置。
- `undo(): Promise<void>`: 撤销。
- `redo(): Promise<void>`: 重做。
- `jumpTo(index: number): Promise<void>`: 跳转到指定历史记录。
- `canUndo() / canRedo(): boolean`: 判断当前是否可进行相应操作。
- `clear(): Promise<void>`: 清空历史记录。

```typescript
if (editor.history.canUndo()) {
  await editor.history.undo();
}

if (editor.history.canRedo()) {
  await editor.history.redo();
}

await editor.history.jumpTo(0);
await editor.history.clear();
```

### 4. 模式 API (`editor.mode`)

动态调整 UI。

- `getUiConfig(): AlgeoEditorUiConfig`: 获取 SDK 当前缓存的 UI 配置。
- `setUiConfig(config: Partial<AlgeoEditorUiConfig>): Promise<void>`: 运行时动态切换 UI 元件的显隐。

```typescript
const ui = editor.mode.getUiConfig();

await editor.mode.setUiConfig({
  slidePanel: false,
  aiChatPanel: true,
});
```

### 5. AI API (`editor.ai`)

> 从 **2.8.0** 起支持。完整接入流程见 [编辑器 AI 对话](./ai-chat)。

AI API 用于宿主页面把自己的 AI 服务结果回传给内嵌编辑器。它通常配合 `aiRequest` 事件使用。

- `consumeStream(input: { stream: ReadableStream<Uint8Array>; signal?: AbortSignal }): Promise<void>`: 消费 SSE 格式的流式响应，并自动解析为 AI stream 事件。
- `pushStreamEvent(event: AiStreamEventV1): void`: 直接推送已经解析好的 AI stream 事件。

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

```typescript
editor.ai.pushStreamEvent({
  type: 'raw',
  runId: 'run_123',
  event: 'response.output_text.delta',
  data: {
    type: 'response.output_text.delta',
    delta: '画一个三角形',
  },
});
```

### 6. 生命周期 API

- `destroy(): Promise<void>`: 销毁 SDK 实例，移除 iframe、清理消息监听器，并取消未完成请求。

```typescript
await editor.destroy();
```

## 事件监听

使用 `editor.on(event, listener)` 订阅事件，返回值为取消订阅函数；也可以使用 `editor.off(event, listener)` 手动取消。

**支持的事件一览：**

| 事件名          | 事件数据                                                   | 说明                                                                             |
| --------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `ready`         | `{ type: 'ready', mode, version }`                         | iframe 初始化完成                                                                |
| `contentChange` | `{ type: 'contentChange', source: 'user', content }`       | 用户在 iframe 内编辑后回传完整 `FileContentLatest`                                  |
| `slideChange`   | `{ type: 'slideChange', index }`                           | 用户在 iframe 内切换画板后回传当前索引                                           |
| `save`          | `{ type: 'save', stage: 'request' \| 'success', content }` | `stage: 'request'` 时由宿主处理保存逻辑；`stage: 'success'` 时表示保存流程已完成 |
| `aiRequest`     | `{ type: 'aiRequest', payload, signal }`                   | 内嵌编辑器请求宿主执行一次 AI 对话。从 `2.8.0` 起支持。                         |
| `aiCancel`      | `{ type: 'aiCancel', runId, reason }`                      | 当前 AI 请求被取消。从 `2.8.0` 起支持。                                         |

---

### `ready` 事件

iframe 完成初始化后触发，可在此时读取内嵌页协议版本。

```typescript
editor.on('ready', (event) => {
  console.log('编辑器已就绪，协议版本：', event.version);
});
```

---

### `contentChange` 事件

用户在 iframe 内对几何图形或画板结构做出任何修改后触发，回传完整的 `FileContentLatest`。

```typescript
editor.on('contentChange', (event) => {
  // event.source 固定为 'user'
  console.log('内容已更新', event.content);
});
```

---

### `slideChange` 事件

用户在 iframe 内切换画板后触发，回传当前画板索引（从 0 开始）。

```typescript
editor.on('slideChange', (event) => {
  console.log('当前画板索引：', event.index);
});
```

---

### `save` 事件

`save` 事件分为两个阶段：

1. **`request` 阶段**：用户点击保存按钮时触发。宿主需要在回调中完成持久化，并返回结果对象。只有宿主返回 `{ status: 'success' }` 后，iframe 才会展示成功态并继续触发 `success` 阶段。
2. **`success` 阶段**：宿主确认保存成功后触发，此时 `event.content` 为最终保存的完整内容。

```typescript
editor.on('save', async (event) => {
  if (event.stage === 'request') {
    const response = await fetch('/api/geometry-doc/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: event.content }),
    });

    if (!response.ok) {
      return { status: 'error', message: '保存失败' };
    }

    return { status: 'success' };
  }

  // stage === 'success'：iframe 已展示成功态
  console.log('保存成功，最终内容：', event.content);
});
```

> **注意**：`request` 阶段的监听器必须返回一个 Promise（或使用 async 函数），否则 iframe 将无法收到宿主的处理结果。

---

### `aiRequest` 事件

当用户在内嵌编辑器中发起 AI 对话时触发。宿主需要在回调中调用自己的 AI 服务，并通过 `editor.ai` 把结果回传给编辑器。

```typescript
editor.on('aiRequest', async ({ payload, signal }) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

`payload` 的结构见 [数据协议 - AI Chat 协议](./protocol#ai-chat-协议-sdk-280)。

---

### `aiCancel` 事件

当用户取消、后续请求覆盖当前请求，或 SDK 实例销毁时触发。

```typescript
editor.on('aiCancel', (event) => {
  console.log('AI 请求已取消：', event.runId, event.reason);
});
```

`reason` 取值：

| 值           | 说明                         |
| ------------ | ---------------------------- |
| `user`       | 用户主动取消                 |
| `superseded` | 新请求覆盖了当前请求         |
| `destroyed`  | SDK 实例销毁导致请求被取消   |

