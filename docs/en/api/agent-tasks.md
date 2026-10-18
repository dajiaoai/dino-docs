---
title: Task List
description: Query image generation tasks with pagination and status filters.
---

# Task List

**Base URL:** `https://api.dajiaoai.com`

See [Authentication](/en/api/auth) and [Overview](/en/api/agent) before calling this endpoint.

- Method: `GET`
- Path: `/api/agent/tasks`

## Query parameters

| Parameter  | Type   | Required | Default | Description                                          |
| ---------- | ------ | -------- | ------- | ---------------------------------------------------- |
| `page`     | number | no       | 1       | Page number, starting from 1.                        |
| `pageSize` | number | no       | 20      | Items per page, maximum 100.                         |
| `status`   | string | no       | -       | Optional: `created`, `running`, `finished`, `error`. |

## Example request

```bash
curl "https://api.dajiaoai.com/api/agent/tasks?page=1&pageSize=20&status=finished" \
  -H "Authorization: Bearer djo_xxx"
```

## Success response

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
      "content": "Draw a triangle.",
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


See [Task Detail](/en/api/agent-detail) for status definitions, polling guidance, and artifact details.
