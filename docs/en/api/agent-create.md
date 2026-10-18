---
title: Create a Task
description: Create an asynchronous image generation task with text, reference images, and an optional style template.
---

# Create a Task

**Base URL:** `https://api.dajiaoai.com`

See [Authentication](/en/api/auth) and [Overview](/en/api/agent) before calling this endpoint.

- Method: `POST`
- Path: `/api/agent/run`
- Content-Type: `multipart/form-data`

## Request fields

| Field     | Type   | Required | Description                                                                        |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| `model`   | string | yes      | Model alias used by the agent. See [Models](/en/api/models). |
| `content` | string | no       | User task description for drawing.                                                 |
| `template` | string | no | Style template data. Pass the template JSON string. You can download template data from the [Dino Geometry templates](https://dajiaoai.com/master-templates) page. |
| `images`  | file[] | no       | Image field. Use multiple `images` entries to upload up to 10 files.               |

Notes: `model` is required. At least one of `content` or images is required. If only images are provided without `content`, a default prompt is applied automatically.

## Example requests

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=Draw an equilateral triangle with side length 4 and add a draggable vertex A." \
  -F "template=<./template.json"
```

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=Draw the geometric figure that combines the elements from these reference images." \
  -F "images=@./example-1.png;type=image/png" \
  -F "images=@./example-2.png;type=image/png"
```

## Success response

```json
{
  "success": true,
  "taskId": "6844db73f1d0c0e74f5e9d01",
  "status": "created",
  "createdAt": "2026-06-08T10:00:00.000Z"
}
```

## Error responses

| Status | Cause |
| --- | --- |
| `400` | Invalid parameters |
| `402` | Insufficient credits |


Use the returned `taskId` to poll [Task Detail](/en/api/agent-detail) until the task finishes or fails.
