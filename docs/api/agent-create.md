---
title: 创建任务
description: 提交文字、参考图片和可选母版，创建异步智能生图任务。
---

# 创建任务

<AgentPlayground />

**Base URL：** `https://api.dajiaoai.com`

调用前请阅读[鉴权说明](/api/auth)和[智能生图服务概览](/api/agent)。

- 方法：`POST`
- 路径：`/api/agent/run`
- Content-Type：`multipart/form-data`

## 请求字段

| 字段      | 类型   | 必填 | 说明                                                                              |
| --------- | ------ | ---- | --------------------------------------------------------------------------------- |
| `model`   | string | 是   | agent 使用的模型别名，详见[模型说明](/api/models)。 |
| `content` | string | 否   | 用户要执行的绘图任务描述。                                                        |
| `template` | string | 否 | 风格母版数据，传入母版 JSON 字符串。可在[大角几何母版](https://dajiaoai.com/master-templates)页面下载母版数据。 |
| `images`  | file[] | 否   | 图片字段，字段名固定为 `images`，最多 10 张；通过重复传多个 `images` 表单项上传。 |

说明：`model` 为必填字段。`content` 与图片至少需要提供一个。若只传图片而不传 `content`，服务会自动补默认提示。

## 示例请求

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=请画一个边长为 4 的正三角形，并给出一个可拖拽的顶点 A。" \
  -F "template=<./template.json"
```

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=请综合这些参考图绘制对应的几何图形。" \
  -F "images=@./example-1.png;type=image/png" \
  -F "images=@./example-2.png;type=image/png"
```

## 成功响应

```json
{
  "success": true,
  "taskId": "6844db73f1d0c0e74f5e9d01",
  "status": "created",
  "createdAt": "2026-06-08T10:00:00.000Z"
}
```

## 失败响应

| 状态码 | 原因 |
| --- | --- |
| `400` | 参数不通过 |
| `402` | 积分不足 |


创建成功后，使用返回的 `taskId` 轮询[任务详情](/api/agent-detail)，直到任务完成或失败。
