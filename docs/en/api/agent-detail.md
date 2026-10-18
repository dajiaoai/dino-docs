---
title: Task Detail
description: Retrieve task status and download the generated project.
---

# Task Detail

**Base URL:** `https://api.dajiaoai.com`

See [Authentication](/en/api/auth) and [Overview](/en/api/agent) before calling this endpoint.

- Method: `GET`
- Path: `/api/agent/tasks/:taskId`

## Example request

```bash
curl https://api.dajiaoai.com/api/agent/tasks/6844db73f1d0c0e74f5e9d01 \
  -H "Authorization: Bearer djo_xxx"
```

## Success response

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

## Error response

| Status | Cause |
| --- | --- |
| `404` | Task not found or not within the current API key scope |

## Status definitions

- `created`: task is stored and waiting for a worker
- `running`: worker has started processing
- `finished`: task completed, `artifactUrl` is available
- `error`: task failed

## Polling guidance

- Poll task detail every 2 seconds for the first 30 seconds
- After 30 seconds, poll every 5 seconds
- Stop polling when status becomes `finished` or `error`

## Artifact

When the task completes, `artifactUrl` points to a Dino Geometry project file (`.algeo`).

