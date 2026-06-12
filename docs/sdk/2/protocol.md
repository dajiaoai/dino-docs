# 数据协议

大角几何 SDK 采用了一种基于 JSON 的领域专用语言（DSL）。该协议描述了文档元数据、多页画板结构以及底层的几何实体。

## 基本结构

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

