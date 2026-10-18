---
title: 任务列表
description: 分页查询智能生图任务，支持按状态筛选。
---

# 任务列表

<AgentPlayground variant="tasks" />

**Base URL：** `https://api.dajiaoai.com`

调用前请阅读[鉴权说明](/api/auth)和[智能生图服务概览](/api/agent)。

- 方法：`GET`
- 路径：`/api/agent/tasks`

## 查询参数

| 参数       | 类型   | 必填 | 默认值 | 说明                                                |
| ---------- | ------ | ---- | ------ | --------------------------------------------------- |
| `page`     | number | 否   | 1      | 页码，从 1 开始。                                   |
| `pageSize` | number | 否   | 20     | 每页条数，最大 100。                                |
| `status`   | string | 否   | -      | 可选值：`created`、`running`、`finished`、`error`。 |

## 示例请求

```bash
curl "https://api.dajiaoai.com/api/agent/tasks?page=1&pageSize=20&status=finished" \
  -H "Authorization: Bearer djo_xxx"
```

## 成功响应

```json
{
  "success": true,
  "items": [
    {
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
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "hasMore": false
}
```


状态含义、轮询建议和产物说明见[任务详情](/api/agent-detail)。
