---
title: Intelligent Image Generation Service
description: Describe Dino Geometry open platform intelligent image generation API, including task creation, listing, and details.
---

# Intelligent Image Generation Service

**Base URL: `https://api.dajiaoai.com`**

This document describes the Agent task API provided by the Dino Geometry Open Platform.

The Intelligent Image Generation API works asynchronously: the creation request returns a `taskId` immediately, and you poll the task detail endpoint to retrieve the result once generation is complete.

## Overview

| Description | Path | Method |
| --- | --- | --- |
| Create a task | `/api/agent/run` | `POST` |
| List tasks | `/api/agent/tasks` | `GET` |
| Task detail | `/api/agent/tasks/:taskId` | `GET` |

See [Authentication](/en/api/auth) for auth and [API Billing](/en/api/pricing) for billing.

## 1. Create a task `POST /api/agent/run`

- Method: `POST`
- Path: `/api/agent/run`
- Content-Type: `multipart/form-data`

### Request fields

| Field     | Type   | Required | Description                                                                        |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| `model`   | string | yes      | Model alias used by the agent. See [Models](/en/api/models). |
| `content` | string | no       | User task description for drawing.                                                 |
| `images`  | file[] | no       | Image field. Use multiple `images` entries to upload up to 10 files.               |

Notes: `model` is required. At least one of `content` or images is required. If only images are provided without `content`, a default prompt is applied automatically.

### Example requests

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=Draw an equilateral triangle with side length 4 and add a draggable vertex A."
```

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=Draw the geometric figure that combines the elements from these reference images." \
  -F "images=@./example-1.png;type=image/png" \
  -F "images=@./example-2.png;type=image/png"
```

### Success response

```json
{
  "success": true,
  "taskId": "6844db73f1d0c0e74f5e9d01",
  "status": "created",
  "createdAt": "2026-06-08T10:00:00.000Z"
}
```

### Error responses

| Status | Cause |
| --- | --- |
| `400` | Invalid parameters |
| `402` | Insufficient credits |

## 2. Task list `GET /api/agent/tasks`

- Method: `GET`
- Path: `/api/agent/tasks`

### Query parameters

| Parameter  | Type   | Required | Default | Description                                          |
| ---------- | ------ | -------- | ------- | ---------------------------------------------------- |
| `page`     | number | no       | 1       | Page number, starting from 1.                        |
| `pageSize` | number | no       | 20      | Items per page, maximum 100.                         |
| `status`   | string | no       | -       | Optional: `created`, `running`, `finished`, `error`. |

### Example request

```bash
curl "https://api.dajiaoai.com/api/agent/tasks?page=1&pageSize=20&status=finished" \
  -H "Authorization: Bearer djo_xxx"
```

### Success response

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

## 3. Task detail `GET /api/agent/tasks/:taskId`

- Method: `GET`
- Path: `/api/agent/tasks/:taskId`

### Example request

```bash
curl https://api.dajiaoai.com/api/agent/tasks/6844db73f1d0c0e74f5e9d01 \
  -H "Authorization: Bearer djo_xxx"
```

### Success response

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

### Error response

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

## Billing

- Billing type: agent
- Cost per call: varies by model — see [API Billing](/en/api/pricing)
- Deducted on successful execution

## Typical call flow

1. Call `POST /api/agent/run` to create a task.
2. Receive the `taskId`.
3. Poll `GET /api/agent/tasks/:taskId` until the status is `finished` or `error`.
4. When `finished`, download the result from `artifactUrl`.
