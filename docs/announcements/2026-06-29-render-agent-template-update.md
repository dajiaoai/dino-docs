---
title: 渲染接口参数与智能生图母版能力更新
description: 渲染接口切换为 viewBound 视口参数，并支持在渲染接口和智能生图接口中传入风格母版。
---

# 渲染接口参数与智能生图母版能力更新

- 类型：能力变更
- 发布时间：2026-06-29
- 生效时间：2026-06-29
- 影响范围：调用 Render API 或智能生图 Agent API 的开发者
- 是否需要操作：使用 Render API 的调用方需要按新请求参数传入 `viewBound`；如需统一导出或生图风格，可传入 `template` 母版数据

## 变更内容

本次更新包含两部分：

1. **渲染接口使用 `viewBound` 指定导出视口**：`/api/render`、`/api/render-svg`、`/api/render-tikz` 的请求体使用 `viewBound` 描述逻辑视口边界。`viewBound` 为必填字段，格式为 `{ left, right, bottom, top }`，实际输出画布尺寸按 `width = right - left`、`height = top - bottom` 计算。
2. **渲染接口和智能生图接口支持风格母版**：Render API 可通过 `template` 指定渲染母版；智能生图接口 `/api/agent/run` 也新增可选 `template` 字段，用于指定生成结果的风格母版。

母版数据可在[大角几何母版](https://dajiaoai.com/master-templates)页面下载。

## 响应字段更新

渲染接口成功响应会返回更完整的导出元数据，包括：

| 字段 | 说明 |
| --- | --- |
| `objectKey` | 导出文件在对象存储中的完整 key |
| `viewBound` | 本次渲染实际使用的逻辑视口边界 |
| `scale` | 本次渲染实际使用的相机缩放比例 |

## 相关链接

- [渲染接口文档](/api/render)
- [智能生图接口文档](/api/agent)
