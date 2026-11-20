---
title: SDK 鉴权说明
description: 了解 SDK 2.x 的本地使用规则、应用注册和域名白名单校验。
---

# SDK 鉴权说明

SDK 2.x 根据浏览器打开的宿主页面和 `auth.appId` 决定如何鉴权。

| 宿主页面 | 省略 `auth.appId` | 填写 `auth.appId` |
| --- | --- | --- |
| 本地 HTML 文件（`file://`） | 可直接使用 | 请改用本地 HTTP 服务联调域名白名单 |
| 本地服务（`localhost`、`127.0.0.1`） | 可直接使用 | 校验应用和宿主主机名 |
| 公网或局域网地址 | 必须填写 `auth.appId`，不可省略 | 校验应用和宿主主机名 |

## 注册和本地联调

1. 在[开放平台控制台](https://open.dajiaoai.com/console)创建应用，复制应用 ID。
2. 将浏览器实际访问的宿主主机名添加到该应用的域名白名单。本地开发可添加 `localhost`，再用 `http://localhost:5173` 打开页面。白名单校验使用主机名，端口和路径不参与匹配。
3. 在调用 `createEditor` 或 `createPresentation` 时传入 `auth: { appId: 'YOUR_APP_ID' }`，等待初始化完成。配置不匹配时，初始化会返回错误。
4. 发布前，将生产环境的主机名也加入应用白名单，并通过部署地址验证。Agent 的公网或局域网预览地址同样按浏览器实际打开的主机名校验。

![开放平台应用注册与域名白名单配置示例](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/29617452-screenshot-20261120-145115.png)

## 排查鉴权失败

- 缺少 `appId` 时，检查宿主地址，并确认 `auth.appId` 已传给正确的模式。通过统一的 `create` 入口时，将 `auth` 放在 `editor` 或 `presentation` 配置里。
- 白名单未命中时，核对 `appId` 对应的应用和浏览器地址栏中的主机名。`localhost` 和 `127.0.0.1` 需要分别匹配。
- 使用 `file://` 时，如果要验证应用授权，请用本地 HTTP 服务打开页面后重试。
