---
title: 渲染接口
description: 描述大角几何开放平台 HTTP 渲染接口，支持 PNG、SVG 和 TikZ 导出。
---

# 渲染接口

**Base URL：`https://api.dajiaoai.com`**

接口接收一个符合[大角几何工程文件协议](/sdk/2/protocol)的项目内容，渲染指定画板并返回导出文件地址与元数据。

## 概览

| 说明 | 路径 | 方法 |
| --- | --- | --- |
| 导出 PNG | `/api/render` | `POST` |
| 导出 SVG | `/api/render-svg` | `POST` |
| 导出 TikZ/TeX | `/api/render-tikz` | `POST` |

鉴权方式见[鉴权说明](/api/auth)，计费规则见[API 计费说明](/api/pricing)。

## 请求头

除 `Authorization` 外，可选传入：

- `x-request-id`：业务请求标识，未传时服务自动生成 UUID。

## 请求体

三个接口共用以下 JSON 字段：

| 字段              | 类型                | 必填 | 说明                                                    |
| ----------------- | ------------------- | ---- | ------------------------------------------------------- |
| `content`         | `FileContentLatest` | 是   | 要渲染的项目内容，格式见[大角几何工程文件协议](/sdk/2/protocol)。 |
| `slideIndex`      | `number`            | 否   | 要渲染的画板序号，从 `1` 开始，默认第 `1` 个画板。     |
| `size.width`      | `number`            | 否   | 逻辑画布宽度，正整数，默认 `1024`。                     |
| `size.height`     | `number`            | 否   | 逻辑画布高度，正整数，默认 `1024`。                     |
| `camera.offset.x` | `number`            | 否   | 覆盖渲染相机中心点 `x`。                                |
| `camera.offset.y` | `number`            | 否   | 覆盖渲染相机中心点 `y`。                                |
| `camera.scale`    | `number`            | 否   | 覆盖渲染相机缩放比例。                                  |

`/api/render` 额外支持 `pixelRatio`（默认 `1`），其余两个接口不接收此字段。

### 尺寸限制

`/api/render` 的物理尺寸由以下公式计算，且不得超过 `2048 x 2048`：

```text
physicalWidth  = round(width * pixelRatio)
physicalHeight = round(height * pixelRatio)
```

## 导出 PNG `POST /api/render`

```bash
curl -X POST https://api.dajiaoai.com/api/render \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": { "width": 768, "height": 768 },
    "pixelRatio": 2,
    "camera": { "offset": { "x": 0, "y": 0 }, "scale": 1 },
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [], "uvarMap": [], "styleSheet": {}, "doc": [] }]
    }
  }'
```

成功返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
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

## 导出 SVG `POST /api/render-svg`

```bash
curl -X POST https://api.dajiaoai.com/api/render-svg \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-svg-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": { "width": 768, "height": 768 },
    "camera": { "offset": { "x": 0, "y": 0 }, "scale": 1 },
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [], "uvarMap": [], "styleSheet": {}, "doc": [] }]
    }
  }'
```

成功返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "filename": "4fa2bc.svg",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "mimeType": "image/svg+xml",
  "size": 18234
}
```

## 导出 TikZ `POST /api/render-tikz`

```bash
curl -X POST https://api.dajiaoai.com/api/render-tikz \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-tikz-demo-001" \
  -d '{
    "slideIndex": 1,
    "size": { "width": 768, "height": 768 },
    "camera": { "offset": { "x": 0, "y": 0 }, "scale": 1 },
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [], "uvarMap": [], "styleSheet": {}, "doc": [] }]
    }
  }'
```

成功返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "filename": "4fa2bc.tex",
  "slideIndex": 1,
  "width": 768,
  "height": 768,
  "mimeType": "text/plain",
  "size": 9631
}
```

## 失败响应

| 状态码 | 原因 |
| --- | --- |
| `400` | 参数不通过，或 `content` 不符合[大角几何工程文件协议](/sdk/2/protocol) |
| `401` | API Key 无效 |

## 计费说明

- 计费类型：render
- 单次费用：详见[API 计费说明](/api/pricing)
- 扣费规则：成功执行后扣费
