---
title: REPL Capabilities
description: REPL command categories, geometry types, output format, syntax constraints - Dino-GSP
---

# REPL Capabilities

<DemoButton href="https://dajiaoai.github.io/algeo-sdk/examples/20-repl?mode=editor" label="Try REPL" />

REPL lets AI and developers draw, style, animate, and verify calculations through commands to quickly create interactive geometry content.

::: warning
REPL is supported only in editor mode. Presentation-mode support is incomplete and is not recommended.
:::

## Integration

Editor-mode `editor.repl()` is supported since SDK **2.15.0**.

```ts
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(container, { auth: { appId } });
const { output } = await editor.repl('def A := Point(0,0)');
```

```ts
editor.repl(command: string): Promise<{ output: string }>
```

Pass a REPL command string and receive `{ output: string }`, where `output` contains the result as text.

## Command Categories

### Help

Whenever you are unsure about command syntax, object types, style properties, or other usage, start with `help`. Use `help <Topic>` when you know the topic, or `search <keywords>` to find it.

| Command        | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `help`         | Default help                                                       |
| `help <Topic>` | Query by topic (commands, types, syntax, globals, transform, etc.) |
| `search <keywords>` / `help search <keywords>` | Search help topics and text; separate keywords with `\|` to match any, case-insensitively |

### Slide Management

| Command                         | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `list_slides`                   | List all slides (index, ID, definition count)          |
| `new_slide [idx]`               | Create a new slide, optionally at a specified position |
| `switch_slide <idOrIdx>`        | Switch to the specified slide                          |
| `dup_slide <idOrIdx> [tgtIdx]`  | Duplicate a slide                                      |
| `move_slide <idOrIdx> <tgtIdx>` | Reorder slides                                         |
| `del_slide <idOrIdx>`           | Delete a slide                                         |

idOrIdx: use **index** (1-based) or **ID** (e.g. `slide_abc123`).

### Definition Management

| Command                       | Description                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `list`                        | List all definitions on the current slide (ID, type, value, definition, label, visibility, etc.) |
| `def <ID> := <Expr>`          | Define or modify a geometric element                                                             |
| `def <ID> : <Type> := <Expr>` | Definition with type annotation                                                                  |
| `def <ID>.label := <Expr>`    | Define or modify an element label                                                                |
| `label <ID> := <Expr>`        | Same as above                                                                                    |
| `undef <ID1> <ID2> ...`       | Remove one or more definitions                                                                   |
| `rename <OldID> to <NewID>`   | Rename an element                                                                                |
| `clear`                       | Remove definitions and labels without resetting default styles or views                                                                          |
| `eval <Expr>`                 | Evaluate an expression for computation or verification                                           |

### Point Selection and Intersection on Objects

| Command                                                 | Description                                              |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `snap_point [<ID> :=] <Obj> near (<X>,<Y>)`             | Select the point on an object nearest to (X, Y)          |
| `intersect [<ID> :=] <ObjA> with <ObjB> near (<X>,<Y>)` | Define the intersection of two objects nearest to (X, Y) |

Supported objects: Line, Circle, Segment, Ray, Arc, Ellipse, EllipticArc, Curve, etc.

### Style Management

| Command                                            | Description                           |
| -------------------------------------------------- | ------------------------------------- |
| `check_style <Selector>`                           | View the style for the given selector |
| `style <SelectorList> { <Property>:<Value>; ... }` | Set style                             |
| `unset_style <SelectorList>`                       | Clear style                           |

**Selectors:** `Background`, `XAxis`, `YAxis`, `Grid`, `#<ID>`, `<Type>:label`, `#<ID>:label`.

### Status and Geometry Views

| Command | Description |
| --- | --- |
| `info` | Current slide, geometry mode, definition summary, and presets |
| `mode [2d\|3d]` | Query or switch the geometry view |
| `view_bounds` | Query 2D bounds, layout scale, camera, and viewport |
| `view_bounds (minX,maxX,minY,maxY,scale)` | Set finite 2D bounds and layout pixels per logical unit |
| `view_bounds infinite` | Switch to an infinite 2D canvas |
| `view_camera3d` | Query the 3D fixed view without changing it |
| `view_camera3d on` / `view_camera3d off` | Enable/disable the fixed view; disabling retains parameters |
| `view_camera3d { field: value; ... }` | Partially update and enable the fixed view |

`view_bounds` requires a 2D slide; `view_camera3d` requires a 3D slide. The fixed view saves a snapshot for presentation and export without changing the editing camera or creating expression dependencies. Fields include `offset`, `yawDeg`, `pitchDeg`, `scale`, `projection`, `obliqueAngleDeg`, `obliqueScaleRatio`, `width`, `height`, and `crop`. Projection accepts `"orthographic"`, `"perspective"`, or `"oblique"`; `crop: none` clears cropping.

### 3D Point Selection and Intersections

```text
snap_point P := sphere near (0, 0, 3)
intersect Q := line3d with sphere near (0, 0, 3)
intersect section := plane with sphere
```

Use `(x,y)` for 2D objects and `(x,y,z)` for 3D objects, regardless of the current view. Coordinates must evaluate to finite real numbers. Omitting the ID generates a name. Supported 3D snapping objects include Line3D, Segment3D, Circle3D, Curve3D, Plane3D, Polygon3D, Disk, Sphere, ConeSurface, and CylinderSurface. For solids, select a face first, such as `prism.sideFace(1)`.

Snapped points retain dependencies and draggable parameters; `near` initializes the point rather than storing a permanent target. Analytic intersections retain their chosen candidate index and do not reselect the nearest candidate after parent objects change. Numerical 2D intersections can depend on the starting position and convergence. Failure to find an intersection raises an error without adding the point.

Surface–surface intersections omit `near` and return a Line3D, Circle3D, or list of intersection curves, depending on the supported combination. Lists render directly and support `.size` and `.get(1)`; a single curve is not a list.

### Style Selectors and Presets

Additional selectors include `Point`, `Point3D`, `*:label`, `XAxis3D`, `YAxis3D`, `ZAxis3D`, and `WorkingPlane`. Use `Point.highlight` or `Point:label.highlight` to create or modify a preset, then `style #A { theme: "highlight"; }` to reference it. `theme: unset` removes the association. Clear an individual property with `unset`.

Type defaults affect future drawing and do not override existing per-object settings or inherited child styles. Use object IDs when changing existing objects. Type defaults cannot set `hidden`; use `style #A { hidden: true; }`. Use `list` to find generated sub-object IDs instead of using an expression such as `tri.edge(1)` as a selector.

### Events and Interaction

| Command | Description |
| --- | --- |
| `on <ID>.<event> do ... end` | Set an event handler |
| `check_event <ID>.<event>` | Query the handler |
| `blank_click_next_slide [on\|off]` | Query/set the file-level blank-click navigation option; default off |

Events support `wait`, `show`, `hide`, `toggle`, `draw`, slider `play` / `stop` / `set`, and `parallel do … end`.

## Geometry Types and Constructions

Use these construction expressions on the right-hand side of `def <ID> := <Expr>`. Angles use radians; append `°` for degrees, such as `60°`.

### Points

- `Point(x, y)`: fixed coordinates; `Point(?:=x, ?:=y)`: draggable point.
- `Point(Obj, t)`: point on a supported line, circle, arc, or curve; use `?:=value` for a draggable parameter.
- `Midpoint(A, B)`: midpoint of two points.

### Lines, Rays, and Segments

- `Line(P1, P2)`, `Line(y = 2*x + 1)`: two-point line or line equation.
- `Segment(P1, P2)`, `Ray(Start, Through)`: segment and ray.
- `PerpLine(LineOrSegmentOrRay, Point)`, `ParallelLine(LineOrSegmentOrRay, Point)`: perpendicular and parallel lines through a point.
- `PerpBisector(Segment)`: perpendicular bisector; `AngleBisector(Angle)`: angle-bisecting ray.
- `Tangent(CircleOrArcOrEllipseOrEllipticArc, Point, Index)`: select a tangent; the index is 1-based and defaults to 1 when omitted.

### Angles

- `Angle(A, Vertex, B)`: three-point angle, with the vertex second.
- `Angle(Vertex, StartPoint, AngleValue)`: vertex, initial direction, and angle value.

### Circles, Arcs, and Sectors

- `Circle(Center, Radius)`, `Circle(Center, Point)`: center and radius or a point on the circle.
- `Circumcircle(P1, P2, P3)`: circle through three points.
- `Arc(Center, Radius, StartAngle, EndAngle)`: center, radius, and endpoint angles.
- `Arc(Center, StartPoint, EndPoint)`: the first point is the center; the start point determines the radius and the end point determines the ending direction.
- `Semicircle(P1, P2)`: semicircular arc with the points as diameter endpoints.
- `Sector(Arc)`: region bounded by an arc and its two radii; returns `Region`, for example `Sector(Arc(Point(0,0), 2, 90°, 0°))`.

Arcs run clockwise, in the direction of decreasing angle, from start to end.

### Ellipses and Elliptic Arcs

- `Ellipse(Center, RadiusX, RadiusY, Rotation)`: center, semi-axis lengths, and rotation.
- `EllipseFromFoci(Focus1, Focus2, Point)`: two foci and a point on the ellipse.
- `EllipseFromAxes(AxisEnd1, AxisEnd2, Point)`: endpoints of one axis and a point on the ellipse.
- `EllipticArc(Center, RadiusX, RadiusY, Rotation, StartAngle, EndAngle)`: ellipse parameters and endpoint parameter angles.
- `EllipticArcFromFoci(Focus1, Focus2, StartPoint, EndPoint)`, `EllipticArcFromAxes(AxisEnd1, AxisEnd2, StartPoint, EndPoint)`: construct an elliptic arc from foci or axis endpoints.

Elliptic arcs use parameter angles, not the directions of lines from the center to the endpoints.

### Polygons

- `Polygon(P1, P2, P3, ...)`, `Polygon([P1, P2, P3, ...])`: vertices or a point list.
- `Polygon(A, B, NumEdges)`: regular polygon built counterclockwise with A and B as its first two vertices.
- `Parallelogram(P1, P2, P3)`: three consecutive vertices.

### Regions and Paths

- `Region("path data")`: construct a region from a path string.
- `PathBuilder(Point).lineTo(Point).close.buildRegion`: build a closed region; `.arcTo(Point, Circle, Sweep)` adds an arc segment.
- `Inter(A, B)`, `Unite(A, B)`, `Subtract(A, B)`, `Exclude(A, B)`: region intersection, union, difference, and exclusive-or.

Circles and polygons convert automatically to `Region` for region operations. Create sector regions with `Sector(Arc)`. Regions expose `.area` and `.centroid`.

### Segment Diagrams, Ticks, and Dimensions

- `SegmentDiagram(P1, P2)`: segment with endpoint ticks; returns `Segment`.
- `Tick(LineOrSegmentOrRay, Parameter)`: tick on a line object.
- `BraceDimension(P1, P2)` / `Dimension(P1, P2)`: brace dimension.
- `ArrowDimension(P1, P2)`: double-arrow dimension; ticks convert automatically to endpoint points.

### Curves

- `Curve(y = x^2)`, `Curve(x = y^2)`, `Curve(x^2)`: explicit curves.
- `Curve(x^2, Start, End)`: explicit curve with a specified parameter interval.
- `Curve(cos(t), sin(t), Start, End)`: parametric curve using free variable `t`; an interval is required.
- `Curve(x^2 + y^2 = 4)`: implicit curve; this form does not accept interval parameters.

### Transformations

- `Translate(Obj, Vector)`: translate, using `Point(dx, dy)` for a 2D vector.
- `Rotate(Obj, AngleValue, Center)`, `Scale(Obj, Factor, Center)`: rotate and scale.
- `Reflect(Obj, Point)`, `Reflect(Obj, LineOrSegmentOrRay)`: point and line reflection.

These transformations also accept lists of geometry objects of the same type.

### Intersections

- `Intersect(A, B, Index)`: indexed intersection for supported object combinations; indices start at 1.
- `Intersect(A, B)`: intersection list for supported combinations; evaluate with `eval Intersect(A, B)`.
- `IntersectLine(SurfaceA, SurfaceB)`: 3D surface intersection; returns a single curve or a list depending on the combination.

### 3D Geometry

Spatial constructions use `Point3D` and display in the `mode 3d` view.

- `Point3D(x, y, z)`, `Point3D(?:=x, ?:=y, ?:=z)`: fixed and draggable points.
- `Line3D(A, B)`, `Segment3D(A, B)`, `Angle3D(A, Vertex, B)`: spatial lines, segments, and angles.
- `Plane3D(A, B, C)`, `Plane3D(Line, Point)`, `Polygon3D([A, B, C, ...])`: planes and spatial polygons.
- `Circle3D(Center, NormalLine, Radius)`, `Circumcircle3D(A, B, C)`: spatial circles.
- `Disk(Center, Axis)`: circular disk; `Axis` is a normal vector whose length is the radius, expressed as a `Point3D`.
- `Sphere(Center, Radius)`, `Sphere(Center, Point)`: spheres.
- `ConeSurface(BaseCenter, Apex, Radius)`, `CylinderSurface(BaseCenter, TopCenter, Radius)`: lateral surfaces.
- `Pyramid(BasePolygon, Apex)`, `Prism(BasePolygon, TopFirst)`: pyramid and prism; `TopFirst` corresponds to the first base vertex.
- `Cube(A, B, C)`, `Cuboid(A, B, C, TopOfC)`, `RegularTetrahedron(A, B, C)`: cube, cuboid, and regular tetrahedron; A, B, C are consecutive base vertices and must satisfy the corresponding geometric constraints.
- `Cone(BaseCenter, Apex, Radius)`, `Cylinder(BaseCenter, TopCenter, Radius)`: cone and cylinder; also accept `Cone(BaseCircleOrDisk, Height)` and `Cylinder(BaseCircleOrDisk, Height)`.
- `Curve3D(cos(t), sin(t), t, Start, End)`: spatial parametric curve.

## Labels and Text

- `def <ID> := "<string>"`: Text object
- Label templates: `"{{id}}"`, `"{{x}}"`, `"{{y}}"`, `"{{length}}"`, etc.
- Supports `{{Expr}}` for referencing expressions

## Output Format

- **Table**: `list`, `list_slides`, `check_style`, etc. output in table format
- **Single line**: `def`, `eval`, `style`, etc. return a single line or brief description
- **Help**: `help` returns Markdown text

`list` output columns: ID, type, value, definition, label, visibility, is-child.

## Input and Execution Behavior

- Use `editor.repl(command)` in the SDK, passing one complete command per call.
- MCP/Agent calls accept ordered `commands[]`. A failed item does not stop later items; check each result's `success` and output rather than relying on the top-level status.
- The SDK rejects empty or whitespace-only commands. Nonempty comment-only commands return empty output; MCP skips empty commands.
- `--` starts a comment; `#` does not.
- Help topics are case-insensitive and normalize underscores, for example `help LIST_SLIDES`.

## Syntax and Constraints

- **Comments**: `--` for single-line comments
- **Identifiers**: Must start with a letter; may contain digits and underscores
- **Coordinates**: The unit-to-pixel ratio depends on the canvas and camera. Query `view_bounds` before 2D layout instead of assuming 50 px per unit.
- **Lists**: Indices start at 1. `.flat` is a property without parentheses. Use `Range` or `List.iterate` for bulk generation.
- **Geometric constraints**: Prefer geometric constructions over coordinate approximations
