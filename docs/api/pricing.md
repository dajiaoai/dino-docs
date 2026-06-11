---
title: 定价说明
description: 大角几何开放平台 API 定价说明，包含智能生图服务与渲染服务计费规则。
---

# 定价说明

本文档描述大角几何开放平台 API 的当前定价规则。

## 智能生图服务

- `POST /api/agent/run` 创建任务时立即扣费。
- 计费按模型别名区分：
  - `dinogeo-1-pro`：16000 积分
  - `dinogeo-1`：11000 积分

> 仅任务成功执行后扣费。

## 渲染服务

- `/api/render`、`/api/render-svg`、`/api/render-tikz` 均为导出接口。
- 当前默认扣费：
  - `export_image`：100 积分 / 次
  - `export_svg`：100 积分 / 次
  - `export_tikz`：100 积分 / 次

> SVG 导出仍在服务端依赖文本测量，TikZ 导出返回 `.tex` 文档。

## 注意事项

- 具体计费规则以控制台和服务端公告为准。
- 如有疑问，请联系大角几何开放平台支持。
