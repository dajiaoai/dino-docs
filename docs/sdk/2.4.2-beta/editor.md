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

### `save` 事件

当用户点击编辑器内置导航栏的“保存”按钮时触发。

```typescript
editor.on('save', (event) => {
  const content = event.content;
  // 将 content 保存到您的服务器
  console.log('保存成功');
});
```

### `contentChange` 事件

当编辑器内的几何图形、画板结构发生任何变化时触发。

```typescript
editor.on('contentChange', (event) => {
  console.log('内容已更新');
});
```
