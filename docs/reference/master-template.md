---
title: 如何使用风格母版
description: 下载风格母版，并在 MCP、内嵌 SDK、智能生图和渲染 API 中复用统一的视觉样式
---

# 如何使用风格母版

风格母版用于统一画板背景、网格、坐标轴，以及点、线、圆、文本等对象的默认样式。当同一批几何图需要用于题库、课件或出版排版时，可以在绘图、内嵌展示和导出环节复用同一份母版。

本文中的“母版”“风格母版”指同一类样式数据。母版不包含题目的几何构造；已有工程仍需单独加载，新图仍需提供绘图描述。

![风格母版演示图](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/e0bcf737-screenshot-20260920-143134.png)

[在线体验风格母版效果](https://dajiaoai.github.io/algeo-sdk/examples/15-presentation-master-template.html)

## 1. 下载母版

打开[大角几何母版](https://dajiaoai.com/master-templates)页面，选择需要的风格并下载母版 JSON。以下示例将文件命名为 `template.json`。

| 使用场景 | 调用入口 | 母版格式 |
| --- | --- | --- |
| 让 AI 通过 MCP 绘图 | `load_template` | `template_content` 传对象，或 `template_url` 传公开 HTTPS 地址 |
| 内嵌 SDK 编辑或演示 | `mode.setMasterTemplate(template)` | JSON 字符串 |
| HTTP API 智能生图 | `/api/agent/run` 的 `template` | 表单中的 JSON 字符串 |
| HTTP API 导出图片或 TikZ | 渲染接口的 `template` | JSON 请求体中的对象 |

## 2. 在绘图或展示时应用

### MCP：告诉 AI 母版来源和应用范围

先完成 [MCP 接入](/ai/mcp/)，将母版 JSON 上传到对话，再发送：

```text
读取我上传的母版文件，应用到全部现有画板，并设为后续新建画板的默认母版。
然后画一个边长为 4 的正三角形。
```

如果文件托管在公开 HTTPS 地址，也可以让 AI 从该地址加载。下面是 `load_template` 的参数示例，请将示例地址替换为实际可访问的 JSON 文件地址：

```json
{
  "template_url": "https://example.com/template.json",
  "applyToAllSlides": true,
  "setAsGlobal": true
}
```

`applyToAllSlides` 影响全部已有画板，`setAsGlobal` 影响当前会话后续新建画板。只想修改部分画板时，用 `applyToSlideIndexes: [1, 3]` 替换 `applyToAllSlides`，画板序号从 `1` 开始。

本地文件内容应通过 `template_content` 传入对象，与 `template_url` 二选一。完整参数及应用范围规则见[在 MCP 中使用母版](/ai/mcp/master-template)。

### SDK：加载工程后设置母版

SDK 从 `2.9.0` 起支持 `mode.setMasterTemplate()`。先按[编辑模式](/sdk/2/editor)或[演示模式](/sdk/2/presentation)文档创建实例并加载工程，再传入母版 JSON 字符串。

以下示例假设宿主网站已将下载文件托管为 `/template.json`，且 `editor` 已完成初始化：

```typescript
const response = await fetch('/template.json');
if (!response.ok) {
  throw new Error(`读取母版失败：${response.status}`);
}
const masterTemplateContent = await response.text();

await editor.mode.setMasterTemplate(masterTemplateContent);
```

演示模式使用同样的字符串，对当前加载的画板应用母版：

```typescript
await presentation.mode.setMasterTemplate(masterTemplateContent);
```

等待设置完成后，再检查画板或执行导出。

### 智能生图 API：创建任务时传入母版

将母版与绘图描述一起提交。下面的命令在 `template.json` 所在目录执行；请将 `djo_xxx` 替换为自己的 API Key：

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=请画一个边长为 4 的正三角形，标注顶点 A、B、C。" \
  -F "template=<./template.json"
```

`template=<./template.json` 会读取文件内容作为文本表单字段。这里需要 JSON 字符串，不能改成上传文件的 `template=@./template.json`。

接口返回 `taskId` 后，按[智能生图接口](/api/agent)查询任务详情，待任务完成后获取生成结果。

## 3. 在渲染 API 中使用同一份母版

已有工程也可以在导出时指定母版。将完整工程保存为 `project.algeo`，与 `template.json` 放在同一目录。以下示例需要安装 `jq`，它会将两个文件读为 JSON 对象，构造 PNG 导出请求：

```bash
jq -n \
  --slurpfile project project.algeo \
  --slurpfile template template.json \
  '{content: $project[0], slideIndex: 1, template: $template[0]}' | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

此处 `template` 是对象，不能再用 `JSON.stringify()` 包成字符串。省略时沿用目标画板现有样式。示例使用画板保存的相机参数，成功后从响应中的 `url` 获取图片。

[PNG](/api/render-v2)、[SVG](/api/render-svg) 和 [TikZ](/api/render-tikz) 导出接口均支持 `template` 对象，其他请求参数请按对应接口文档填写。

## 常见问题 Q&A

### 如何确认母版已生效？

使用包含点、线和文字标注的画板检查背景、线条颜色、线宽及文字样式，再切换画板或导出，确认所需范围已应用母版。

### 为什么某个对象仍保留原来的颜色？

母版提供类型默认样式。已有对象按对象 ID 设置的独立样式会保留，因此个别对象可能继续使用自己的颜色或线宽。需要统一时，应检查并清除或调整这些独立样式。

### 为什么母版没有统一构图和图片尺寸？

母版用于复用视觉样式。坐标轴或网格的范围、间隔、显示和锁定状态不应作为母版跨画板传播；工程母版与画板样式的关系见[工程文件数据协议](./algeo-file-protocol)。

需要在多个环节保持相同构图和像素尺寸时，还应单独统一导出范围与缩放参数，参阅[多环节图片导出尺寸一致性](./consistent-image-export)。
