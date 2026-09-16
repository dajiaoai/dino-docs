---
title: API 支持立体几何渲染
description: 通过 PNG 导出 API 渲染立体几何画板，支持自定义相机视角、投影模式与输出分辨率。
---

# API 支持立体几何渲染

- 类型：能力上新
- 发布时间：2026-09-16
- 生效时间：2026-09-16
- 影响范围：使用渲染 API 的开发者
- 是否需要操作：如需渲染 3D 画板，请使用 `POST /api/render/v2`

大角几何开放平台的渲染 API 现已支持立体几何（3D）画板。继 MCP 与 SDK 支持立体几何图片导出后，开发者可以通过 HTTP API 提交完整工程内容，将指定的 3D 画板渲染为 PNG，并获取图片访问链接与元数据，接入题库、课件和批量制图流程。

## 本次上线能力

- **3D 画板导出**：通过 `content` 提交完整工程，使用 `slideIndex` 选择目标画板。
- **自定义相机视角**：通过 `view3D` 设置相机中心、水平与俯仰观察角、相机缩放比例。
- **多种投影模式**：支持正交投影（`orthographic`）、透视投影（`perspective`）与斜投影（`oblique`）。
- **自定义输出分辨率**：通过 `width`、`height` 设置逻辑输出尺寸，通过 `pixelRatio` 调整最终 PNG 的物理像素尺寸。

## 调用示例

将主站或 SDK 导出的完整工程保存为 `project.algeo`。以下示例使用 `jq` 包装请求，要求第 `1` 个画板为 3D 画板：

```bash
jq '{
  content: .,
  slideIndex: 1,
  view3D: {
    projection: "orthographic",
    yaw: 0.7853981633974483,
    pitch: 0.7853981633974483,
    width: 1280,
    height: 720,
    pixelRatio: 2
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

该示例输出 **2560 × 1440 像素**的 PNG。成功响应包含图片 `url`、最终像素尺寸 `width` / `height`、实际使用的 `camera` 参数和 `pixelRatio` 等信息。

::: info 参数说明
`view2D` 与 `view3D` 不能同时传入。角度参数使用弧度。`view3D.width` 和 `view3D.height` 省略时均为 `1024`，`pixelRatio` 默认为 `1`。完整参数、默认值与响应格式见 [PNG 导出接口](/api/render-v2)。
:::

## 相关链接

- [PNG 导出接口](/api/render-v2)
- [API 计费说明](/api/pricing)
- [旧版接口与迁移说明](/api/api-render)
- [MCP 与 SDK 支持立体几何图片渲染](./2026-09-02-3d-rendering-api-mcp-sdk)
