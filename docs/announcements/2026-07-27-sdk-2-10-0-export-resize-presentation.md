---
title: SDK 2.10.0 导出、自动重绘与演示模式更新
description: SDK 2.10.0 升级画板图片与 LaTeX 导出能力，支持容器恢复可见时自动重绘，并调整演示模式鉴权、路由和 UI 配置。
---

# SDK 2.10.0 导出、自动重绘与演示模式更新

- 类型：能力变更
- 发布时间：2026-07-27
- 生效时间：2026-07-27
- 影响范围：使用 SDK 2.x 画板导出、演示模式或动态容器布局的开发者
- 是否需要操作：升级前请重点检查图片与 LaTeX 导出调用，以及演示模式的 `appId` 配置

## 变更内容

本次 SDK 2.10.0 更新包含四部分：

1. **画板导出能力升级**：`editor.slides.exportImage(options)` 新增 `size`、`view`、`contain` 三种模式，覆盖固定输出尺寸、指定世界坐标视野和完整包围内容等场景；LaTeX/TikZ 导出拆分为独立的 `editor.slides.exportLatex(options)`。
2. **容器恢复可见时自动重绘**：编辑模式和演示模式均新增 `resize()`。SDK 会监听容器尺寸变化，并在隐藏容器恢复可见时自动通知内嵌页重新测量和重绘。
3. **演示模式配置调整**：应用标识由顶层 `appId` 调整为 `auth.appId`，默认路由调整为 `/embed/present/:appId/:shareId`；UI 配置新增 `slidePanel`、`pencilToolbar` 和 `zoomControl`。
4. **AI 对话草稿图片输入增强**：草稿图片输入支持 URL 和 Base64，便于宿主页面使用不同来源的图片预填 AI 对话框。

## 升级注意事项

演示模式需将应用标识移动到 `auth`：

```ts
const presentation = await createPresentation(container, {
  auth: { appId: 'YOUR_APP_ID' },
  shareId: 'YOUR_SHARE_ID',
});
```

图片导出需明确指定导出模式：

```ts
const images = await editor.slides.exportImage({
  mode: 'view',
  viewBounds: { x: -5, y: -5, width: 10, height: 10, scale: 50 },
  pixelRatio: 2,
});
```

LaTeX/TikZ 请改用独立接口：

```ts
const items = await editor.slides.exportLatex({
  standalone: true,
});
```

## 适用场景

- 需要按固定尺寸、指定视野或内容范围导出 PNG、JPG、SVG
- 需要将几何图导出为可编辑、可排版的 LaTeX/TikZ
- 使用隐藏标签页、折叠面板或动态布局承载内嵌画板
- 需要控制演示模式的画板管理器、教具栏和缩放栏

## 相关链接

- [SDK 2.10.0 Release](https://github.com/dajiaoai/algeo-sdk/releases/tag/2.10.0)
- [编辑模式文档](/sdk/2/editor)
- [演示模式文档](/sdk/2/presentation)
- [SDK 示例中心](https://dajiaoai.github.io/algeo-sdk/)
