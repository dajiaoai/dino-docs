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
| `status`   | string | no       | -       | Optional: `created`, `running`, `incomplete`, `finished`, `error`. |

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
      "appId": "your_app_id",
      "type": "agent",
      "content": "Draw a triangle.",
      "status": "finished",
      "artifactUrl": "https://dl.easeplay.vip/dajiao-open/dev/mcp/.../result.algeo",
      "extra": {
        "output": "The triangle has been generated. Download the project to view it."
      },
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

## Status definitions

Each task's `status` in the list response has the same meaning as in the task detail response.

| `status` | Meaning | Terminal |
| --- | --- | --- |
| `created` | Task created and waiting for a worker. | No |
| `running` | A worker has started processing the task. | No |
| `incomplete` | The requirements are considered unclear, so the AI cannot draw. See `extra.output` for the specific reason. | Yes |
| `finished` | Drawing succeeded. | Yes |
| `error` | Task execution failed; existing failure and refund rules apply. | Yes |

Stop polling on `incomplete`, `finished`, or `error`. Historical terminal tasks are not reclassified.

## Output fields

| Field | Type | Description |
| --- | --- | --- |
| `status` | string | Task status as defined above. |
| `artifactUrl` | string \| null | URL of the generated `.algeo` project file, or `null` when no artifact is available. Artifacts are retained for `incomplete` tasks too. |
| `extra` | object \| null | Additional task information; may be `null`. |
| `extra.output` | string (optional) | Final text returned by the Agent, for displaying a description of the result. This is separate from the project file and is nested inside `extra`. |

When reading `extra.output`, handle both a null `extra` and an absent `output` field.

If you need help troubleshooting an issue, provide the information in `extra` to our technical team for investigation.

See [Task Detail](/en/api/agent-detail) for status definitions, polling guidance, and artifact details.
