---
title: 渲染接口
description: 描述大角几何开放平台 HTTP 渲染接口，支持 PNG、SVG 和 TikZ 导出。
---

# 渲染接口

本文档描述大角几何开放平台 HTTP 渲染接口。接口接收一个 `FileContentLatest` 项目内容，渲染指定画板并在上传成功后返回导出文件地址与元数据。

## 概览

- 方法：`POST`
- Content-Type：`application/json`
- 鉴权方式：详见 [鉴权说明](/api/auth)

当前提供以下三个接口：

| 路径               | 格式 | 说明                                 |
| ------------------ | ---- | ------------------------------------ |
| `/api/render`      | PNG  | 保留原有接口，返回 PNG 文件元数据。  |
| `/api/render-svg`  | SVG  | 新增接口，返回 SVG 文件元数据。      |
| `/api/render-tikz` | TikZ | 新增接口，返回 TikZ/TeX 文件元数据。 |

## 请求头

除 `Authorization` 外，可选传入：

- `x-request-id`：业务请求标识。服务会把它用于额度扣费记录和日志关联；未传时服务会自动生成 UUID。

## 请求体

三个接口都接收 JSON 请求体。公共字段如下：

| 字段              | 类型                | 必填 | 说明                                                    |
| ----------------- | ------------------- | ---- | ------------------------------------------------------- |
| `content`         | `FileContentLatest` | 是   | 要渲染的项目内容，且 `metadata.version` 必须为 `"10"`。 |
| `slideIndex`      | `number`            | 否   | 要渲染的画板序号，从 `1` 开始计数。                     |
| `size.width`      | `number`            | 否   | 逻辑画布宽度，正整数，默认 `1024`。                     |
| `size.height`     | `number`            | 否   | 逻辑画布高度，正整数，默认 `1024`。                     |
| `camera.offset.x` | `number`            | 否   | 覆盖渲染相机中心点 `x`。                                |
| `camera.offset.y` | `number`            | 否   | 覆盖渲染相机中心点 `y`。                                |
| `camera.scale`    | `number`            | 否   | 覆盖渲染相机缩放比例。                                  |

其中：

- `/api/render` 额外支持 `pixelRatio`，默认 `1`
- `/api/render-svg` 和 `/api/render-tikz` 不接收 `pixelRatio`

### content 的最小合法骨架

`content` 必须满足 `FileContentLatest` 的最小结构：

```json
{
  "metadata": {
    "version": "10"
  },
  "messages": [],
  "slides": [
    {
      "definitions": [],
      "uvarMap": [],
      "styleSheet": {},
      "doc": []
    }
  ]
}
```

说明：

- `slides` 不能为空，否则即使通过结构校验，渲染时也会失败。
- 实际项目里通常应直接传入主站或 SDK 导出的完整 `FileContentLatest`，不要手写简化版业务数据。

### 默认值与限制

- 默认 `size` 为 `1024 x 1024`
- `/api/render` 默认 `pixelRatio` 为 `1`
- 实际物理尺寸按以下公式计算：

```text
physicalWidth = round(width * pixelRatio)
physicalHeight = round(height * pixelRatio)
```

- `/api/render` 当前限制为：`width * pixelRatio <= 2048` 且 `height * pixelRatio <= 2048`
- `slideIndex` 按 `1` 开始计数
- 当前三个 HTTP API 在省略 `slideIndex` 时，都会回退到第 `1` 个画板

> 虽然共享 schema 注释写的是“省略时导出当前画板”，但当前 HTTP 接口没有传入“当前画板”上下文，因此实际行为都是导出第一个画板。

## PNG 请求示例

```bash
curl -X POST http://127.0.0.1:3000/api/render \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": {
      "width": 768,
      "height": 768
    },
    "pixelRatio": 2,
    "camera": {
      "offset": {
        "x": 0,
        "y": 0
      },
      "scale": 1
    },
    "content": {
      "metadata": {
        "version": "10"
      },
      "messages": [],
      "slides": [
        {
          "definitions": [],
          "uvarMap": [],
          "styleSheet": {},
          "doc": []
        }
      ]
    }
  }'
```

## SVG 请求示例

```bash
curl -X POST http://127.0.0.1:3000/api/render-svg \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-svg-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": {
      "width": 768,
      "height": 768
    },
    "camera": {
      "offset": {
        "x": 0,
        "y": 0
      },
      "scale": 1
    },
    "content": {
      "metadata": {
        "version": "10"
      },
      "messages": [],
      "slides": [
        {
          "definitions": [],
          "uvarMap": [],
          "styleSheet": {},
          "doc": []
        }
      ]
    }
  }'
```

## TikZ 请求示例

```bash
curl -X POST http://127.0.0.1:3000/api/render-tikz \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-tikz-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": {
      "width": 768,
      "height": 768
    },
    "camera": {
      "offset": {
        "x": 0,
        "y": 0
      },
      "scale": 1
    },
    "content": {
      "metadata": {
        "version": "10"
      },
      "messages": [],
      "slides": [
        {
          "definitions": [],
          "uvarMap": [],
          "styleSheet": {},
          "doc": []
        }
      ]
    }
  }'
```

## 成功响应

### PNG

成功时返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "pixelRatio": 2,
  "physicalWidth": 1536,
  "physicalHeight": 1536,
  "mimeType": "image/png",
  "size": 24831
}
```

字段说明：

| 字段             | 说明                              |
| ---------------- | --------------------------------- |
| `url`            | 上传完成后的公开访问地址。        |
| `filename`       | OSS 对象文件名。                  |
| `objectKey`      | OSS 对象完整 key。                |
| `slideIndex`     | 实际渲染的画板序号，从 `1` 开始。 |
| `width`          | 请求中的逻辑宽度。                |
| `height`         | 请求中的逻辑高度。                |
| `pixelRatio`     | 请求中的像素倍率。                |
| `physicalWidth`  | 实际输出像素宽度。                |
| `physicalHeight` | 实际输出像素高度。                |
| `mimeType`       | 当前固定为 `image/png`。          |
| `size`           | PNG Buffer 字节数。               |

### SVG

成功时返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "filename": "4fa2bc.svg",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "mimeType": "image/svg+xml",
  "size": 18234
}
```

### TikZ

成功时返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "filename": "4fa2bc.tex",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "mimeType": "text/plain",
  "size": 9631
}
```

## 失败响应

### 400 Bad Request

以下情况会返回 `400`：

- 请求体不是合法 JSON
- 参数类型不符合 schema
- `content` 不是合法 `FileContentLatest`

示例：

```json
{
  "success": false,
  "error": "content must be FileContentLatest and metadata.version must be \"10\"."
}
```

### 401 Unauthorized

Bearer 鉴权失败时返回 `401`：

```json
{
  "success": false,
  "error": "Missing Authorization header. Use Authorization: Bearer djo_xxx."
}
```

## 额度说明

三个接口在执行前都会先扣减一次导出额度：

- `/api/render` 对应 `export_image`
- `/api/render-svg` 对应 `export_svg`
- `/api/render-tikz` 对应 `export_tikz`

默认扣费均为：`100` credits / 次

补充说明：

- `export_svg` 与 `export_tikz` 当前默认价格与 `export_image` 一致
- SVG 导出在服务端仍依赖 `node-canvas` 的 2D context 做文本测量
- TikZ 导出文件当前使用 `.tex` 后缀，返回 `mimeType: text/plain`
