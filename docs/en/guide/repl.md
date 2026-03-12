---
title: REPL Capabilities
description: REPL command categories, geometry types, output format, syntax constraints - Dino-GSP
---

# REPL Capabilities

REPL (Read-Eval-Print Loop) is the Dino-GSP canvas’s **interactive command interface**, providing full control over the canvas for AI and developers. Execute single commands via the SDK’s `repl` method; output is in **AI-oriented document/text format** (tables, structured text) for easy parsing and decision-making.

## Integration

```javascript
const sdk = await AlgeoSdk.create(container);
const { output } = await sdk.repl('help');
const { output } = await sdk.repl('list');
const { output } = await sdk.repl('def A := Point(0,0)');
```

Each call executes a **single** command. On error, the promise rejects; see [Protocol - Error Codes](../api/protocol#error-codes).

## Command Categories

### Slide Management

| Command | Description |
|---------|-------------|
| `list_slides` | List all slides (index, ID, definition count) |
| `new_slide [idx]` | Create new slide, optionally at position |
| `switch_slide <idOrIdx>` | Switch to specified slide |
| `dup_slide <idOrIdx> [tgtIdx]` | Duplicate slide |
| `move_slide <idOrIdx> <tgtIdx>` | Move slide order |
| `del_slide <idOrIdx>` | Delete slide |

idOrIdx: use **index** (1-based) or **ID** (e.g. `slide_abc123`).

### Definition Management

| Command | Description |
|---------|-------------|
| `list` | List all definitions on current slide (ID, type, value, definition, label, visibility, etc.) |
| `def <ID> := <Expr>` | Define or modify geometry element |
| `def <ID> : <Type> := <Expr>` | Definition with type annotation |
| `def <ID>.label := <Expr>` | Define/modify element label |
| `label <ID> := <Expr>` | Same as above |
| `undef <ID1> <ID2> ...` | Remove one or more definitions |
| `rename <OldID> to <NewID>` | Rename element |
| `clear` | Clear current slide |
| `eval <Expr>` | Evaluate expression for computation/verification |

### Point Selection and Intersection on Objects

| Command | Description |
|---------|-------------|
| `snap_point [<ID> :=] <Obj> near (<X>,<Y>)` | Select point on object nearest to (X,Y) |
| `intersect [<ID> :=] <ObjA> with <ObjB> near (<X>,<Y>)` | Define intersection of two objects nearest to (X,Y) |

Supported objects: Line, Circle, Segment, Ray, Arc, Ellipse, EllipticArc, Curve, etc.

### Style Management

| Command | Description |
|---------|-------------|
| `check_style <Selector>` | View style for given selector |
| `style <SelectorList> { <Property>:<Value>; ... }` | Set style |
| `unset_style <SelectorList>` | Clear style |

**Selectors:** `Background`, `XAxis`, `YAxis`, `Grid`, `#<ID>`, `<Type>:label`, `#<ID>:label`.

### Help

| Command | Description |
|---------|-------------|
| `help` | Default help |
| `help <Topic>` | Query by topic (commands, types, syntax, globals, transform, etc.) |

## Geometry Types and Constructions

### Points

- `Point(x, y)`: Fixed point
- `Point(?:=x, ?:=y)`: Draggable point
- `MidPoint(A, B)`: Midpoint

### Lines

- `Line(P1, P2)`, `Segment(P1, P2)`, `Ray(Start, Through)`
- `PerpLine(Line, Point)`, `ParallelLine(Line, Point)`, `PerpBisector(Segment)`
- `Tangent(CircleOrArc, Point)`, `AngleBisector<Angle>`

### Circles and Arcs

- `Circle(Center, Radius)` / `Circle(Center, Point)`
- `Circumcircle(P1, P2, P3)`, `Arc(...)`, `SemiCircle(P1, P2)`

### Polygons

- `Polygon(...Points)`, `Polygon(A, B, NumEdges)`, `Parallelogram(P1, P2, P3)`

### Curves

- Explicit: `Curve(y=x²)`
- Parametric: `Curve(x(t), y(t), start, end)`
- Implicit: `Curve(f(x,y)=0)`

### Transformations

- `Translate(Obj, Point)`, `Rotate(Obj, Angle, Center)`, `Reflect(Obj, Line)`, `Scale(Obj, Factor, Center)`

### Intersections

- `Intersect(A, B, Index)`: Intersection of elementary geometry objects; Index is 1-based
- `eval Intersect(A, B)`: List all intersections

## Labels and Text

- `def <ID> := "<string>"`: Text object
- Label templates: `"{{id}}"`, `"{{x}}"`, `"{{y}}"`, `"{{length}}"`, etc.
- Supports `{{Expr}}` for expression references

## Output Format

- **Tables**: `list`, `list_slides`, `check_style`, etc. output in table form
- **Single line**: `def`, `eval`, `style`, etc. return a single line or brief description
- **Help**: `help` returns Markdown text

Example `list` columns: ID, type, value, definition, label, visibility, whether sub-object.

## Syntax and Constraints

- **Comments**: `--` for single-line comments
- **Identifiers**: Start with letter, may include digits and underscores
- **Coordinates**: 1 unit ≈ 50px; recommended range ±10
- **Geometry constraints**: Prefer geometric constructions over coordinate approximations

## Quick Examples

```
-- Query help
help
help Point
help Curve

-- Slide operations
list_slides
new_slide
switch_slide 1

-- Define geometry objects
def A := Point(0,0)
def B := Point(1,0)
def l := Line(A,B)
def c := Circle(A, 2)

-- Intersection
def P := Intersect(l, c, 1)

-- Labels
label A := "{{id}}"

-- Styles
style XAxis, YAxis { show: true; }
style #A { color: #FF0000; pointSize: 7; }

-- Query and verify
list
eval A.x + B.x
```
