# 范例中心 (SDK Examples)

我们在 `algeo-sdk` 仓库的 `examples/` 目录下提供了 11 个标准示例，涵盖了从基础嵌入到高级 API 服务的所有核心场景。

## 基础集成

### [01-basic-iframe.html](./examples#basic)

展示如何使用原生 `<iframe>` 结合 `postMessage` 进行最底层的通信。这是 SDK 依赖的底层机制。

### [02-sdk-usage.html](./examples#sdk-init)

**推荐入门方案**。展示如何通过 SDK 提供的 `createPresentation` 方法快速初始化并渲染画板。

## 演示与交互

### [03-switch-slide.html](./examples#switch)

演示如何在外部页面通过按钮调用 `switchSlide` API 切换多页课件。

### [04-load-file.html](./examples#load)

展示从本地加载结构化 JSON 内容（DSL）并推送到画板中渲染的流程。

### [05-repl.html](./examples#repl)

**自动化核心**。展示如何通过 `repl()` 方法向画板发送几何绘图指令（如画圆、过点求垂线等）。

## 编辑器进阶

### [06-editor-mode.html](./examples#editor)

编辑器集成标准范本。包含 UI 面板开关配置与基本的历史记录管理。

### [07-document-api.html](./examples#doc-api)

展示如何调用 `editor.document.getContent()` 获取当前编辑的 DSL 数据。

### [08-slides-api.html](./examples#slides-api)

完整的画板增删改查交互范例，包含重排顺序与复制页面。

### [09-history-api.html](./examples#history)

演示如何自定义“撤销/重做”按钮并同步编辑器的历史状态（CanUndo / CanRedo）。

## 事件与工程化

### [10-editor-events.html](./examples#events)

监听编辑器的 `save` 与 `contentChange` 事件，并将变更实时在外部控制台打印。

### [11-editor-share-id.html](./examples#share)

展示如何在编辑器模式下，通过分享 ID 加载已有内容进行二次编辑。

---

> **运行提示**：您可以克隆仓库并运行 `npm run dev`（在大角几何主项目根目录），然后在浏览器访问 `http://localhost:5173/sdk-examples/`（具体端口取决于您的开发服务器设置）直接体验这些代码。
