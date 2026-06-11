---
title: 鉴权说明
description: 描述大角几何开放平台 API 的鉴权方式和常见错误处理。
---

# 鉴权说明

大角几何开放平台 API 使用 Bearer API Key 进行鉴权。

## 获取 API Key

1. 进入[控制台](https://open.dajiaoai.com/console/dashboard)
2. 创建一个应用
3. 进入应用详情页，创建 API Key

![创建 API Key](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/d5c3f461-20260611-180315.jpg)

## 使用方式

在每次请求头中带上：

```http
Authorization: Bearer djo_xxx
```

## 常见错误

| 状态码 | 原因 |
| --- | --- |
| `401` | API Key 无效 |
