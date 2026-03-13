# 大角几何开放平台 - 线上部署说明

本文档面向运维，说明如何构建并部署文档站。

## 环境要求

- Node.js >= 18
- npm

## 构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 构建静态站点
npm run build
```

构建产物输出到 **`docs/.vitepress/dist`** 目录。

## Nginx 配置

将 Nginx 的 `root` 指向构建产物目录：

```nginx
server {
    listen 80;
    server_name open.dajiaoai.com;

    root /path/to/dino-open/docs/.vitepress/dist;   # 替换为实际部署路径
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

> **说明**：VitePress 为 SPA，需配置 `try_files` 以支持前端路由（如 `/guide/getting-started` 直接访问）。

## 部署路径示例

| 场景       | root 路径示例                          |
|------------|----------------------------------------|
| 项目根目录 | `/var/www/dino-open/docs/.vitepress/dist` |
| 仅 dist    | `/var/www/open-docs`（构建后复制 dist 内容到此目录） |

## 验证

部署后访问：

- 首页：`https://open.dajiaoai.com/`
- 文档：`https://open.dajiaoai.com/guide/getting-started`
