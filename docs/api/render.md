---
title: 渲染接口
description: 描述大角几何开放平台 HTTP 渲染接口，支持 PNG、SVG 和 TikZ 导出。
---

# 渲染接口

**Base URL：** `https://api.dajiaoai.com`

接口接收一个符合[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)的项目内容，渲染指定画板并返回导出文件地址与元数据。

::: info 尺寸单位
`viewBound` 使用画板逻辑坐标，`scale` 表示每个逻辑单位对应的像素数，返回结果中的 `width` 和 `height` 表示图片像素尺寸。工程内字号、线宽等视觉尺寸使用 px；如果你手头的规范使用 pt，请查看[尺寸单位与换算](/reference/units)。
:::

## 概览

| 说明 | 路径 | 方法 | 支持 |
| --- | --- | --- | --- |
| [导出 PNG](./render-v2) | `/api/render/v2` | `POST` | 2D、3D |
| [导出 SVG](./render-svg) | `/api/render-svg` | `POST` | 2D |
| [导出 TikZ/TeX](./render-tikz) | `/api/render-tikz` | `POST` | 2D |

::: warning 推荐使用新版 PNG 接口
PNG 导出推荐使用 `POST /api/render/v2`。已有 `/api/render` 接入可查看[旧版接口与迁移说明](./api-render)。
:::

鉴权方式见[鉴权说明](/api/auth)。

## PNG 接口 {#render-v2}

`POST /api/render/v2` 的参数与示例见[导出 PNG](./render-v2)。

## 失败响应

遇到 `400` 时，检查工程内容及请求参数。2D 导出遇到 `422` / `UNSUPPORTED_3D_GEOMETRY` 时，3D 画板请改用 PNG v2 导出。

完整列表见[API 错误码](/api/error-codes#render)。
