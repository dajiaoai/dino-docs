---
title: 导出 SVG
description: SVG 导出接口的请求参数、调用示例和响应说明。
---

# 导出 SVG

**Base URL：** `https://api.dajiaoai.com`

**接口地址：** `POST /api/render-svg`

接口接收一个符合[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)的项目内容，渲染指定画板并返回导出文件地址与元数据。

::: info 尺寸单位
`viewBound` 使用画板逻辑坐标，`scale` 表示每个逻辑单位对应的像素数，返回结果中的 `width` 和 `height` 表示图片像素尺寸。工程内字号、线宽等视觉尺寸使用 px；如果你手头的规范使用 pt，请查看[尺寸单位与换算](/reference/units)。
:::

鉴权方式见[鉴权说明](/api/auth)。

导出 2D SVG，不接收 `pixelRatio`。

## 请求头

| 请求头 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | `string` | 是 | Bearer API Key，格式为 `Bearer <API_KEY>`，无默认值。 |
| `Content-Type` | `string` | 是 | 固定为 `application/json`。 |
| `x-request-id` | `string` | 否 | 业务请求标识，省略时服务自动生成 UUID。 |

## 请求体

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | 是 | 要渲染的完整项目内容，无默认值，格式见[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)。 |
| `slideIndex` | `number` | 否 | 目标画板序号，为从 `1` 开始的正整数，默认 `1`。 |
| `template` | `object` | 否 | 渲染母版，省略时沿用目标画板现有样式。可在[大角几何母版](https://dajiaoai.com/master-templates)页面下载母版数据。 |
| `viewBound` | `{`<br>`  left: number;`<br>`  right: number;`<br>`  bottom: number;`<br>`  top: number;`<br>`}` | 否 | 逻辑视口边界，传入对象时四个属性均必填，且需为有限数值；要求 `left < right` 且 `bottom < top`。省略时使用目标画板保存的相机视口。 |
| `scale` | `number` | 否 | 相机缩放比例（每逻辑单位对应的像素数），正数。省略时使用目标画板当前 `camera.scale`。 |

## 请求示例

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

## 成功响应

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

## 失败响应

见[渲染接口失败响应](./render#失败响应)。
