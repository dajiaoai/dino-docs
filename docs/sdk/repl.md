---
title: REPL 能力
description: REPL 接入方式、命令能力、动画与交互、输出与错误约定 - 大角几何
---

# REPL 能力

REPL（Read-Eval-Print Loop）是大角几何画板的交互式命令接口，面向 AI 与开发者提供完整画板控制能力。

通过 REPL 可以完成：

- 多画板管理
- 定义对象、标签与样式
- 动画与交互（滑动条、播放按钮、事件动作序列）
- 表达式求值与结果校验
- 就近选点与交点构造
- 帮助主题查询

输出统一为文本（表格或单行文本），便于展示和自动化解析。

## 接入方式

```ts
import { createPresentation } from '@dajiaoai/algeo-sdk';

const presentation = await createPresentation(container, {
  auth: { appId },
});

await presentation.loadShareById('33TA3484');
const { output } = await presentation.repl('list');
```

接口定义：

```ts
presentation.repl(command: string): Promise<{ output: string }>
```

每次调用执行**单条**命令。错误时 reject，错误码见 [协议说明 - 错误码](../api/protocol#错误码)。

## 命令分类

### 画板管理

| 命令                            | 说明                               |
| ------------------------------- | ---------------------------------- |
| `list_slides`                   | 列出所有画板（编号、ID、定义数量） |
| `new_slide [idx]`               | 创建新画板，可选插入位置           |
| `switch_slide <idOrIdx>`        | 切换到指定画板                     |
| `dup_slide <idOrIdx> [tgtIdx]`  | 复制画板                           |
| `move_slide <idOrIdx> <tgtIdx>` | 移动画板顺序                       |
| `del_slide <idOrIdx>`           | 删除画板                           |

idOrIdx：可用**编号**（从 1 开始）或 **ID**（如 `slide_abc123`）。

### 定义管理

| 命令                          | 说明                                                       |
| ----------------------------- | ---------------------------------------------------------- |
| `list`                        | 列出当前画板所有定义（ID、类型、值、定义、标签、可见性等） |
| `def <ID> := <Expr>`          | 定义或修改几何元素                                         |
| `def <ID> : <Type> := <Expr>` | 带类型标注的定义                                           |
| `def <ID>.label := <Expr>`    | 定义/修改元素标签                                          |
| `label <ID> := <Expr>`        | 同上                                                       |
| `undef <ID1> <ID2> ...`       | 删除一个或多个定义                                         |
| `rename <OldID> to <NewID>`   | 重命名元素                                                 |
| `clear`                       | 清空当前画板                                               |
| `eval <Expr>`                 | 求表达式值，用于计算/验证                                  |

### 对象上选点与交点

| 命令                                                    | 说明                          |
| ------------------------------------------------------- | ----------------------------- |
| `snap_point [<ID> :=] <Obj> near (<X>,<Y>)`             | 在对象上选最靠近 (X,Y) 的点   |
| `intersect [<ID> :=] <ObjA> with <ObjB> near (<X>,<Y>)` | 定义两对象最靠近 (X,Y) 的交点 |

支持对象：Line、Circle、Segment、Ray、Arc、Ellipse、EllipticArc、Curve 等。

### 样式管理

| 命令                                               | 说明                 |
| -------------------------------------------------- | -------------------- |
| `check_style <Selector>`                           | 查看指定选择器的样式 |
| `style <SelectorList> { <Property>:<Value>; ... }` | 设置样式             |
| `unset_style <SelectorList>`                       | 清除样式             |

**选择器**：`Background`、`XAxis`、`YAxis`、`Grid`、`#<ID>`、`<Type>:label`、`#<ID>:label`。

### 帮助

| 命令           | 说明                                                    |
| -------------- | ------------------------------------------------------- |
| `help`         | 默认帮助                                                |
| `help <Topic>` | 按主题查询（命令、类型、syntax、globals、transform 等） |

### 动画与交互（Slider / Button）

| 命令/语法                        | 说明                             |
| -------------------------------- | -------------------------------- |
| `def <ID> := Slider(?:=<初值>)`  | 定义滑动条（可作为动画驱动参数） |
| `def <ID> := Button("<标题>")`   | 定义按钮                         |
| `on <buttonId>.click do ... end` | 定义按钮点击事件动作序列         |
| `check_event <buttonId>.click`   | 查看按钮事件处理程序             |

滑动条常用链式参数：

- 范围与步长：`.withMin(...)`、`.withMax(...)`、`.withStep(...)`
- 播放控制：`.withSpeed(...)`、`.withDirection(SliderDirection.xxx)`、`.autoPlay()`

按钮事件动作序列常见动作：

- 可见性：`show A`、`hide A`、`toggle A`
- 滑动条控制：`play s1`、`stop s1`、`set s1 to 3`、`set s1 to 3 in 1s`
- 时序：`wait 1s`、`parallel do ... end`

建议配合 `help Slider`、`help Button`、`help animation` 获取完整语法与枚举说明。

## 几何类型与构造

### 点

- `Point(x, y)`：定点
- `Point(?:=x, ?:=y)`：动点（可拖拽）
- `MidPoint(A, B)`：中点

### 直线类

- `Line(P1, P2)`、`Segment(P1, P2)`、`Ray(Start, Through)`
- `PerpLine(Line, Point)`、`ParallelLine(Line, Point)`、`PerpBisector(Segment)`
- `Tangent(CircleOrArc, Point)`、`AngleBisector<Angle>`

### 圆与弧

- `Circle(Center, Radius)` / `Circle(Center, Point)`
- `Circumcircle(P1, P2, P3)`、`Arc(...)`、`SemiCircle(P1, P2)`

### 多边形

- `Polygon(...Points)`、`Polygon(A, B, NumEdges)`、`Parallelogram(P1, P2, P3)`

### 曲线

- 显函数：`Curve(y=x²)`
- 参数：`Curve(x(t), y(t), start, end)`
- 隐函数：`Curve(f(x,y)=0)`

### 变换

- `Translate(Obj, Point)`、`Rotate(Obj, Angle, Center)`、`Reflect(Obj, Line)`、`Scale(Obj, Factor, Center)`

### 交点

- `Intersect(A, B, Index)`：初等几何对象交点，Index 从 1 开始
- `eval Intersect(A, B)`：列出所有交点

## 标签与文本

- `def <ID> := "<字符串>"`：文本对象
- 标签模板：`"{{id}}"`、`"{{x}}"`、`"{{y}}"`、`"{{length}}"` 等
- 支持 `{{Expr}}` 引用表达式

## 输出格式

- **表格**：`list`、`list_slides`、`check_style` 等以表格形式输出
- **单行**：`def`、`eval`、`style` 等返回单行或简短说明
- **帮助**：`help` 返回 Markdown 文本

`list` 输出列示例：ID、类型、值、定义、标签、可见性、是否子对象。

## 输入规则与行为细节

- AlgeoSDK 的 `presentation.repl(command)` 按单条命令执行。
- MCP/Agent 的 `algeo_repl` 按 `commands[]` 顺序批量执行。
- 空字符串、纯空白、`--` 注释会返回空输出。
- `#` 不是注释语法，会触发语法错误。
- `help` 主题不区分大小写，且会对下划线做归一化（例如 `help LIST_SLIDES`）。

## 语法与约束

- **注释**：`--` 单行注释
- **标识符**：字母开头，可含数字、下划线
- **坐标**：1 单位 ≈ 50px，建议在 ±10 内
- **几何约束**：优先用几何构造，避免用坐标近似

## 快速示例

```
-- 查询帮助
help
help Point
help Curve

-- 画板操作
list_slides
new_slide
switch_slide 1

-- 定义几何对象
def A := Point(0,0)
def B := Point(1,0)
def l := Line(A,B)
def c := Circle(A, 2)

-- 交点
def P := Intersect(l, c, 1)

-- 标签
label A := "{{id}}"

-- 样式
style XAxis, YAxis { show: true; }
style #A { color: #FF0000; pointSize: 7; }

-- 查询与验证
list
eval A.x + B.x

-- 动画（隐藏滑动条 + 自动播放）
def t1 := Slider(?:=0).withMin(0).withMax(1).withSpeed(1).withDirection(SliderDirection.pingpong).autoPlay()
style #t1 { hidden: true; }
def Q := Point(l, t1)

-- 播放按钮
def btn := Button("播放")
on btn.click do
	play t1
end
check_event btn.click
```
