---
title: 智能生图服务概览
description: 描述大角几何开放平台智能生图接口，支持异步任务创建、列表查询和详情查询。
---

# 智能生图服务概览

**Base URL：** `https://api.dajiaoai.com`

本文档描述大角几何开放平台 Agent 任务接口。

智能生图接口采用异步模式：提交请求后立即返回 `taskId`，生成完成后通过任务详情接口获取结果。

## 接口概览

| 说明 | 路径 | 方法 |
| --- | --- | --- |
| [创建任务](/api/agent-create) | `/api/agent/run` | `POST` |
| [任务列表](/api/agent-tasks) | `/api/agent/tasks` | `GET` |
| [任务详情](/api/agent-detail) | `/api/agent/tasks/:taskId` | `GET` |

鉴权方式见[鉴权说明](/api/auth)，计费规则见[API 计费说明](/api/pricing)。

## 计费说明

- 计费类型：agent
- 单次费用：按模型别名区分，详见[API 计费说明](/api/pricing)
- 扣费时机：任务成功执行后扣费

## 典型调用流程

1. 调用 [`POST /api/agent/run`](/api/agent-create) 创建任务。
2. 获取 `taskId`。
3. 轮询 [`GET /api/agent/tasks/:taskId`](/api/agent-detail) 直到状态变为 `finished` 或 `error`。
4. `finished` 时读取 `artifactUrl` 下载产物。
