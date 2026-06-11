---
title: 智能生图接口
description: 描述大角几何开放平台智能生图接口，支持异步任务创建、列表查询和详情查询。
---

# 智能生图接口

本文档描述大角几何开放平台 Agent 任务接口。

智能生图接口采用异步模式：提交请求后立即返回 `taskId`，生成完成后通过任务详情接口获取结果。

## 接口概览

| 说明 | 路径 | 方法 |
| --- | --- | --- |
| 创建任务 | `/api/agent/run` | `POST` |
| 任务列表 | `/api/agent/tasks` | `GET` |
| 任务详情 | `/api/agent/tasks/:taskId` | `GET` |

鉴权方式见[鉴权说明](/api/auth)，计费规则见[定价说明](/api/pricing)。

## 1. 创建任务 `POST /api/agent/run`

- 方法：`POST`
- 路径：`/api/agent/run`
- Content-Type：`multipart/form-data`

### 请求字段

| 字段      | 类型   | 必填 | 说明                                                                              |
| --------- | ------ | ---- | --------------------------------------------------------------------------------- |
| `model`   | string | 是   | agent 使用的模型别名，详见[模型说明](/api/models)。 |
| `content` | string | 否   | 用户要执行的绘图任务描述。                                                        |
| `images`  | file[] | 否   | 图片字段，字段名固定为 `images`，最多 10 张；通过重复传多个 `images` 表单项上传。 |

说明：`model` 为必填字段。`content` 与图片至少需要提供一个。若只传图片而不传 `content`，服务会自动补默认提示。

### 示例请求

```bash
curl -X POST http://127.0.0.1:3000/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=请画一个边长为 4 的正三角形，并给出一个可拖拽的顶点 A。"
```

```bash
curl -X POST http://127.0.0.1:3000/api/agent/run \
  -H "Authorization: Bearer djo_xxx" \
  -F "model=dinogeo-1-pro" \
  -F "content=请综合这些参考图绘制对应的几何图形。" \
  -F "images=@./example-1.png;type=image/png" \
  -F "images=@./example-2.png;type=image/png"
```

### 成功响应

```json
{
  "success": true,
  "taskId": "6844db73f1d0c0e74f5e9d01",
  "status": "created",
  "createdAt": "2026-06-08T10:00:00.000Z"
}
```

### 失败响应

| 状态码 | 原因 |
| --- | --- |
| `400` | 参数不通过 |
| `402` | 积分不足 |

## 2. 任务列表 `GET /api/agent/tasks`

- 方法：`GET`
- 路径：`/api/agent/tasks`

### 查询参数

| 参数       | 类型   | 必填 | 默认值 | 说明                                                |
| ---------- | ------ | ---- | ------ | --------------------------------------------------- |
| `page`     | number | 否   | 1      | 页码，从 1 开始。                                   |
| `pageSize` | number | 否   | 20     | 每页条数，最大 100。                                |
| `status`   | string | 否   | -      | 可选值：`created`、`running`、`finished`、`error`。 |

### 示例请求

```bash
curl "http://127.0.0.1:3000/api/agent/tasks?page=1&pageSize=20&status=finished" \
  -H "Authorization: Bearer djo_xxx"
```

### 成功响应

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

## 3. 任务详情 `GET /api/agent/tasks/:taskId`

- 方法：`GET`
- 路径：`/api/agent/tasks/:taskId`

### 示例请求

```bash
curl http://127.0.0.1:3000/api/agent/tasks/6844db73f1d0c0e74f5e9d01 \
  -H "Authorization: Bearer djo_xxx"
```

### 成功响应

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

### 错误响应

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

## 计费说明

- 计费类型：agent
- 单次费用：按模型别名区分，详见[定价说明](/api/pricing)
- 扣费时机：任务成功执行后扣费

## 典型调用流程

1. 调用 `POST /api/agent/run` 创建任务。
2. 获取 `taskId`。
3. 轮询 `GET /api/agent/tasks/:taskId` 直到状态变为 `finished` 或 `error`。
4. `finished` 时读取 `artifactUrl` 下载产物。
