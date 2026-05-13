# DinoDocs 开放平台

DinoDocs 是一个开放的数学几何平台，旨在为开发者和教育工作者提供强大的工具和文档支持。

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 目录

- [项目简介](#项目简介)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [部署指南](#部署指南)
  - [使用 Nginx](#使用-nginx)
- [贡献指南](#贡献指南)
- [开源许可证](#开源许可证)

---

## 项目简介

DinoDocs 提供了一个现代化的几何计算平台，支持在线部署和多语言文档，帮助用户快速上手并应用于实际场景。

> **✨ 特性亮点：**
>
> - 支持多语言文档
> - 易于部署和扩展
> - 丰富的几何计算工具

---

## 环境要求

- Node.js >= 18
- npm

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 构建静态站点
npm run build
```

构建产物输出到 **`docs/.vitepress/dist`** 目录。

---

## 部署指南

### 使用 Nginx

将 Nginx 的 `root` 指向构建产物目录：

```nginx
server {
    listen 80;
    server_name open.dajiaoai.com;

    root /path/to/dino-docs/docs/.vitepress/dist;   # 替换为实际部署路径
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
    }
}
```

---

## 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
