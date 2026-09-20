---
title: 支持透明图片导出
description: SDK、MCP 与 HTTP API 支持通过 transparent 参数导出透明背景图片，适用于 PNG 和 SVG。
---

# 支持透明图片导出

- 类型：能力上新
- 发布时间：2026-09-20
- 生效时间：2026-09-20
- 影响范围：使用 SDK、MCP 与 HTTP API 导出图片的开发者
- 是否需要操作：现有接入无需修改；需要透明背景时传入 `transparent: true`，SDK 请使用 `2.14.0` 或更高版本

大角几何开放平台现已支持透明背景图片导出。通过 SDK、MCP 或 HTTP API 导出图片时，可使用统一的可选参数 `transparent?: boolean` 跳过背景色填充，方便将几何图嵌入课件、题库或不同底色的页面。

## 效果演示

![透明背景图片导出效果演示](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/51ff7360-screenshot-20260920-163747.png)

## 参数行为与格式支持

- **`true`**：跳过画板或母版的整块背景色填充，导出透明背景图片。
- **`false` 或省略**：继续绘制画板或母版中的背景色，保持现有行为。
- **仅影响背景色**：网格、坐标轴、图形、文字和图片仍会正常绘制。

| 导出格式 | 透明背景支持 |
| --- | --- |
| PNG | 支持，适用于 2D 和 3D 画板 |
| SVG | 支持，适用于 2D 画板 |
| JPG | 不支持 |
| TikZ | 不适用 |

## SDK

从 SDK `2.14.0` 起，`ExportImageBaseOptions` 新增可选参数 `transparent?: boolean`，默认值为 `false`。`view`、`contain`、`size` 三种图片导出模式均可使用。

在已创建的编辑器实例中，导出第一个画板的透明 PNG：

```typescript
const images = await editor.slides.exportImage({
  mode: 'contain',
  slideIndices: [1],
  format: 'png',
  transparent: true,
});
```

导出 2D 画板时，也可以将 `format` 设置为 `'svg'`。完整参数见 [SDK 图片导出](/sdk/2/export-image)。

## MCP

`export_image` 与 `export_image_3d` 的输入参数均新增可选字段 `transparent?: boolean`。调用时，在原有工具参数中加入 `transparent: true`，即可分别导出 2D 或 3D 画板的透明 PNG。

使用 MCP 客户端时，也可以直接提出以下要求：

```text
将当前画板导出为透明背景的 PNG 图片，保留网格、坐标轴和图形内容。
```

接入方式见 [MCP 接入](/ai/mcp/)。

## HTTP API

以下接口均在**请求体顶层**新增可选参数 `transparent?: boolean`：

| 接口 | 适用范围 |
| --- | --- |
| `POST /api/render/v2` | 2D 和 3D PNG 导出 |
| `POST /api/render` | 旧版 PNG 渲染接口 |
| `POST /api/render-svg` | SVG 渲染接口 |

`transparent` 不放入 `view2D` 或 `view3D`。将完整工程保存为 `project.algeo` 后，可使用以下示例导出第一个画板的透明 PNG：

```bash
jq '{
  content: .,
  slideIndex: 1,
  transparent: true
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

该示例适用于 2D 和 3D 画板，沿用目标画板保存的相机模式和参数。已有旧版 PNG 或 SVG 接入也只需在原有请求体顶层加入 `transparent: true`。

## 相关链接

- [SDK 图片导出](/sdk/2/export-image)
- [MCP 接入](/ai/mcp/)
- [PNG 导出接口](/api/render-v2)
- [旧版 PNG 接口与迁移说明](/api/api-render)
- [SVG 导出接口](/api/render-svg)
