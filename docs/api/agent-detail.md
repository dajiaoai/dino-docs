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
    "status": "finished",
    "artifactUrl": "https://dl.easeplay.vip/dajiao-open/dev/mcp/.../result.algeo",
    "extra": {
      "output": "已生成三角形，请下载工程文件查看。"
    },
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

详情响应中 `task.status` 的含义如下；输出文本位于 `task.extra.output`。

| `status` | 含义 | 是否终态 |
| --- | --- | --- |
| `created` | 任务已创建，等待 worker 领取。 | 否 |
| `running` | worker 已开始执行，正在生成。 | 否 |
| `incomplete` | 判定需求不清晰，AI 无法绘图，具体理由见 `extra.output` 字段。 | 是 |
| `finished` | 画图成功。 | 是 |
| `error` | 任务执行失败，按原有失败及退款规则处理。 | 是 |

轮询时遇到 `incomplete`、`finished` 或 `error` 均应停止。历史终态任务不会重新分类。

## 输出字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | string | 任务状态，取值及含义见上表。 |
| `artifactUrl` | string \| null | 生成的 `.algeo` 工程文件地址；无产物时为 `null`。`incomplete` 也会保留产物。 |
| `extra` | object \| null | 任务附加信息，可能为 `null`。 |
| `extra.output` | string（可选） | Agent 返回的最终文本，可用于展示生成结果说明；该字段不是工程文件内容，也不位于任务对象顶层。 |

`extra.output` 为可选字段，读取时需兼容 `extra` 为 `null` 或缺少 `output` 的情况。

如需定位问题，请将 `extra` 内的信息反馈给我们的技术人员，以便排查。

## 轮询建议

- 前 30 秒每 2 秒轮询一次任务详情接口
- 30 秒后降到每 5 秒一次
- 命中 `incomplete`、`finished` 或 `error` 后停止轮询

## 产物说明

任务进入 `incomplete` 或 `finished` 后，`artifactUrl` 指向大角几何工程文件（`.algeo`）。

