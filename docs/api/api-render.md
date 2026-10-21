---
title: 旧版 PNG 接口
description: 旧版 PNG 渲染接口参数、请求示例及迁移到 /api/render/v2 的说明。
---

# 旧版 PNG 接口 {#render-legacy}

<RenderPlayground variant="png-legacy" />

**Base URL：** `https://api.dajiaoai.com`

**接口地址：** `POST /api/render`

::: warning 推荐迁移到新版本
`POST /api/render` 保留用于兼容已有接入，仅支持 2D PNG。新接入请使用 [`POST /api/render/v2`](./render-v2)，已有调用建议在更新时迁移。
:::

## 迁移到 v2

迁移时保留 `content`、`slideIndex`、`template` 与顶层 `pixelRatio`，将 `viewBound` 的四个边界和 `scale` 放入 `view2D`：

```json
{
  "pixelRatio": 2,
  "view2D": {
    "left": -10,
    "right": 10,
    "bottom": -10,
    "top": 10,
    "scale": 50
  }
}
```

以上仅为视图参数片段，完整请求必须包含 `content`。服务按目标画板类型选择渲染模式；同时省略两个视图时，使用固定视图或协议默认值。覆盖 3D 视图参数使用 `view3D`，请求角度使用 `yawDeg`、`pitchDeg` 等度数字段。顶层 `pixelRatio` 默认 `1`；视图内 `view2D.pixelRatio`、`view3D.pixelRatio` 保留兼容且优先级更高。默认值和裁剪参数详见 [PNG v2](./render-v2)。

## 旧版请求参数

旧版接口的 `Authorization`、`Content-Type`、`x-request-id` 请求头，以及 `content`、`slideIndex`、`template` 字段与[新版 PNG 接口](./render-v2)一致，此外还接收：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `viewBound` | `object` | 否 | 逻辑视口边界，格式为 `{ left, right, bottom, top }`，要求 `left < right` 且 `bottom < top`。省略时使用目标画板当前 camera。 |
| `scale` | `number` | 否 | 相机缩放比例（每逻辑单位对应的像素数），正数。省略时使用目标画板当前 `camera.scale`。 |
| `pixelRatio` | `number` | 否，仅 `/api/render` | PNG 输出像素倍率，必须是正的有限数，默认 `1`。保持逻辑视口和相机缩放不变，将 PNG 的物理宽高按此倍率放大。SVG 和 TikZ 接口不接收此字段。 |
| `transparent` | `boolean` | 否 | 是否跳过背景色填充。 |

## 旧版请求与响应示例

将主站或 SDK 导出的完整项目保存为 `project.algeo`；以下示例使用 `jq` 将项目内容放入请求的 `content` 字段。

```bash
jq '{
  content: .,
  slideIndex: 1,
  viewBound: {
    left: -10,
    right: 10,
    bottom: -10,
    top: 10
  },
  scale: 50,
  pixelRatio: 2,
  template: {
    backgroundStyle: {
      background: { color: "#ffffff" },
      grid: {},
      xaxis: {},
      yaxis: {}
    },
    defaultStyle: {
      types: [["Point", { pointSize: 1, color: "#000000" }]],
      typeLabels: [],
      textType: {},
      sliderType: {},
      buttonType: {}
    }
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render \
    -H "Authorization: Bearer djo_xxx" \
    -H "Content-Type: application/json" \
    -H "x-request-id: render-demo-001" \
    --data-binary @-
```

成功返回 `200 OK`：

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
  "width": 2000,
  "height": 2000,
  "scale": 50,
  "mimeType": "image/png",
  "size": 24831
}
```

`pixelRatio` 只改变 PNG 的物理像素尺寸，不改变 `viewBound` 或相机 `scale`。最终尺寸会四舍五入为整数：

```text
width = round(logical canvas width × pixelRatio)
height = round(logical canvas height × pixelRatio)
```

本例的视口宽高均为 `20` 个逻辑单位，`scale` 为 `50`，因此逻辑渲染尺寸为 `1000 × 1000`；当 `pixelRatio` 为 `2` 时，返回的 `width`、`height` 以及实际 PNG 尺寸均为 `2000 × 2000`。最终宽度和高度均不得超过 `2048` 像素。
