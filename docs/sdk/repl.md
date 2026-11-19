---
title: REPL 能力
description: REPL 接入方式、命令能力、动画与交互、输出与错误约定 - 大角几何
---

# REPL 能力

<DemoButton href="https://dajiaoai.github.io/algeo-sdk/examples/20-repl?mode=editor" label="体验 REPL" />

通过 REPL，AI 和开发者可以用命令自动绘图、调整样式、编排动画并验证计算结果，快速生成可交互的几何内容。

::: warning
REPL 仅支持在编辑模式下使用；演示模式下支持不完整，不推荐使用。
:::

## 接入方式

编辑模式的 `editor.repl()` 自 SDK **2.15.0** 起支持。

```ts
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(container, { auth: { appId } });
const { output } = await editor.repl('def A := Point(0,0)');
```

```ts
editor.repl(command: string): Promise<{ output: string }>
```

输入为一条 REPL 命令字符串，返回 `{ output: string }`，其中 `output` 为执行结果的文本。

## 命令分类

### 帮助

遇到任何不确定的用法，例如命令语法、对象类型或样式属性，都可以先使用 `help` 查询。知道主题时使用 `help <Topic>`；不确定主题名称时，使用 `search <关键词>` 搜索。

| 命令           | 说明                                                    |
| -------------- | ------------------------------------------------------- |
| `help`         | 默认帮助                                                |
| `help <Topic>` | 按主题查询（命令、类型、syntax、globals、transform 等） |
| `search <关键词>` / `help search <关键词>` | 搜索帮助主题和正文；多个关键词用 `\|` 分隔，匹配任一关键词，忽略大小写 |

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
| `clear`                       | 删除当前画板所有定义及标签，不重置默认样式或视图                                               |
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

### 状态查询

- `info`：查询当前画板、2D/3D 模式、定义摘要及预设样式。

### 空间选点与求交

```text
snap_point P := sphere near (0, 0, 3)
intersect Q := line3d with sphere near (0, 0, 3)
intersect section := plane with sphere
```

二维对象使用 `near (x,y)`，空间对象使用 `near (x,y,z)`，与当前视图无关；坐标须求值为有限实数。省略 ID 时自动命名。空间选点支持 Line3D、Segment3D、Circle3D、Curve3D、Plane3D、Polygon3D、Disk、Sphere、ConeSurface、CylinderSurface。实体应先取面，例如 `prism.sideFace(1)`。

选点保留对象依赖和可拖动参数；`near` 只用于创建时初始化，不是持续吸附目标。解析交点保留候选索引，父对象变化后不会重新按原 `near` 位置选择；二维数值求交还受初始位置和收敛影响。未找到交点时报错，不创建交点定义。

面与面求交线不使用 `near`，按对象组合返回单个 Line3D、Circle3D 或交线列表。列表会自动渲染，可用 `.size` 查询数量、`.get(1)` 取第一项；单个交线对象没有列表的 `.size`。

### 样式选择器与预设

其他选择器包括 `Point`、`Point3D`、`*:label`、`XAxis3D`、`YAxis3D`、`ZAxis3D`、`WorkingPlane`。使用 `Point.强调` 或 `Point:label.强调` 创建、修改预设，再通过 `style #A { theme: "强调"; }` 引用已有预设。`theme: unset` 取消关联；任意样式属性可用 `unset` 清除。

类型默认样式会影响后续作图，不会覆盖已有的单独样式或子对象继承样式。只调整已有对象时使用对象 ID。类型默认样式不允许设置 `hidden`；隐藏对象使用 `style #A { hidden: true; }`。子对象样式需通过 `list` 查找实际 ID，不能直接将 `tri.edge(1)` 这样的表达式用作样式选择器。

### 几何模式与视图

| 命令 | 说明 |
| --- | --- |
| `mode [2d\|3d]` | 查询或切换几何视图 |
| `view_bounds` | 查询 2D 范围、排版比例、相机和视口 |
| `view_bounds (minX,maxX,minY,maxY,scale)` | 设置 2D 有限画布，scale 为每逻辑单位的排版像素数 |
| `view_bounds infinite` | 设置无限画布 |
| `view_camera3d` | 查询 3D 固定视图，不修改设置 |
| `view_camera3d on` / `view_camera3d off` | 启用/停用固定视图；停用时保留参数 |
| `view_camera3d { field: value; ... }` | 局部更新并启用固定视图 |

`view_bounds` 仅用于 2D，`view_camera3d` 仅用于 3D。固定视图保存演示与导出所用的参数快照，不改变当前编辑相机，不建立表达式依赖。字段包括 `offset`、`yawDeg`、`pitchDeg`、`scale`、`projection`、`obliqueAngleDeg`、`obliqueScaleRatio`、`width`、`height`、`crop`。投影类型为 `"orthographic"` / `"perspective"` / `"oblique"`；`crop: none` 取消裁剪。

### 事件与交互

| 命令 | 说明 |
| --- | --- |
| `on <ID>.<event> do ... end` | 设置事件处理程序 |
| `check_event <ID>.<event>` | 查询事件处理程序 |
| `blank_click_next_slide [on\|off]` | 查询或设置文件级“点击空白处翻页”选项，默认关闭 |

事件支持 `wait`、`show`、`hide`、`toggle`、`draw`、滑动条的 `play` / `stop` / `set` 及 `parallel do … end`。

## 几何类型与构造

以下为常用构造表达式，可作为 `def <ID> := <Expr>` 的右侧。角度参数默认使用弧度，角度制数值需加 `°`，如 `60°`。

### 点

- `Point(x, y)`：固定坐标点；`Point(?:=x, ?:=y)`：可拖动点。
- `Point(Obj, t)`：支持的线、圆、弧或曲线上的点；使用 `?:=初值` 使参数可拖动。
- `Midpoint(A, B)`：两点的中点。

### 直线、射线与线段

- `Line(P1, P2)`、`Line(y = 2*x + 1)`：两点直线或直线方程。
- `Segment(P1, P2)`、`Ray(Start, Through)`：线段和射线。
- `PerpLine(LineOrSegmentOrRay, Point)`、`ParallelLine(LineOrSegmentOrRay, Point)`：过点作垂线、平行线。
- `PerpBisector(Segment)`：垂直平分线；`AngleBisector(Angle)`：角平分射线。
- `Tangent(CircleOrArcOrEllipseOrEllipticArc, Point, Index)`：选择一条切线；索引从 1 开始，可省略，默认 1。

### 角

- `Angle(A, Vertex, B)`：由三点构造角，第二个点是顶点。
- `Angle(Vertex, StartPoint, AngleValue)`：由顶点、起始方向上的点和角度值构造角。

### 圆、圆弧与扇形

- `Circle(Center, Radius)`、`Circle(Center, Point)`：由圆心和半径或圆上一点构造圆。
- `Circumcircle(P1, P2, P3)`：三点外接圆。
- `Arc(Center, Radius, StartAngle, EndAngle)`：由圆心、半径和起止角构造圆弧。
- `Arc(Center, StartPoint, EndPoint)`：第一点为圆心，半径取圆心到起点的距离；终点参数确定结束方向。
- `Semicircle(P1, P2)`：以两点为直径端点构造半圆弧。
- `Sector(Arc)`：由圆弧及其两条半径构造扇形区域，返回 `Region`，例如 `Sector(Arc(Point(0,0), 2, 90°, 0°))`。

圆弧沿角度减小的方向（顺时针）从起始角走到结束角。

### 椭圆与椭圆弧

- `Ellipse(Center, RadiusX, RadiusY, Rotation)`：中心、两个半轴长度和旋转角。
- `EllipseFromFoci(Focus1, Focus2, Point)`：两焦点和椭圆上一点。
- `EllipseFromAxes(AxisEnd1, AxisEnd2, Point)`：一条轴的两个端点和椭圆上一点。
- `EllipticArc(Center, RadiusX, RadiusY, Rotation, StartAngle, EndAngle)`：椭圆参数及起止参数角。
- `EllipticArcFromFoci(Focus1, Focus2, StartPoint, EndPoint)`、`EllipticArcFromAxes(AxisEnd1, AxisEnd2, StartPoint, EndPoint)`：由焦点或轴端点构造椭圆弧。

椭圆弧的起止角为参数角，不是点与中心连线的方向角。

### 多边形

- `Polygon(P1, P2, P3, ...)`、`Polygon([P1, P2, P3, ...])`：由顶点或点列表构造多边形。
- `Polygon(A, B, NumEdges)`：以 A、B 为前两个顶点，逆时针构造正多边形。
- `Parallelogram(P1, P2, P3)`：三个连续顶点构造平行四边形。

### 区域与路径

- `Region("路径数据")`：从路径字符串构造区域。
- `PathBuilder(Point).lineTo(Point).close.buildRegion`：逐段构造闭合区域；也支持 `.arcTo(Point, Circle, Sweep)` 圆弧段。
- `Inter(A, B)`、`Unite(A, B)`、`Subtract(A, B)`、`Exclude(A, B)`：区域交集、并集、差集和异或。

圆和多边形可自动转换为 `Region` 参与区域运算；扇形通过 `Sector(Arc)` 创建。区域支持 `.area` 和 `.centroid`。

### 线段图、刻度与尺寸标注

- `SegmentDiagram(P1, P2)`：带两个端点刻度的线段图，返回 `Segment`。
- `Tick(LineOrSegmentOrRay, Parameter)`：在线对象上创建刻度。
- `BraceDimension(P1, P2)` / `Dimension(P1, P2)`：大括号尺寸标注。
- `ArrowDimension(P1, P2)`：双箭头尺寸标注；刻度可自动转换为端点。

### 曲线

- `Curve(y = x^2)`、`Curve(x = y^2)`、`Curve(x^2)`：显函数。
- `Curve(x^2, Start, End)`：限定显函数的参数范围。
- `Curve(cos(t), sin(t), Start, End)`：使用自由变量 `t` 的参数曲线，必须指定范围。
- `Curve(x^2 + y^2 = 4)`：隐函数曲线；隐函数形式不接受区间参数。

### 变换

- `Translate(Obj, Vector)`：平移，二维向量用 `Point(dx, dy)` 表示。
- `Rotate(Obj, AngleValue, Center)`、`Scale(Obj, Factor, Center)`：旋转和缩放。
- `Reflect(Obj, Point)`、`Reflect(Obj, LineOrSegmentOrRay)`：中心对称和轴对称。

上述变换也可作用于同类型几何对象的列表。

### 交点与交线

- `Intersect(A, B, Index)`：支持的对象组合的指定交点，索引从 1 开始。
- `Intersect(A, B)`：支持的对象组合的交点列表，可用 `eval Intersect(A, B)` 求值。
- `IntersectLine(SurfaceA, SurfaceB)`：空间面对象的交线，返回单个交线或列表，取决于对象组合。

### 立体几何

空间构造使用 `Point3D`；在 `mode 3d` 视图中显示。

- `Point3D(x, y, z)`、`Point3D(?:=x, ?:=y, ?:=z)`：固定坐标点和可拖动点。
- `Line3D(A, B)`、`Segment3D(A, B)`、`Angle3D(A, Vertex, B)`：空间直线、线段和角。
- `Plane3D(A, B, C)`、`Plane3D(Line, Point)`、`Polygon3D([A, B, C, ...])`：平面与空间多边形。
- `Circle3D(Center, NormalLine, Radius)`、`Circumcircle3D(A, B, C)`：空间圆。
- `Disk(Center, Axis)`：圆面片；`Axis` 为法向量，长度为半径，用 `Point3D` 表示。
- `Sphere(Center, Radius)`、`Sphere(Center, Point)`：球面。
- `ConeSurface(BaseCenter, Apex, Radius)`、`CylinderSurface(BaseCenter, TopCenter, Radius)`：锥面和柱面。
- `Pyramid(BasePolygon, Apex)`、`Prism(BasePolygon, TopFirst)`：棱锥和棱柱，`TopFirst` 是第一个底面顶点对应的顶面点。
- `Cube(A, B, C)`、`Cuboid(A, B, C, TopOfC)`、`RegularTetrahedron(A, B, C)`：立方体、长方体和正四面体；A、B、C 为底面连续顶点，并须满足相应几何约束。
- `Cone(BaseCenter, Apex, Radius)`、`Cylinder(BaseCenter, TopCenter, Radius)`：圆锥和圆柱；也支持 `Cone(BaseCircleOrDisk, Height)`、`Cylinder(BaseCircleOrDisk, Height)`。
- `Curve3D(cos(t), sin(t), t, Start, End)`：空间参数曲线。

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

- AlgeoSDK 的 `editor.repl(command)` 按单条命令执行。
- MCP/Agent 的 `algeo_repl` 按 `commands[]` 顺序执行；单条失败后继续后续命令，应检查每项结果的 `success` 和输出，不能只检查顶层状态。
- SDK 拒绝空字符串和纯空白；非空的纯注释命令返回空输出。MCP 中空命令会跳过。
- `#` 不是注释语法，会触发语法错误。
- `help` 主题不区分大小写，且会对下划线做归一化（例如 `help LIST_SLIDES`）。

## 语法与约束

- **注释**：`--` 单行注释
- **标识符**：字母开头，可含数字、下划线
- **坐标**：逻辑单位与像素的比例取决于画布和相机；2D 排版先查询 `view_bounds`，不要固定假设为 50px。
- **列表**：下标从 1 开始；`.flat` 是属性，不加括号。用 `Range`、`List.iterate` 批量构造。
- **几何约束**：优先用几何构造，避免用坐标近似
