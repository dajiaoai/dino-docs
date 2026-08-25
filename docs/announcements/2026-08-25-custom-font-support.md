---
title: SDK、MCP 与 API 自定义字体能力上线
description: SDK 2.12.0 内嵌画板支持传入自定义字体，MCP 和 API 支持为画板内容指定字体。
---

# SDK、MCP 与 API 自定义字体能力上线

- 类型：能力上新
- 发布时间：2026-08-25
- 生效时间：2026-08-25
- 影响范围：使用 SDK 2.x 编辑或演示模式、MCP、智能生图 API、渲染 API 的开发者
- 是否需要操作：现有接入无需修改；仅在使用自定义字体或显式指定字体时需要调整配置、作图指令或工程内容

## 更新内容

本次更新为内嵌画板和服务端作图流程补充了完整的字体支持：

1. **SDK 内嵌画板可传入自定义字体**：从 SDK `2.12.0` 起，编辑模式和演示模式均可在创建实例时通过 `fonts` 配置字体资源、字体选择器目录和默认字体。
2. **MCP 可指定字体**：在自然语言作图要求或 REPL 样式中指定字体 `key`，用于文本、对象标签和按钮等内容。
3. **API 可指定字体**：智能生图 API 可在 `content` 作图描述中指定字体；渲染 API 会按照传入工程内容中的字体设置渲染 PNG、SVG 或 TikZ。
4. **公开字体列表统一维护**：SDK、MCP 和 API 的默认公开字体及各场景的自定义字体接入方式统一收录在[字体支持](/reference/fonts)规范中。

## SDK 内嵌画板传入自定义字体

SDK 接入方可以通过 URL、纯 base64 字符串或完整 data URL 提供字体资源。以下示例注册一个品牌字体，将其加入编辑器字体选择器并设为新建文本的默认字体：

```ts
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(container, {
  auth: { appId: 'YOUR_APP_ID' },
  fonts: {
    resources: [
      {
        key: 'brand-sans',
        source: {
          type: 'url',
          url: 'https://cdn.example.com/brand-sans.woff2',
          format: 'woff2',
        },
      },
    ],
    catalog: [
      { key: 'brand-sans', name: '品牌字体' },
      { key: 'sans-serif', name: '无衬线字体', type: 'system' },
    ],
    defaultFont: 'brand-sans',
  },
});
```

- `resources`：需要由内嵌页面加载和注册的字体文件。
- `catalog`：编辑模式字体选择器展示的字体及顺序；演示模式可省略。
- `defaultFont`：新建文本使用的默认字体 `key`。

字体 URL 必须允许内嵌页面跨域访问。接入方应自行确认字体的使用许可和网络分发授权。完整类型定义、base64 用法和跨域要求见 [SDK 自定义字体](/sdk/2/fonts)。

## MCP 指定字体

使用 MCP 作图时，可以直接在指令中指定公开支持的字体，例如：

```text
画一个直角三角形，点标签使用 Times New Roman，说明文字使用无衬线字体。
```

也可以在 REPL 样式中使用字体 `key`：

```text
style Text { font: "Times New Roman"; }
```

可使用 `help fonts` 查看当前 MCP 环境提供的字体目录。字体会影响文本、标签或按钮等支持 `font` 样式的内容，但不会改变 LaTeX 数学公式自身的排版字体。

## API 指定字体

### 智能生图 API

调用 `POST /api/agent/run` 时，可在 `content` 中描述字体要求：

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=画一个等边三角形，点标签使用 Times New Roman，说明文字使用 sans-serif。"
```

### 渲染 API

调用 PNG、SVG 或 TikZ 渲染接口时，不需要额外传入字体参数。渲染服务读取请求体 `content` 中的工程内容，并按照文本、标签、按钮及默认样式中的字体 `key` 输出结果。

为保证结果可预期，请使用[公开字体列表](/reference/fonts)中的 `key`。如需在 MCP 或 API 服务端使用列表外字体，请按字体支持规范中的说明[联系我们](/CONTACT)开通支持。

## 相关链接

- [字体支持通用规范](/reference/fonts)
- [SDK 自定义字体](/sdk/2/fonts)
- [MCP 接入](/ai/mcp)
- [智能生图 API](/api/agent)
- [渲染 API](/api/render)
