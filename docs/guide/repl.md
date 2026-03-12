---
title: REPL 能力
description: REPL 命令分类、几何类型、输出格式、语法约束 - 大角几何
---

# REPL 能力

REPL（Read-Eval-Print Loop）是大角几何画板的**交互式命令接口**，面向 AI 与开发者提供对画板的完整操作能力。通过 SDK 的 `repl` 方法执行单条命令，输出为**面向 AI 的文档/文本格式**（表格、结构化文本），便于解析和决策。

## 接入方式

```javascript
const sdk = await AlgeoSdk.create(container);
const { output } = await sdk.repl('help');
const { output } = await sdk.repl('list');
const { output } = await sdk.repl('def A := Point(0,0)');
```

每次调用执行**单条**命令。错误时 reject，错误码见 [协议说明 - 错误码](../api/protocol#错误码)。

## 命令分类

### 画板管理

| 命令 | 说明 |
|------|------|
| `list_slides` | 列出所有画板（编号、ID、定义数量） |
| `new_slide [idx]` | 创建新画板，可选插入位置 |
| `switch_slide <idOrIdx>` | 切换到指定画板 |
| `dup_slide <idOrIdx> [tgtIdx]` | 复制画板 |
| `move_slide <idOrIdx> <tgtIdx>` | 移动画板顺序 |
| `del_slide <idOrIdx>` | 删除画板 |

idOrIdx：可用**编号**（从 1 开始）或 **ID**（如 `slide_abc123`）。

### 定义管理

| 命令 | 说明 |
|------|------|
| `list` | 列出当前画板所有定义（ID、类型、值、定义、标签、可见性等） |
| `def <ID> := <Expr>` | 定义或修改几何元素 |
| `def <ID> : <Type> := <Expr>` | 带类型标注的定义 |
| `def <ID>.label := <Expr>` | 定义/修改元素标签 |
| `label <ID> := <Expr>` | 同上 |
| `undef <ID1> <ID2> ...` | 删除一个或多个定义 |
| `rename <OldID> to <NewID>` | 重命名元素 |
| `clear` | 清空当前画板 |
| `eval <Expr>` | 求表达式值，用于计算/验证 |

### 对象上选点与交点

| 命令 | 说明 |
|------|------|
| `snap_point [<ID> :=] <Obj> near (<X>,<Y>)` | 在对象上选最靠近 (X,Y) 的点 |
| `intersect [<ID> :=] <ObjA> with <ObjB> near (<X>,<Y>)` | 定义两对象最靠近 (X,Y) 的交点 |

支持对象：Line、Circle、Segment、Ray、Arc、Ellipse、EllipticArc、Curve 等。

### 样式管理

| 命令 | 说明 |
|------|------|
| `check_style <Selector>` | 查看指定选择器的样式 |
| `style <SelectorList> { <Property>:<Value>; ... }` | 设置样式 |
| `unset_style <SelectorList>` | 清除样式 |

**选择器**：`Background`、`XAxis`、`YAxis`、`Grid`、`#<ID>`、`<Type>:label`、`#<ID>:label`。

### 帮助

| 命令 | 说明 |
|------|------|
| `help` | 默认帮助 |
| `help <Topic>` | 按主题查询（命令、类型、syntax、globals、transform 等） |

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
```
