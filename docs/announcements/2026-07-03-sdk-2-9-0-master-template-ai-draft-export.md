---
title: SDK 2.9.0 母版、AI 草稿与导出能力更新
description: SDK 2.9.0 新增内嵌模式母版风格设置、编辑器 AI 草稿设置与清空，并扩展 SVG 和 LaTeX 导出能力。
---

# SDK 2.9.0 母版、AI 草稿与导出能力更新

- 类型：能力上新
- 发布时间：2026-07-03
- 生效时间：2026-07-03
- 影响范围：使用 SDK 2.x 编辑模式、演示模式、AI 对话或画板导出能力的开发者
- 是否需要操作：如需使用本次新增能力，请升级到 `@dajiaoai/algeo-sdk@2.9.0` 或更高版本，并按需更新宿主侧调用

## 变更内容

本次 SDK 2.9.0 更新包含三部分：

1. **内嵌模式支持设置母版风格**：编辑模式新增 `editor.mode.setMasterTemplate(template)`，演示模式新增 `presentation.mode.setMasterTemplate(template)`，用于统一画板背景、网格、默认图形样式等母版配置。
2. **AI 对话框支持草稿设置与清空**：编辑模式新增 `editor.ai.setDraft(draft)` 与 `editor.ai.clearDraft()`，宿主页面可以把提示词和图片预填到 AI 面板中，用户仍可继续编辑草稿后再发起 AI 对话。
3. **画板导出支持 SVG 与 LaTeX**：`editor.slides.exportImage(options)` 的 `format` 扩展支持 `svg` 和 `latex`，适用于网页展示、文档排版、设计工具编辑、题库生产等场景。

## 适用场景

- 希望不同宿主业务或不同文档统一画板背景、网格和默认图形风格
- 需要在识别当前几何图后，把提示词和图片自动带入 AI 对话框
- 需要将几何图导出为可缩放、可编辑或适合排版的 SVG / LaTeX 内容
- 需要为题库、试卷、讲义、课件生产链路补充更稳定的图形导出格式

## 如何开始使用

1. 升级到 `@dajiaoai/algeo-sdk@2.9.0` 或更高版本。
2. 如需设置母版风格，调用 `editor.mode.setMasterTemplate(template)` 或 `presentation.mode.setMasterTemplate(template)`。
3. 如需预填 AI 面板，调用 `editor.ai.setDraft({ text, images, openPanel, focus })`。
4. 如需清空 AI 草稿，调用 `editor.ai.clearDraft()`。
5. 如需导出 SVG 或 LaTeX，调用 `editor.slides.exportImage({ format: 'svg' })` 或 `editor.slides.exportImage({ format: 'latex' })`。

## 相关链接

- [编辑模式文档](/sdk/2/editor)
- [演示模式文档](/sdk/2/presentation)
- [编辑器 AI 对话接入说明](/sdk/2/ai-chat)
- [SDK 示例中心](https://dajiaoai.github.io/algeo-sdk/)
