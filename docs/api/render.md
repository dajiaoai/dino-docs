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

| 状态码 | 原因 |
| --- | --- |
| `400` | 参数不通过，或 `content` 不符合[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol) |
| `401` | API Key 无效 |
| `422` | 旧版接口拒绝包含 3D 几何的项目（`UNSUPPORTED_3D_GEOMETRY`）；v2 错误见下表 |

| 错误码 | HTTP 状态 | 可重试 | 说明 |
| --- | --- | --- | --- |
| `RENDER_QUEUE_FULL` | `503` | 是 | 渲染队列已满；响应带 `Retry-After: 1`。 |
| `RENDER_TIMEOUT` | `504` | 是 | 排队与执行总时间超过限制。 |
| `RENDER_CANCELLED` | `499` | 是 | 客户端取消请求或服务关闭时任务仍在排队。 |
| `RENDER_INVALID_REQUEST` | `422` | 否 | 目标画板无效、不是 3D 画板，或请求的输出尺寸超过限制。 |
| `RENDER_WORKER_FAILED` | `500` | 是 | 渲染工作线程异常退出或任务执行失败。 |
| `UNSUPPORTED_3D_PRIMITIVE` | `422` | 否 | 目标画板包含原生后端尚未实现的 3D 图元。 |
