# 范例中心 (SDK Examples)

我们在 `algeo-sdk` 仓库的 `examples/` 目录下提供了 13 个标准示例，涵盖了从基础嵌入到高级 API 服务的所有核心场景。

## 基础集成

### [01-basic-iframe.html](https://dajiaoai.github.io/algeo-sdk/examples/01-basic-iframe.html)

展示如何使用原生 `<iframe>` 结合 `postMessage` 进行最底层的通信。这是 SDK 依赖的底层机制。

### [02-sdk-usage.html](https://dajiaoai.github.io/algeo-sdk/examples/02-sdk-usage.html)

**推荐入门方案**。展示如何通过 SDK 提供的 `createPresentation` 方法快速初始化并渲染画板。

## 演示与交互

### [03-switch-slide.html](https://dajiaoai.github.io/algeo-sdk/examples/03-switch-slide.html)

演示如何在外部页面通过按钮调用 `switchSlide` API 切换多页课件。

### [04-load-file.html](https://dajiaoai.github.io/algeo-sdk/examples/04-load-file.html)

展示从本地加载结构化 JSON 内容（DSL）并推送到画板中渲染的流程。

### [05-repl.html](https://dajiaoai.github.io/algeo-sdk/examples/05-repl.html)

**自动化核心**。展示如何通过 `repl()` 方法向画板发送几何绘图指令（如画圆、过点求垂线等）。

## 编辑器进阶

### [06-editor-mode.html](https://dajiaoai.github.io/algeo-sdk/examples/06-editor-mode.html)

编辑器集成标准范本。包含 UI 面板开关配置与基本的历史记录管理。

### [07-document-api.html](https://dajiaoai.github.io/algeo-sdk/examples/07-document-api.html)

展示如何调用 `editor.document.getContent()` 获取当前编辑的 DSL 数据。

### [08-slides-api.html](https://dajiaoai.github.io/algeo-sdk/examples/08-slides-api.html)

完整的画板增删改查交互范例，包含重排顺序与复制页面。

### [09-history-api.html](https://dajiaoai.github.io/algeo-sdk/examples/09-history-api.html)

演示如何自定义“撤销/重做”按钮并同步编辑器的历史状态（CanUndo / CanRedo）。

## 事件与工程化

### [10-editor-events.html](https://dajiaoai.github.io/algeo-sdk/examples/10-editor-events.html)

监听编辑器的 `save` 与 `contentChange` 事件，并将变更实时在外部控制台打印。

### [11-editor-share-id.html](https://dajiaoai.github.io/algeo-sdk/examples/11-editor-share-id.html)

展示如何在编辑器模式下，通过分享 ID 加载已有内容进行二次编辑。

### [12-export-slide-image.html](https://dajiaoai.github.io/algeo-sdk/examples/12-export-slide-image.html)

展示如何调用 `editor.slides.exportImage()` 导出画板图片。支持默认导出全部画板，也可通过 `slideIndices`（1-based）指定导出范围，可配置图片格式、分辨率与质量。

### [13-ai-chat.html](https://dajiaoai.github.io/algeo-sdk/examples/13-ai-chat.html)

展示如何在 SDK 编辑模式下开启 AI 对话功能。宿主页面监听 `aiRequest`，调用自己的 AI 服务，再通过 `editor.ai.consumeStream()` 或 `editor.ai.pushStreamEvent()` 将流式结果回传给内嵌编辑器。

---

> **运行提示**：您可以克隆仓库并运行 `npm run dev`（在大角几何主项目根目录），然后在浏览器访问 `http://localhost:5173/sdk-examples/`（具体端口取决于您的开发服务器设置）直接体验这些代码。
