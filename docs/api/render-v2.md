---
title: 导出 PNG
description: PNG 导出接口的请求参数、调用示例和响应说明。
---

# 导出 PNG

<RenderPlayground />

**Base URL：** `https://api.dajiaoai.com`

**接口地址：** `POST /api/render/v2`

接口接收一个符合[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)的项目内容，渲染指定画板并返回导出文件地址与元数据。

::: info 尺寸单位
`viewBound` 使用画板逻辑坐标，`scale` 表示每个逻辑单位对应的像素数，返回结果中的 `width` 和 `height` 表示图片像素尺寸。工程内字号、线宽等视觉尺寸使用 px；如果你手头的规范使用 pt，请查看[尺寸单位与换算](/reference/units)。
:::

鉴权方式见[鉴权说明](/api/auth)。

推荐使用此接口导出 PNG，支持 2D 与 3D 画板。已有 `/api/render` 接入可查看[旧版接口与迁移说明](./api-render)。

## 请求头

| 请求头 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | `string` | 是 | Bearer API Key，格式为 `Bearer <API_KEY>`，无默认值。 |
| `Content-Type` | `string` | 是 | 固定为 `application/json`。 |
| `x-request-id` | `string` | 否 | 业务请求标识，省略时服务自动生成 UUID。 |

## 请求体

::: info 渲染模式
`view2D` 与 `view3D` 互斥，不能同时传入。二者都省略时，使用目标画板保存的相机模式和参数。
:::

所有数值参数均需为有限数值。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | 是 | 要渲染的完整项目内容，无默认值。格式见[工程文件数据协议](/reference/algeo-file-protocol)。 |
| `slideIndex` | `number` | 否 | 目标画板序号，从 `1` 开始的正整数，默认 `1`。 |
| `template` | `object` | 否 | 渲染母版，省略时沿用目标画板现有样式。可[下载母版数据](https://dajiaoai.com/master-templates)。 |
| `view2D` | `object` | 否 | 指定 2D 视口，详见 [2D 视口参数](#view2d)。 |
| `view3D` | `object` | 否 | 强制使用 3D 渲染并覆盖相机参数，详见 [3D 视图参数](#view3d)。 |

### view2D：2D 视口 {#view2d}

传入 `view2D` 时，四个边界字段均必填且无默认值，要求 `left < right`、`bottom < top`。

| 字段 | 类型 | 默认值 / 必填 | 说明 |
| --- | --- | --- | --- |
| `left` | `number` | 必填 | 左边界，逻辑坐标。 |
| `right` | `number` | 必填 | 右边界，逻辑坐标。 |
| `bottom` | `number` | 必填 | 下边界，逻辑坐标。 |
| `top` | `number` | 必填 | 上边界，逻辑坐标。 |
| `scale` | `number` | 沿用画板 | 每个逻辑单位对应的像素数，须大于 `0`。 |
| `pixelRatio` | `number` | `1` | 输出设备像素比，须大于 `0`。 |

`pixelRatio` 按比例缩放 PNG 的物理像素尺寸，不改变逻辑视口或相机缩放比例。`scale` 省略时沿用目标画板相机缩放比例。

### view3D：3D 视图 {#view3d}

传入 `view3D` 时强制使用 3D 渲染。对象内所有属性均可选。

默认值为「沿用画板」的参数，省略时使用目标画板保存的三维相机值。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `offset` | `[number, number, number]` | 沿用画板 | 相机中心，包含三个坐标分量。 |
| `yaw` | `number` | 沿用画板 | 水平观察角，单位为弧度。 |
| `pitch` | `number` | 沿用画板 | 俯仰观察角，单位为弧度。 |
| `projection` | `string` | 沿用画板 | 投影模式：`orthographic`（正交投影）、`perspective`（透视投影）、`oblique`（斜投影）。 |
| `obliqueAngle` | `number` | 沿用画板 | 斜投影方向角，单位为弧度。 |
| `obliqueScaleRatio` | `number` | 沿用画板 | 斜投影退行轴缩放比例，须大于或等于 `0`。 |
| `scale` | `number` | 沿用画板 | 相机缩放比例，须大于 `0`。 |
| `width` | `number` | `1024` | 逻辑输出宽度，须为正整数。 |
| `height` | `number` | `1024` | 逻辑输出高度，须为正整数。 |
| `pixelRatio` | `number` | `1` | 输出设备像素比，须大于 `0`。 |

PNG 物理像素尺寸 = 逻辑输出尺寸 × `pixelRatio`。例如，`width: 1280`、`height: 720`、`pixelRatio: 2` 时，输出图片为 **2560 × 1440 像素**。

## 请求示例

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
jq '{
  content: .,
  slideIndex: 1,
  view2D: {
    left: -10,
    right: 10,
    bottom: -10,
    top: 10,
    scale: 50,
    pixelRatio: 1
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

指定 3D 视图：

```bash
jq '{
  content: .,
  slideIndex: 1,
  view3D: {
    width: 1280,
    height: 720,
    pixelRatio: 1,
    projection: "orthographic",
    yaw: 0.7853981633974483,
    pitch: 0.7853981633974483
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

## 成功响应

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

## 失败响应

见[渲染接口失败响应](./render#失败响应)。
