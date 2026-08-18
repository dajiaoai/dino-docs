---
title: 大角工程文件（.algeo）数据协议
description: 大角工程文件的 JSON 数据结构、版本、画板和母版说明
---

# 大角工程文件（`.algeo`）数据协议

大角工程文件用于保存可继续编辑和交互的几何项目。

本文描述最新的 V11 协议。

## 文件与版本

| 项目 | 当前规范 |
| --- | --- |
| 文件扩展名 | `.algeo` 或 `.json` |
| 内容格式 | UTF-8 JSON |
| MIME 类型 | `application/vnd.dino-algeo.project+json` |
| 最新协议版本 | 字符串 `"11"` |
| 版本字段 | `metadata.version` |

::: warning
`metadata.version` 必须是字符串。不要通过手动修改版本号迁移旧文件，应先使用支持旧版本的大角几何编辑器或 SDK 加载，再重新导出。
:::

## 顶层结构

```typescript
interface FileContentLatest {
  slides: SlideV2[];
  messages: SeedChatMessage[][];
  templateStyle?: SlideStyleSheetV2;
  metadata: {
    version: '11';
    shareOptions?: ShareOptions;
  };
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `slides` | `SlideV2[]` | 是 | 项目中的画板列表，数组顺序就是画板顺序。 |
| `messages` | `SeedChatMessage[][]` | 是 | AI 会话列表。外层数组表示多个会话，内层数组表示一个会话中的消息。没有会话时传 `[]`。 |
| `templateStyle` | `SlideStyleSheetV2` | 否 | 项目母版样式，结构与画板的 `styleSheet` 一致。 |
| `metadata` | object | 是 | 文件版本和分享选项。 |

## 画板 `SlideV2`

```typescript
interface SlideV2 {
  definitions: DefinitionV2[];
  uvarMap: [string, number][];
  styleSheet: SlideStyleSheetV2;
  doc: DocOp[];
  camera?: SlideCamera | SlideCamera3D;
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `definitions` | `DefinitionV2[]` | 点、线、圆、函数、文本、滑块、按钮、图片等对象的定义。定义顺序会影响依赖解析。 |
| `uvarMap` | `[string, number][]` | 用户变量当前值，按 `[变量名, 数值]` 保存。拖拽点坐标和滑块值等动态状态会出现在这里。 |
| `styleSheet` | `SlideStyleSheetV2` | 画板背景、坐标轴、网格、类型默认样式和对象独立样式。 |
| `doc` | `DocOp[]` | 画板关联的富文本内容，采用 Quill Delta Op 结构。 |
| `camera` | `SlideCamera \| SlideCamera3D` | 可选的二维或三维相机状态。 |

## 项目母版 `templateStyle`

`templateStyle` 是可选的项目级母版，结构与 `slides[].styleSheet` 相同。它与各画板当前样式分开保存：

- `templateStyle` 表示可跨画板使用的项目母版。
- `slides[].styleSheet` 表示某个画板当前实际保存的样式。
- 应用母版时会保留画板中按对象 ID 设置的独立样式。

项目母版只应包含可复用的视觉样式。坐标轴或网格范围、间隔、显示和锁定状态，以及按对象 ID 保存的样式，不应作为母版跨画板传播。

## 读写建议

- 保存时保留完整对象，不要只保存 `slides[].definitions`；变量值、样式、文档、相机、会话和母版都属于工程内容。
- 用 `JSON.stringify(content, null, 2)` 可以生成便于审阅的 `.algeo` 或 `.json` 文件；读取后应先解析 JSON，再校验协议版本和必要字段。
- 不要手动生成复杂几何 DSL。优先通过 SDK 获取完整内容，或通过 REPL、MCP 和 Agent API 生成项目。
- 收到未知版本时不要猜测字段含义，应升级接入组件或使用兼容该版本的编辑器转换。

## 在不同接入方式中使用

- **SDK**：通过编辑模式的 `getContent()` / `loadContent()`，或演示模式的 `loadFile()` 读写完整项目。
- **HTTP API**：Render API 的 `content` 字段接收完整的 `FileContentLatest`。
- **MCP**：`import_project` 导入完整项目，`export_project` 导出 `.algeo` 文件。
