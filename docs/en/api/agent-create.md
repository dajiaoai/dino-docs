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
| `content` | string | no       | A clear, complete problem statement and drawing requirements. Include any solution or solution steps if available.                                                 |
| `template` | string | no | Style template data. Pass the template JSON string. You can download template data from the [Dino Geometry templates](https://dajiaoai.com/master-templates) page. |
| `images`  | file[] | no       | Include the original problem diagram and any solution images if available. Use multiple `images` entries to upload up to 10 files.               |

Notes: `model` is required. At least one of `content` or images is required. If only images are provided without `content`, a default prompt is applied automatically.

## Model selection and input guidance

`dinogeo-1` is suited to basic diagram drawing and drawing from a provided solution or explanation. Use `dinogeo-1-pro` when the model needs to solve the problem, perform calculations, or carry out other complex reasoning before drawing.

Provide a clear, complete problem statement, including the given conditions, what needs to be found, and the drawing requirements. Include the original diagram if available, and any solution, explanation, or solution steps to help the model understand the problem and geometric relationships.

See [Models](/en/api/models) for details.

## Example requests

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1" \
  -F "content=Draw equilateral triangle ABC with side length 4. Label the vertices and side lengths." \
  -F "template=<./template.json"
```

```bash
curl -X POST https://api.dajiaoai.com/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1" \
  -F "content=Problem: In triangle ABC, AB=AC=5 and BC=6. Find altitude AD to BC. Solution: D is the midpoint of BC, so BD=3 and AD=4 by the Pythagorean theorem. Draw from the original diagram and solution, labeling D, the right angle, and segment lengths." \
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
