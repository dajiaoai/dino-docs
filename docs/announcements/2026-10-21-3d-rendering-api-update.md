---
title: 3D 渲染接口优化：度数角度、固定视图与裁剪
description: 智能生图工程携带推荐固定视图与范围，可选编辑调整后省略视图参数直接导出；同步优化 3D 角度、默认视口与裁剪，仅影响 3D 渲染。
date: "2026-10-21"
modules: [api]
topics: [export, ai]
---

# 3D 渲染接口优化：度数角度、固定视图与裁剪

- 类型：接口变更与体验优化
- 发布时间：2026-10-21
- 生效时间：2026-10-21
- 影响范围：通过 Render API 或 MCP 导出 3D 画板的开发者，仅影响 3D 渲染
- 是否需要操作：已有 3D 渲染接入需检查角度字段、默认尺寸与固定视图配置

此前，3D 导出使用弧度角度，视图参数与尺寸配置也不够易用，导致从绘图、保存视图到导出图片的全链路难以跑通。本次围绕这些问题优化 3D 渲染：请求角度改用度数，明确固定视图的取值规则，并支持在完整视口内裁剪，方便稳定控制最终构图。

**本次调整仅影响 3D 渲染，已有 2D 渲染调用无需迁移。** `POST /api/render/v2` 的接口地址保持不变。

## 推荐链路：智能生图 → 可选调整 → 直接导出

**推荐使用智能生图服务生成工程，再直接调用图片导出接口。** 智能生图生成的工程会带有推荐的固定视图或范围信息；对于 3D 画板，包含用于导出的视角、视口尺寸和裁剪范围。导出接口可直接读取工程中的这些配置，减少接入方重复计算和传递视图参数的工作，让生图到图片导出的衔接更顺畅。

1. **智能生图生成推荐范围**：调用<a href="/api/agent-create" target="_blank" rel="noopener noreferrer">智能生图服务</a>，等待任务完成后，通过 `artifactUrl` 获取带有推荐固定视图或范围信息的完整工程。
2. **进入编辑器二次调整（可选）**：直接使用生成结果即可导出；需要调整构图时，可在编辑器中修改固定视图、范围或裁剪设置，保存并取得调整后的完整工程。3D 导出读取的是已启用固定视图，单纯旋转编辑相机不会更新导出配置。
3. **省略视图参数直接导出**：将生成的工程或调整后的工程作为 `content` 传入 `POST /api/render/v2`，选择 `slideIndex`，**不传 `view2D`、`view3D`**。服务按目标画板类型读取工程中保存的固定范围或已启用固定视图，并完成导出。

将上述完整工程保存为 `project.algeo` 后，推荐的导出请求如下：

```bash
jq '{content: ., slideIndex: 1}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

如需提高输出分辨率，可增加顶层 `pixelRatio`，仍无需传入 `view2D`、`view3D`。只有需要为某次导出临时覆盖构图时，才传入对应的视图参数；下文介绍这些参数的变更与用法。

## 3D 接口变更

| 项目 | 原有用法 | 当前用法 |
| --- | --- | --- |
| 水平观察角 | `view3D.yaw`，弧度 | `view3D.yawDeg`，度 |
| 俯仰观察角 | `view3D.pitch`，弧度 | `view3D.pitchDeg`，度 |
| 斜投影方向角 | `view3D.obliqueAngle`，弧度 | `view3D.obliqueAngleDeg`，度 |
| 默认视口尺寸 | `1024 × 1024` | 协议默认值为 `1920 × 1080`；显式参数和已启用固定视图的尺寸优先 |
| 省略相机参数 | 沿用画板保存的相机 | 逐字段使用显式参数、已启用固定视图、协议默认值；编辑时旋转相机不再作为导出取景依据 |
| 裁剪范围 | 未提供裁剪参数 | 使用 `view3D.crop` 指定完整逻辑视口内的裁剪矩形 |

请求与响应的角度单位不同：**请求使用度数，响应 `camera.yaw`、`camera.pitch`、`camera.obliqueAngle` 仍使用弧度**。迁移时既要替换字段名，也要转换数值，例如 `yaw: 0.7853981633974483` 改为 `yawDeg: 45`。

输出设备像素比推荐放在顶层 `pixelRatio`，默认 `1`。`view3D.pixelRatio` 保留兼容，若同时提供则优先使用视图内的值。

## 设置完整视口，再裁剪输出

`width`、`height` 表示完整逻辑视口，`crop` 在该视口内截取需要的区域。裁剪原点为左上角，四个边界必须完整提供，并满足：

- `0 <= left < right <= width`
- `0 <= top < bottom <= height`

服务先按完整视口渲染，再进行裁剪。调整裁剪范围不会改变相机构图；设置范围时应覆盖图形、标签和标注，并预留适量边距。

将完整工程保存为 `project.algeo`，且第 `1` 个画板为 3D 画板时，可使用：

```bash
jq '{
  content: .,
  slideIndex: 1,
  pixelRatio: 2,
  view3D: {
    projection: "orthographic",
    yawDeg: 45,
    pitchDeg: 45,
    width: 1280,
    height: 720,
    crop: {
      left: 100,
      top: 60,
      right: 1100,
      bottom: 660
    }
  }
}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

上述裁剪区域为 `1000 × 600` 逻辑像素，乘以 `pixelRatio: 2` 后，最终 PNG 为 **2000 × 1200 像素**。请根据实际图形调整相机与裁剪范围。裁剪后的最终 PNG 物理宽、高均不得超过 `2048` 像素，超限返回 HTTP `422`，不会自动缩图。

## 绘图、固定视图与导出衔接

通过 MCP 绘制 3D 图形时，可用 `view_camera3d` 保存展示与导出的固定视图，包括观察角度、完整视口尺寸与裁剪范围。固定视图独立于编辑视图保存，后续导出可复用同一构图。

绘图引导也同步优化：没有固定视图配置时，在完成图形后推荐并保存合适的尺寸与裁剪范围，确保图形和标签完整可见，减少留白。已有固定视图则继续沿用，用户要求调整时再修改。

## 接入方需要检查什么

- 将 3D 请求中的三个角度字段改为 `*Deg` 字段，并将弧度转换为度数：`度数 = 弧度 × 180 / π`。
- 如需保持原有输出尺寸，显式填写 `width`、`height`，避免默认尺寸变化影响布局。
- 检查固定视图是否已启用，以及视角、尺寸和裁剪范围是否符合导出需要。
- 读取响应 `camera` 时，继续按弧度处理角度。

完整参数与默认值见 <a href="/api/render-v2" target="_blank" rel="noopener noreferrer">PNG 导出接口</a>，可通过页面中的 Playground 验证新的请求格式。SDK 的相关能力见 <a href="./2026-10-21-sdk-2-15-0-3d-view-export" target="_blank" rel="noopener noreferrer">SDK 2.15.0：3D 固定视图与图片导出升级</a>。
