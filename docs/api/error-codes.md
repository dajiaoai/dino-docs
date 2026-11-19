---
title: API 错误码
description: 查阅 HTTP 状态码、结构化错误码、智能生图任务错误和内嵌 AI 流式错误。
---

# API 错误码

查阅 HTTP 状态码、结构化错误码、智能生图任务错误和内嵌 AI 流式错误。

## HTTP 状态码 {#http-status}

HTTP API 失败时返回 `success: false`。收到字符串或校验对象时，按 HTTP 状态码和消息排查。

| 状态码 | 含义 |
| --- | --- |
| `400` | 请求格式或参数无效，例如 JSON、表单、查询参数、工程内容或母版未通过校验。 |
| `401` | Bearer 凭证缺失、格式错误，或 API Key 无效或未启用。 |
| `402` | 积分不足，或内嵌 AI 请求未通过额度检查。 |
| `403` | 没有绑定积分账户，或积分账户不可用。 |
| `404` | 任务或内嵌 AI run 不存在、标识无效或不在当前 API Key 作用域内。创建任务后回读失败也可能返回此状态。 |
| `409` | 相同的 `x-request-id` 正在处理，或状态、积分更新发生冲突。 |
| `422` | 请求已解析，但画板、视图、尺寸或图元不满足渲染要求。 |
| `499` | 3D 渲染已取消。客户端断开时可能收不到响应。 |
| `500` | 服务执行失败。旧版 PNG、SVG 和 TikZ 的 `slideIndex` 越界也会返回此状态。 |
| `502` | 返回了无法识别的响应。 |
| `503` | 3D 渲染队列已满。 |
| `504` | 3D 渲染的排队与执行总时长超过限制。 |

## 鉴权与计费错误码 {#auth-billing}

下表列出鉴权与计费错误对应的 HTTP 状态。部分路径只返回消息字符串。

| 错误码 / HTTP | 含义 |
| --- | --- |
| `INVALID_INPUT` / `400` | 鉴权或计费服务未通过输入校验。 |
| `UNAUTHENTICATED` / `401` | 鉴权服务未能验证 API Key。 |
| `INSUFFICIENT_CREDITS` / `402` | 积分不足。 |
| `ACCOUNT_NOT_FOUND` / `403` | 鉴权或计费服务找不到积分账户。 |
| `INVALID_STATE` / `409` | 当前业务状态不允许该操作。 |
| `CAS_CONFLICT` / `409` | 并发更新积分时发生冲突，已达到内部重试上限。 |
| `CONFLICT` / `409` | 鉴权或计费操作发生冲突。 |

## 渲染错误码 {#render}

通过响应的 `error.code` 读取渲染错误码。

| 错误码 / HTTP | 含义 |
| --- | --- |
| `UNSUPPORTED_3D_GEOMETRY` / `422` | 旧版 PNG、SVG 和 TikZ 要求整个项目为 2D。PNG v2 的 2D 目标画板也不能包含 3D 图元。 |
| `RENDER_INVALID_REQUEST` / `422` | 目标画板无效，视图与画板维度不匹配，边界、相机或裁剪无效，或 PNG 实际宽高任一超过 2048 像素。 |
| `UNSUPPORTED_3D_PRIMITIVE` / `422` | 3D 画板包含当前渲染后端不支持的图元。 |
| `RENDER_CANCELLED` / `499` | 客户端断开或渲染进程池关闭时取消。连接有效且仍需导出时，可重新发起请求。 |
| `RENDER_WORKER_FAILED` / `500` | 渲染任务失败、工作进程退出或已关闭。查看响应中的 `retryable`。 |
| `RENDER_QUEUE_FULL` / `503` | 3D 渲染队列已满。按响应头 `Retry-After` 指定的秒数等待后重试。 |
| `RENDER_TIMEOUT` / `504` | 3D 渲染在允许时间内未完成，包括排队时间。可以重试。 |

## 智能生图任务错误码 {#agent-task}

任务列表和详情以 HTTP `200` 返回已执行失败的任务。遇到 `status: "error"` 时，读取任务的 `extra.errorCode` 和 `extra.errorMessage`。

| 错误码 | 含义 |
| --- | --- |
| `input_image_fetch_failed` | 执行任务时未能读取输入图片。 |
| `artifact_upload_not_configured` | 服务未配置工程文件上传。 |
| `invalid_ai_environment` | 服务端 AI 运行环境无效或未配置。 |
| `agent_execution_failed` | 智能生图任务执行失败。 |

## 内嵌 AI 流式错误码 {#embedded-ai}

HTTP `200` 建立流后，本服务的终止错误通过 SSE `error` 事件返回，查看事件 JSON 中的 `code` 和 `error`。流转发或读取失败时可能只有消息。上游提供方的 `response.failed` 和 `error` 事件使用其自身的结构。

| 错误码 | 含义 |
| --- | --- |
| `invalid_ai_environment` | 服务端 AI 运行环境无效或未配置。 |
| `unsupported_embedded_ai_model` | 流式请求使用的模型不受支持。 |
| `embedded_ai_execution_failed` | 内嵌 AI 请求执行失败。 |
