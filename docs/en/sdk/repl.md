---
title: REPL Capabilities
description: REPL command categories, geometry types, output format, syntax constraints - Dino-GSP
---

# REPL Capabilities

REPL (Read-Eval-Print Loop) is the Dino-GSP canvas's **interactive command interface**, providing full canvas control for AI and developers. Execute a single command via the SDK's `repl` method; output is in **AI-oriented document/text format** (tables, structured text) for easy parsing and decision-making.

## Integration

```javascript
import { createPresentation } from '@dajiaoai/algeo-sdk';

const presentation = await createPresentation(container, {
  auth: { appId },
});

await presentation.loadShareById('33TA3484');
const { output } = await presentation.repl('help');
```

Each call executes a **single** command. On error the promise rejects; see [Protocol Reference - Error Codes](../api/protocol#error-codes).

## Command Categories

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
| `clear`                       | Clear the current slide                                                                          |
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

### Help

| Command        | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `help`         | Default help                                                       |
| `help <Topic>` | Query by topic (commands, types, syntax, globals, transform, etc.) |

## Geometry Types and Constructions

### Points

- `Point(x, y)`: Fixed point
- `Point(?:=x, ?:=y)`: Free point (draggable)
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

- `Intersect(A, B, Index)`: Intersection of elementary geometric objects; Index is 1-based
- `eval Intersect(A, B)`: List all intersections

## Labels and Text

- `def <ID> := "<string>"`: Text object
- Label templates: `"{{id}}"`, `"{{x}}"`, `"{{y}}"`, `"{{length}}"`, etc.
- Supports `{{Expr}}` for referencing expressions

## Output Format

- **Table**: `list`, `list_slides`, `check_style`, etc. output in table format
- **Single line**: `def`, `eval`, `style`, etc. return a single line or brief description
- **Help**: `help` returns Markdown text

`list` output columns: ID, type, value, definition, label, visibility, is-child.

## Syntax and Constraints

- **Comments**: `--` for single-line comments
- **Identifiers**: Must start with a letter; may contain digits and underscores
- **Coordinates**: 1 unit ≈ 50 px; recommend staying within ±10
- **Geometric constraints**: Prefer geometric constructions over coordinate approximations

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

-- Define geometric objects
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
