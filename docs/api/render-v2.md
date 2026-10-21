---
title: 导出 PNG
description: PNG 导出接口的请求参数、调用示例和响应说明。
---

# 导出 PNG

<RenderPlayground variant="png-v2" />

**Base URL：** `https://api.dajiaoai.com`

**接口地址：** `POST /api/render/v2`

接口接收一个符合[大角工程文件（.algeo）数据协议](/reference/algeo-file-protocol)的项目内容，渲染指定画板并返回导出文件地址与元数据。

::: info 尺寸单位
`view2D` 的边界使用画板逻辑坐标，`scale` 表示每个逻辑单位对应的像素数，返回结果中的 `width` 和 `height` 表示图片像素尺寸。工程内字号、线宽等视觉尺寸使用 px；如果你手头的规范使用 pt，请查看[尺寸单位与换算](/reference/units)。
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
`content` 必填。`view2D` 与 `view3D` 互斥，不能同时传入。服务根据目标画板自动选择 2D 或 3D 渲染，并读取对应视图参数；视图参数不会切换画板类型。省略视图参数时，使用固定视图或协议默认值。
:::

所有数值参数均需为有限数值。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | `FileContentLatest` | 是 | 要渲染的完整项目内容，无默认值。格式见[工程文件数据协议](/reference/algeo-file-protocol)。 |
| `slideIndex` | `number` | 否 | 目标画板序号，从 `1` 开始的正整数，默认 `1`。 |
| `template` | `object` | 否 | 渲染母版，省略时沿用目标画板现有样式。可[下载母版数据](https://dajiaoai.com/master-templates)。 |
| `transparent` | `boolean` | 否 | 是否跳过背景色填充，默认 `false`。 |
| `pixelRatio` | `number` | 否 | 输出设备像素比，须大于 `0`，默认 `1` |
| `view2D` | `object` | 否 | 指定 2D 视口，详见 [2D 视口参数](#view2d)。 |
| `view3D` | `object` | 否 | 指定 3D 画板的视图参数，详见 [3D 视图参数](#view3d)。 |

### view2D：2D 视口 {#view2d}

四个边界可以全部省略；只要提供其中一个，就必须完整提供四个，且满足 `left < right`、`bottom < top`。边界优先使用显式值，其次为画板固定范围，否则使用协议默认范围；不继承编辑相机。

| 字段 | 类型 | 默认值 / 必填 | 说明 |
| --- | --- | --- | --- |
| `left` | `number` | 四项同时提供或省略 | 左边界，逻辑坐标。 |
| `right` | `number` | 四项同时提供或省略 | 右边界，逻辑坐标。 |
| `bottom` | `number` | 四项同时提供或省略 | 下边界，逻辑坐标。 |
| `top` | `number` | 四项同时提供或省略 | 上边界，逻辑坐标。 |
| `scale` | `number` | 固定范围 scale，否则 `50` | 每个逻辑单位对应的像素数，须大于 `0`。 |
| `pixelRatio` | `number` | 顶层值，否则 `1` | 兼容参数，须大于 `0`；优先于顶层 `pixelRatio`。 |

`pixelRatio` 按比例缩放 PNG 的物理像素尺寸，不改变逻辑视口或相机缩放比例。`scale` 优先使用显式值，其次为固定范围 scale，否则为 `50`。`view2D` 可以只传 `scale` 或 `pixelRatio`，也可以为空对象。

未提供显式边界且画板无固定范围时，X、Y 均使用 `[-10.24, 10.24]`。配合默认 `scale: 50`、`pixelRatio: 1`，输出为 **1024 × 1024 像素**。只修改 `scale` 不会改变该默认逻辑范围。

### view3D：3D 视图 {#view3d}

目标画板为 3D 时，读取 `view3D` 作为本次导出视图。对象内所有属性均可选。

各字段依次使用显式值、已启用的固定三维视图、下表中的协议默认值。请求角度使用度数，响应 `camera` 中的角度仍使用弧度。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `offset` | `[number, number, number]` | `[0, 0, 0]` | 画面中心的世界坐标。 |
| `yawDeg` | `number` | `45` | 水平观察角，单位为度。 |
| `pitchDeg` | `number` | `45` | 俯仰观察角，单位为度。 |
| `projection` | `string` | `orthographic` | `orthographic`（正交）、`perspective`（透视）或 `oblique`（斜投影）。 |
| `obliqueAngleDeg` | `number` | `45` | 斜投影方向角，单位为度。 |
| `obliqueScaleRatio` | `number` | `0.5` | 斜投影退行轴缩放比例，须大于或等于 `0`。 |
| `scale` | `number` | `0.1` | 相机缩放比例，须大于 `0`。 |
| `width` | `integer` | `1920` | 完整逻辑视口宽度，须为正整数。 |
| `height` | `integer` | `1080` | 完整逻辑视口高度，须为正整数。 |
| `crop` | `object` | 不裁剪 | 裁剪矩形，详见下文；省略时会继承固定视图已启用的裁剪。 |
| `pixelRatio` | `number` | 顶层值，否则 `1` | 兼容参数，须大于 `0`；优先于顶层 `pixelRatio`。 |

`crop` 使用完整逻辑视口内的坐标，左上为原点，`left`、`top`、`right`、`bottom` 四项均必填，要求 `0 <= left < right <= width`、`0 <= top < bottom <= height`。服务先渲染完整视口，再裁剪；裁剪不会改变相机构图。

未裁剪时，PNG 物理像素尺寸 = 完整逻辑视口尺寸 × 实际生效的 `pixelRatio`。例如 `width: 960`、`height: 540`、顶层 `pixelRatio: 2` 时，输出为 **1920 × 1080 像素**。裁剪后输出宽高分别为 `(right - left) × pixelRatio`、`(bottom - top) × pixelRatio`。

::: warning PNG 尺寸上限
2D、3D 导出的最终 PNG 物理宽、高均不得超过 **2048 像素**。3D 有裁剪时，上限针对**裁剪后的最终物理尺寸**，不是完整逻辑视口。
:::

## 请求示例

将主站或 SDK 导出的完整项目保存为 `project.algeo`，以下示例使用 `jq` 将项目包装为 `content`。3D 示例要求第 `1` 个画板为 3D 画板。

按目标画板类型自动选择渲染模式，使用固定视图或协议默认值：

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
  pixelRatio: 1,
  view2D: {
    left: -10,
    right: 10,
    bottom: -10,
    top: 10,
    scale: 50
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
  pixelRatio: 1,
  view3D: {
    width: 1280,
    height: 720,
    projection: "orthographic",
    yawDeg: 45,
    pitchDeg: 45
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
  "pixelRatio": 1,
  "mimeType": "image/png",
  "size": 24831
}
```

2D、3D 响应均返回实际生效的 `pixelRatio`。3D 渲染成功同样返回 `200 OK`，使用实际 `camera` 参数替代 2D 响应中的 `viewBound` 与 `scale`：

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

响应中的 `width`、`height` 是裁剪后最终 PNG 的物理像素尺寸；请求中的 `view3D.width`、`view3D.height` 是完整逻辑视口尺寸。像素比依次使用 `view3D.pixelRatio`、顶层 `pixelRatio`、默认值 `1`。响应 `camera.yaw`、`camera.pitch`、`camera.obliqueAngle` 仍为弧度。

## 失败响应

| HTTP 状态 | 情况 |
| --- | --- |
| `400` | 同时传入 `view2D`、`view3D`，或字段不符合 Schema，例如 `crop: null`。 |
| `422` / `RENDER_INVALID_REQUEST` | 视图与目标画板维度不匹配、解析后的边界或裁剪范围无效，或最终 PNG 物理宽、高任一超过 `2048`。 |

见[渲染接口失败响应](./render#失败响应)。
