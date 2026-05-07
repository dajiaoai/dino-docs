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
  auth: { appId: 'YOUR_APP_ID' },
  ui: {
    navbar: true, // 顶部导航（包含保存按钮、文件信息等）
    slidePanel: true, // 侧边画板缩略图预览
    toolboxPanel: true, // 绘图工具栏
  },
});
```

## API 模块参考

SDK 将编辑器的 API 进行了模块化拆分：

### 1. 文档 API (`editor.document`)

处理内容的整体加载与获取。

- `loadContent(content: FileContentV10): Promise<void>`: 覆盖加载当前内容。
- `getContent(): Promise<FileContentV10>`: 获取当前编辑器中的完整 DSL 数据。

### 2. 画板 API (`editor.slides`)

管理多页画板。

- `getCount(): number`: 获取总页数。
- `getCurrentIndex(): number`: 获取当前所在页码。
- `switchTo(index: number): Promise<void>`: 切换到指定页。
- `add(): Promise<void>`: 在末尾添加新画板。
- `remove(index: number): Promise<void>`: 删除指定画板。
- `duplicate(index: number): Promise<void>`: 复制指定画板。
- `reorder(from: number, to: number): Promise<void>`: 调整画板顺序。

### 3. 历史 API (`editor.history`)

控制撤销与重做。

- `undo() / redo()`: 撤销或重做。
- `canUndo() / canRedo(): boolean`: 判断当前是否可进行相应操作。
- `clear()`: 清空历史记录。

### 4. 模式 API (`editor.mode`)

动态调整 UI。

- `setUiConfig(config: Partial<AlgeoEditorUiConfig>): Promise<void>`: 运行时动态切换 UI 元件的显隐。

## 事件监听

使用 `editor.on(event, listener)` 订阅事件，返回值为取消订阅函数；也可以使用 `editor.off(event, listener)` 手动取消。

**支持的事件一览：**

| 事件名          | 事件数据                                                    | 说明                                                                               |
| --------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ready`         | `{ type: 'ready', mode, version }`                          | iframe 初始化完成                                                                  |
| `contentChange` | `{ type: 'contentChange', source: 'user', content }`        | 用户在 iframe 内编辑后回传完整 `FileContentV10`                                    |
| `slideChange`   | `{ type: 'slideChange', index }`                            | 用户在 iframe 内切换画板后回传当前索引                                             |
| `save`          | `{ type: 'save', stage: 'request' \| 'success', content }` | `stage: 'request'` 时由宿主处理保存逻辑；`stage: 'success'` 时表示保存流程已完成  |

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

用户在 iframe 内对几何图形或画板结构做出任何修改后触发，回传完整的 `FileContentV10`。

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
