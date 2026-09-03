---
title: MCP 与 SDK 支持立体几何图片渲染
description: 大角几何现已支持通过 MCP 和 SDK 导出立体几何画板图片。
---

# MCP 与 SDK 支持立体几何图片渲染

- 类型：能力上新
- 发布时间：2026-09-02
- 生效时间：2026-09-02
- 影响范围：使用 MCP 或 `@dajiaoai/algeo-sdk` 的开发者
- 是否需要操作：如需通过 SDK 导出 3D 画板，请升级到 `@dajiaoai/algeo-sdk@2.13.0` 或更高版本

大角几何现已支持将立体几何（3D）画板渲染为图片。开发者可以在 AI 工具链或网页宿主中复用同一份 3D 工程内容，按指定相机视角导出结果，用于题图生产、课件、报告与内容审核等场景。

## 本次上线能力

### MCP

新增 `export_image_3d` 工具，可在 MCP 会话中导出当前或指定的 3D 画板 PNG 图片，并返回访问链接。工具支持设置相机 `offset`、`yaw`、`pitch`、`projection`、`scale` 以及输出宽高。

### SDK

`@dajiaoai/algeo-sdk@2.13.0` 的 `editor.slides.exportImage()` 支持 3D 画板的 PNG、JPG 导出。通过 `viewCamera3d` 可覆盖导出相机和逻辑输出尺寸：

```ts
const [image] = await editor.slides.exportImage({
  mode: 'view',
  slideIndices: [1],
  format: 'png',
  viewCamera3d: {
    width: 1200,
    height: 800,
    offset: [0, 0, 0],
    yaw: Math.PI / 4,
    pitch: Math.PI / 6,
  },
  pixelRatio: 2,
});
```

`width` 与 `height` 表示逻辑输出像素尺寸；省略时均为 `1024`。`pixelRatio` 用于提升最终物理分辨率，`scale` 用于调整相机远近和构图。

## 同步优化 2D SDK 导出参数

SDK 2.13.0 同时优化了 2D 精确视野导出参数。推荐使用边界表达更清晰的 `viewBound`：

```ts
viewBound: {
  left: -5,
  top: 5,
  right: 5,
  bottom: -5,
}
```

`viewBound` 要求 `left < right` 且 `bottom < top`。此前的 `viewBounds: { x, y, width, height }` 已废弃，但仍保留兼容支持。建议升级 SDK 后逐步迁移至 `viewBound`。

## 适用场景

- 为空间几何题、立体图形和三维坐标系生成题图
- 在 AI 代理、MCP 工作流中按指定相机角度生成配图
- 将 3D 画板导入课件、讲义、报告或网页内容
- 批量生成不同视角、不同分辨率的立体几何图片

## 相关链接

- [SDK 2.13.0 Release](https://github.com/dajiaoai/algeo-sdk/releases/tag/2.13.0)
- [SDK 编辑模式图片导出](/sdk/2/export-image)
- [MCP 使用指南](/ai/mcp/)
