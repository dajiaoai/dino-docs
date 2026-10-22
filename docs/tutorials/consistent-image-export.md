---
title: 多环节图片导出尺寸一致性
description: 在 SDK、MCP 等导出环节中使用同一精确裁剪窗口，稳定控制平面几何图片的构图与像素尺寸
---

# 多环节图片导出尺寸一致性

当同一张平面几何画板需要在编辑器、宿主网页、MCP 自动化或后端任务中反复导出时，请不要依赖“自动适配内容”“当前相机”或固定输出尺寸来保持一致。应为该画板定义一份**精确裁剪窗口**，并在每个导出环节传入同一份世界坐标范围和缩放比例。

## 先看结论

1. **MCP 初始化的工程**：应由 AI 根据题目内容和构图需要，设置推荐的画板范围。
2. **内嵌画板初始化的工程**：应由人工在画板界面设置准确的有限画布范围，并将这组边界作为后续导出的统一依据。
3. **导出图片**：SDK 使用 `view` 模式并显式传入准确的 `viewBound`；MCP 导出也必须显式传入同一范围对应的四条边界和 `scale`。不要省略边界而回退到当前相机、自动包围盒或服务端默认视口。

![MCP进行有限画布设置](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/bfc86552-screenshot-20260903-142809.png)
![画板界面中的有限画布设置](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/8640b67d-screenshot-20260903-142123.png)

## 为什么自动裁剪不能保证一致


`contain` 模式会随可见图元的包围盒变化；添加标注、辅助线、隐藏对象状态或修改元素位置，都可能改变图片边缘与最终尺寸。省略裁剪窗口时，不同运行环境还可能读取到不同的当前相机或默认视口。

精确裁剪窗口将“画什么范围”和“每个世界坐标单位渲染多少像素”固定下来：

```ts
const crop = {
  left: -6,
  right: 6,
  top: 4,
  bottom: -4,
  scale: 50,
};
```

这组有限画布参数表示导出宽度为 `12 × 50 = 600 px`、高度为 `8 × 50 = 400 px` 的逻辑图片。它们随工程保存；导出时应读取工程中的准确范围，而不是由每个调用点手写一份近似值。

::: tip 跨协议统一 `viewBound`
在 MCP、内嵌 SDK 和 Render API 中，平面几何的精确裁剪窗口统一使用世界坐标
`{ left, right, bottom, top }`，SDK 将 `scale` 放在 `viewBound` 内，MCP
和 Render API 将 `scale` 放在顶层。
:::


## SDK：使用 `view` 模式


```ts
const viewBound = {
  left: crop.left,
  top: crop.top,
  right: crop.right,
  bottom: crop.bottom,
  scale: crop.scale,
};

const images = await editor.slides.exportImage({
  mode: 'view',
  format: 'png',
  viewBound,
  pixelRatio: 1,
});
```

SDK 的输出像素计算为：

```text
宽度 = (right - left) × scale × pixelRatio
高度 = (top - bottom) × scale × pixelRatio
```

如果画板已设置有限画布，可读取其导出视野，直接传递给 `exportImage`：

```ts
const viewBound = await editor.slides.getViewBounds();
if (!viewBound) throw new Error('当前画板未设置有限画布');
```




## MCP：将画板设为有限画布

MCP 初始化工程后，AI 可通过 `repl` 调用 `view_bounds`，为当前 2D 画板设置推荐的有限画布范围：

```text
view_bounds (-1, 13, -1, 10, 50)
```

五个参数依次为 `minX`、`maxX`、`minY`、`maxY`、`scale`。上例表示 X 范围为 `[-1, 13]`、Y 范围为 `[-1, 10]`，每个世界坐标单位以 `50` 个逻辑像素渲染。该范围会保存到工程的当前画板中，供后续 SDK、MCP 或 API 导出时读取和复用。

`view_bounds` 仅适用于 2D 画板；如需恢复无限画布，可执行 `view_bounds infinite`。

## MCP：显式传入裁剪窗口

MCP 的 `export_image` 同样通过 `viewBound` 和 `scale` 固定平面几何的裁剪窗口。

```ts
{
  sessionId,
  slideIndex: 1,
  viewBound: {
    left: crop.left,
    right: crop.right,
    bottom: crop.bottom,
    top: crop.top,
  },
  scale: crop.scale,
}
```



## 常见偏差排查

| 现象 | 常见原因 | 处理方式 |
| --- | --- | --- |
| 图片尺寸随内容变化 | 使用了 `contain` 或自动包围盒 | 改为精确裁剪窗口 |
| 构图一致但像素尺寸不同 | `scale` 或 SDK `pixelRatio` 不一致 | 固定两者并按公式验算 |

相关文档：[编辑模式导出图片](../sdk/2/export-image)、[MCP 使用指南](../ai/mcp/)。
