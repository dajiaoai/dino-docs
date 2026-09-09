---
title: 渲染接口
description: 描述大角几何开放平台 HTTP 渲染接口，支持 PNG、SVG 和 TikZ 导出。
---

# 渲染接口

**Base URL：`https://api.dajiaoai.com`**

接口接收一个符合[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)的项目内容，渲染指定画板并返回导出文件地址与元数据。

::: info 尺寸单位
`viewBound` 使用画板逻辑坐标，`scale` 表示每个逻辑单位对应的像素数，返回结果中的 `width` 和 `height` 表示图片像素尺寸。工程内字号、线宽等视觉尺寸使用 px；如果你手头的规范使用 pt，请查看[尺寸单位与换算](/reference/units)。
:::

## 概览

| 说明 | 路径 | 方法 | 支持 |
| --- | --- | --- | --- |
| 导出 PNG | `/api/render/v2` | `POST` | 2D、3D |
| 导出 SVG | `/api/render-svg` | `POST` | 2D |
| 导出 TikZ/TeX | `/api/render-tikz` | `POST` | 2D |

::: warning 推荐使用新版 PNG 接口
PNG 导出推荐使用 `POST /api/render/v2`。已有 `/api/render` 接入可查看[旧版接口与迁移说明](./api-render)。
:::

鉴权方式见[鉴权说明](/api/auth)，计费规则见[API 计费说明](/api/pricing)。

## 导出 PNG `POST /api/render/v2` {#render-v2}

推荐使用此接口导出 PNG，支持 2D 与 3D 画板。

### 请求头

| 请求头 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | `string` | 是 | Bearer API Key，格式为 `Bearer <API_KEY>`，无默认值。 |
| `Content-Type` | `string` | 是 | 固定为 `application/json`。 |
| `x-request-id` | `string` | 否 | 业务请求标识，省略时服务自动生成 UUID。 |

### 请求体

`view2D` 与 `view3D` 互斥，二者都省略时使用目标画板保存的相机模式和参数。类型定义中的 `?` 表示对象属性可选，数值均需为有限数值。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | 是 | 要渲染的完整项目内容，无默认值，格式见[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)。 |
| `slideIndex` | `number` | 否 | 目标画板序号，为从 `1` 开始的正整数，默认 `1`。 |
| `template` | `object` | 否 | 渲染母版，省略时沿用目标画板现有样式。可在[大角几何母版](https://dajiaoai.com/master-templates)页面下载母版数据。 |
| `view2D` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`  scale?: number;`<br>`  pixelRatio?: number;`<br>`}` | 否 | 指定 2D 视口。`left`、`right`、`bottom`、`top` 为逻辑坐标边界，传入对象时均必填、无默认值，要求 `left < right` 且 `bottom < top`。<br>`scale` 为每逻辑单位对应的像素数，必须为正数，默认沿用目标画板相机缩放比例。<br>`pixelRatio` 为可选的正数输出设备像素比，默认 `1`，按比例放大 PNG 物理像素尺寸，不改变逻辑视口或相机缩放比例。 |
| `view3D` | `{`<br>`  offset?: [number, number, number];`<br>`  yaw?: number;`<br>`  pitch?: number;`<br>`  projection?: "orthographic" \| "perspective" \| "oblique";`<br>`  obliqueAngle?: number;`<br>`  obliqueScaleRatio?: number;`<br>`  scale?: number;`<br>`  width?: number;`<br>`  height?: number;`<br>`  pixelRatio?: number;`<br>`}` | 否 | 强制使用 3D 渲染，并覆盖目标画板的三维相机参数；对象内所有属性均可选。<br>`offset`：相机中心；`yaw` / `pitch`：水平 / 俯仰观察角，单位为弧度；`projection`：投影模式；`obliqueAngle`：斜投影方向角，单位为弧度；`obliqueScaleRatio`：非负的斜投影退行轴缩放比例；`scale`：正的相机缩放比例。以上属性默认沿用目标画板保存的三维相机值。<br>`width` / `height`：正整数逻辑输出宽高，分别默认 `1024`。<br>`pixelRatio`：正的输出设备像素比，默认 `1`，逻辑宽高乘以该值得到 PNG 物理像素尺寸。 |

### 请求示例

将主站或 SDK 导出的完整项目保存为 `project.algeo`，以下示例使用 `jq` 将项目包装为 `content`。3D 示例要求第 `1` 个画板为 3D 画板。

使用画板保存的相机自动选择渲染模式：

```bash
jq '{content: ., slideIndex: 1}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

指定 2D 视图：

```bash
jq '{content: ., slideIndex: 1, view2D: {left: -10, right: 10, bottom: -10, top: 10, scale: 50, pixelRatio: 1}}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

指定 3D 视图：

```bash
jq '{content: ., slideIndex: 1, view3D: {width: 1280, height: 720, pixelRatio: 1, projection: "orthographic", yaw: 0.7853981633974483, pitch: 0.7853981633974483}}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

### 成功响应

2D 渲染成功返回 `200 OK`。以上文指定 2D 视图的请求为例：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "slideIndex": 1,
  "viewBound": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10
  },
  "width": 1000,
  "height": 1000,
  "scale": 50,
  "mimeType": "image/png",
  "size": 24831
}
```

3D 渲染成功同样返回 `200 OK`，使用实际 `camera` 参数和 `pixelRatio`，替代 2D 响应中的 `viewBound` 与 `scale`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "filename": "4fa2bc.png",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.png",
  "slideIndex": 1,
  "width": 1280,
  "height": 720,
  "pixelRatio": 1,
  "camera": {
    "offset": [0, 0, 0],
    "yaw": 0.7853981633974483,
    "pitch": 0.7853981633974483,
    "projection": "orthographic",
    "obliqueAngle": 0.7853981633974483,
    "obliqueScaleRatio": 0.5,
    "scale": 0.1
  },
  "mimeType": "image/png",
  "size": 24831
}
```

响应中的 `width`、`height` 是最终 PNG 的物理像素尺寸；请求中的 `view3D.width`、`view3D.height` 是逻辑输出尺寸，乘以 `view3D.pixelRatio` 得到物理输出尺寸。

## 导出 SVG `POST /api/render-svg`

导出 2D SVG，不接收 `pixelRatio`。

### 请求头

| 请求头 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | `string` | 是 | Bearer API Key，格式为 `Bearer <API_KEY>`，无默认值。 |
| `Content-Type` | `string` | 是 | 固定为 `application/json`。 |
| `x-request-id` | `string` | 否 | 业务请求标识，省略时服务自动生成 UUID。 |

### 请求体

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | 是 | 要渲染的完整项目内容，无默认值，格式见[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)。 |
| `slideIndex` | `number` | 否 | 目标画板序号，为从 `1` 开始的正整数，默认 `1`。 |
| `template` | `object` | 否 | 渲染母版，省略时沿用目标画板现有样式。可在[大角几何母版](https://dajiaoai.com/master-templates)页面下载母版数据。 |
| `viewBound` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`}` | 否 | 逻辑视口边界，传入对象时四个属性均必填，且需为有限数值；要求 `left < right` 且 `bottom < top`。省略时使用目标画板保存的相机视口。 |
| `scale` | `number` | 否 | 相机缩放比例（每逻辑单位对应的像素数），正数。省略时使用目标画板当前 `camera.scale`。 |

### 请求示例

```bash
curl -X POST https://api.dajiaoai.com/api/render-svg \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-svg-demo-001" \
  -d '{
    "slideIndex": 1,
    "viewBound": {
      "left": -10,
      "right": 10,
      "bottom": -10,
      "top": 10
    },
    "scale": 50,
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [{ "kind": "primitive", "id": "A", "source": "Point(0, ?)", "label": "{{id}}" }, { "kind": "primitive", "id": "B", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "C", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "a", "source": "Segment(A, B)" }, { "kind": "primitive", "id": "b", "source": "Segment(B, C)" }, { "kind": "primitive", "id": "c", "source": "Segment(C, A)" }], "uvarMap": [["A.0", 3], ["B.0", -3], ["C.0", 2]], "styleSheet": { "background": {}, "xaxis": { "show": false }, "yaxis": { "show": false }, "grid": {}, "types": [], "typeLabels": [], "primitives": [], "primitiveLabels": [], "textType": {}, "texts": [], "sliderType": {}, "sliders": [], "buttonType": {}, "buttons": [] }, "doc": [], "camera": { "offset": [0, 0], "scale": 50 } }]
    }
  }'
```

### 成功响应

成功返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "filename": "4fa2bc.svg",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.svg",
  "slideIndex": 1,
  "viewBound": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10
  },
  "width": 768,
  "height": 768,
  "scale": 50,
  "mimeType": "image/svg+xml",
  "size": 18234
}
```

## 导出 TikZ `POST /api/render-tikz`

导出 2D TikZ/TeX，文件后缀为 `.tex`，MIME 类型为 `text/plain`。不接收 `pixelRatio`。

### 请求头

| 请求头 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | `string` | 是 | Bearer API Key，格式为 `Bearer <API_KEY>`，无默认值。 |
| `Content-Type` | `string` | 是 | 固定为 `application/json`。 |
| `x-request-id` | `string` | 否 | 业务请求标识，省略时服务自动生成 UUID。 |

### 请求体

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | 是 | 要渲染的完整项目内容，无默认值，格式见[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)。 |
| `slideIndex` | `number` | 否 | 目标画板序号，为从 `1` 开始的正整数，默认 `1`。 |
| `template` | `object` | 否 | 渲染母版，省略时沿用目标画板现有样式。可在[大角几何母版](https://dajiaoai.com/master-templates)页面下载母版数据。 |
| `viewBound` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`}` | 否 | 逻辑视口边界，传入对象时四个属性均必填，且需为有限数值；要求 `left < right` 且 `bottom < top`。省略时使用目标画板保存的相机视口。 |
| `scale` | `number` | 否 | 相机缩放比例（每逻辑单位对应的像素数），正数。省略时使用目标画板当前 `camera.scale`。 |

### 请求示例

```bash
curl -X POST https://api.dajiaoai.com/api/render-tikz \
  -H "Authorization: Bearer djo_xxx" \
  -H "Content-Type: application/json" \
  -H "x-request-id: render-tikz-demo-001" \
  -d '{
    "slideIndex": 1,
    "viewBound": {
      "left": -10,
      "right": 10,
      "bottom": -10,
      "top": 10
    },
    "scale": 50,
    "content": {
      "metadata": { "version": "11" },
      "messages": [],
      "slides": [{ "definitions": [{ "kind": "primitive", "id": "A", "source": "Point(0, ?)", "label": "{{id}}" }, { "kind": "primitive", "id": "B", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "C", "source": "Point(?, 0)", "label": "{{id}}" }, { "kind": "primitive", "id": "a", "source": "Segment(A, B)" }, { "kind": "primitive", "id": "b", "source": "Segment(B, C)" }, { "kind": "primitive", "id": "c", "source": "Segment(C, A)" }], "uvarMap": [["A.0", 3], ["B.0", -3], ["C.0", 2]], "styleSheet": { "background": {}, "xaxis": { "show": false }, "yaxis": { "show": false }, "grid": {}, "types": [], "typeLabels": [], "primitives": [], "primitiveLabels": [], "textType": {}, "texts": [], "sliderType": {}, "sliders": [], "buttonType": {}, "buttons": [] }, "doc": [], "camera": { "offset": [0, 0], "scale": 50 } }]
    }
  }'
```

### 成功响应

成功返回 `200 OK`：

```json
{
  "success": true,
  "url": "https://dl.easeplay.vip/dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "filename": "4fa2bc.tex",
  "objectKey": "dajiao-open/dev/mcp/customer-id/session-id/4fa2bc.tex",
  "slideIndex": 1,
  "viewBound": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10
  },
  "width": 768,
  "height": 768,
  "scale": 50,
  "mimeType": "text/plain",
  "size": 9631
}
```

## 失败响应

| 状态码 | 原因 |
| --- | --- |
| `400` | 参数不通过，或 `content` 不符合[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol) |
| `401` | API Key 无效 |
| `422` | 旧版接口拒绝包含 3D 几何的项目（`UNSUPPORTED_3D_GEOMETRY`）；v2 错误见下表 |

| 错误码 | HTTP 状态 | 可重试 | 说明 |
| --- | --- | --- | --- |
| `RENDER_QUEUE_FULL` | `503` | 是 | 渲染队列已满；响应带 `Retry-After: 1`。 |
| `RENDER_TIMEOUT` | `504` | 是 | 排队与执行总时间超过限制。 |
| `RENDER_CANCELLED` | `499` | 是 | 客户端取消请求或服务关闭时任务仍在排队。 |
| `RENDER_INVALID_REQUEST` | `422` | 否 | 目标画板无效、不是 3D 画板，或请求的输出尺寸超过限制。 |
| `RENDER_WORKER_FAILED` | `500` | 是 | 渲染工作线程异常退出或任务执行失败。 |
| `UNSUPPORTED_3D_PRIMITIVE` | `422` | 否 | 目标画板包含原生后端尚未实现的 3D 图元。 |

## 计费说明

- 计费类型：render
- 单次费用：详见[API 计费说明](/api/pricing)
- 扣费规则：成功执行后扣费
