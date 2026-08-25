---
title: API 接入
description: API 接入概览，包含渲染接口和 Agent 异步任务接口说明。
---

# API 接入

大角几何开放平台提供 HTTP API，支持在你的应用中集成 AI 几何生图与图形渲染能力。

## 能力概览

| 能力 | 适用场景 | 接口 |
| --- | --- | --- |
| **智能生图** | 输入文字或图片，生成可交互的几何图形 | [`POST /api/agent/run`](/api/agent) |
| **渲染为图片** | 将已有几何项目导出为 PNG | [`POST /api/render`](/api/render) |
| **渲染为 SVG** | 将已有几何项目导出为矢量图 | [`POST /api/render-svg`](/api/render) |
| **渲染为 TikZ** | 将已有几何项目导出为 LaTeX 源文件 | [`POST /api/render-tikz`](/api/render) |

## 能做什么

**批改作业时自动生成配图**：将题目描述通过智能生图接口转换为标准几何图形，配合文档或试卷一同展示。

**将几何项目嵌入报告**：从主站或 SDK 导出项目文件后，调用渲染接口批量生成 PNG/SVG，插入 PDF 或网页报告中。

**输出 LaTeX 论文插图**：对需要精确排版的学术场景，通过 TikZ 接口将几何图形导出为可直接编译的 `.tex` 文件。

**基于参考图自动建模**：上传手绘草图或截图，由 AI 识别图形结构并生成对应的可交互几何项目。

## 尺寸与字体

API 中的字号、线宽等视觉尺寸使用 px。各接口涉及的逻辑坐标、缩放和输出尺寸规则，请参阅[尺寸单位与换算](/reference/units)及具体接口文档。

HTTP API 可直接使用的字体见[公开字体列表](/reference/fonts)。

## 鉴权

所有接口均使用 Bearer API Key 鉴权，在请求头中传入：

```http
Authorization: Bearer djo_xxx
```

API Key 在[控制台](https://open.dajiaoai.com/console)中生成。详见[鉴权说明](/api/auth)。

## 接入咨询

如需了解[控制台](https://open.dajiaoai.com/console)使用、申请更高配额，请前往[联系我们](../CONTACT)。
