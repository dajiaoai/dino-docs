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
    "status": "finished",
    "artifactUrl": "https://dl.easeplay.vip/dajiao-open/dev/mcp/.../result.algeo",
    "extra": {
      "output": "The triangle has been generated. Download the project to view it."
    },
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

In the detail response, status is at `task.status` and final text is at `task.extra.output`.

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

## Polling guidance

- Poll task detail every 2 seconds for the first 30 seconds
- After 30 seconds, poll every 5 seconds
- Stop polling when status becomes `incomplete`, `finished`, or `error`

## Artifact

When the task reaches `incomplete` or `finished`, `artifactUrl` points to a Dino Geometry project file (`.algeo`).

