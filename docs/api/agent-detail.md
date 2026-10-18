---
title: 任务详情
description: 查询智能生图任务状态，轮询获取生成的工程文件。
---

# 任务详情

<AgentPlayground variant="detail" />

**Base URL：** `https://api.dajiaoai.com`

调用前请阅读[鉴权说明](/api/auth)和[智能生图服务概览](/api/agent)。

- 方法：`GET`
- 路径：`/api/agent/tasks/:taskId`

## 示例请求

```bash
curl https://api.dajiaoai.com/api/agent/tasks/6844db73f1d0c0e74f5e9d01 \
  -H "Authorization: Bearer djo_xxx"
```

## 成功响应

```json
{
  "success": true,
  "task": {
    "taskId": "6844db73f1d0c0e74f5e9d01",
    "customerId": "6844db10f1d0c0e74f5e9cff",
    "applicationId": "6844db40f1d0c0e74f5e9d00",
    "apiKeyId": "6844db50f1d0c0e74f5e9d02",
    "type": "agent",
    "content": "请画一个三角形",
    "imgUrl": null,
    "imgUrls": null,
    "status": "finished",
    "artifactUrl": "https://dl.easeplay.vip/dajiao-open/dev/mcp/.../result.algeo",
    "createdAt": "2026-06-08T10:00:00.000Z",
    "updatedAt": "2026-06-08T10:00:05.000Z"
  }
}
```

## 错误响应

| 状态码 | 原因 |
| --- | --- |
| `404` | 任务不存在，或不属于当前 API Key 作用域 |

## 状态说明

- `created`：任务已入库，等待 worker 领取
- `running`：worker 已开始执行
- `finished`：任务完成，`artifactUrl` 可读
- `error`：任务失败

## 轮询建议

- 前 30 秒每 2 秒轮询一次任务详情接口
- 30 秒后降到每 5 秒一次
- 命中 `finished` 或 `error` 后停止轮询

## 产物说明

任务完成后，`artifactUrl` 指向大角几何工程文件（`.algeo`）。

