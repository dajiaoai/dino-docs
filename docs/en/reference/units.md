---
title: Size Units and Conversion
description: The px unit standard and px/pt converter for font sizes and line widths across the Dino-GSP SDK, API, and MCP
---

# Size Units and Conversion

When you set font sizes, line widths, or exported image dimensions through the Dino-GSP Open Platform, the relevant parameters generally use `px`. If your design file, typesetting software, or print specification uses `pt`, convert those values to `px` before passing them to Dino-GSP.

::: tip Quick answer
- Setting font size, line width, or the displayed size of a point or marker: use px.
- Specifying the width and height of an exported raster image: use px.
- Working from a typesetting or print value in pt: convert it to px before filling the parameter.
- Setting geometry coordinates, geometric lengths, or view bounds: use logical canvas coordinates and do not perform px/pt conversion.
:::

## Use px for visual dimensions

When you control the displayed size of text, lines, or other canvas elements, use **px (pixels)**, including:

- font sizes;
- line widths and borders;
- the visual size of points, markers, and similar objects;
- the pixel width and height of exported raster images.

In SDK, API, MCP, and project-file data, these fields normally accept numbers. If a font-size field has the value `16`, read it as `16 px`, not `16 pt`. Unless the relevant interface documentation says otherwise, pass the number `16` rather than a string such as `"16px"` or `"12pt"`.

::: warning Not every number is a px value
If you are setting geometric point coordinates, geometric lengths, or canvas view bounds, those values use logical canvas coordinates rather than px and do not need pt conversion. Before filling a parameter, check its interface documentation to determine whether it represents a visual size, output pixels, or logical coordinates.
:::

## Where you need to pay attention to units

| When you use | You may need to set | What to do |
| --- | --- | --- |
| Embedded canvas and editor | Font size, line width, and the displayed size of points and markers | Enter px values for visual styles; control iframe dimensions with your host page's CSS |
| SDK and project-file protocol | Visual style dimensions of canvas objects | Enter px values for style dimensions; use logical coordinates for point positions and geometric lengths |
| API rendering and image export | Output image dimensions, font sizes, and line widths inside the image | Fixed output and returned image dimensions use px; view parameters such as `viewBound` use logical coordinates |
| MCP, REPL, and AI drawing | Font sizes, line widths, and related styles set through instructions or tools | Use px for style dimensions and logical coordinates for mathematical coordinates and lengths |
| Typesetting and print | Font sizes, line widths, and final physical dimensions | Convert pt to px before filling Dino-GSP parameters; account for DPI separately for raster output |

## Understanding px

`px` is the pixel unit commonly used by web pages and canvases. You can use it to express a visual size on screen or the output dimensions of a raster image.

However, `1 px` is not necessarily one physical display pixel and does not inherently represent a fixed length on paper. Device pixel ratio, browser zoom, canvas camera zoom, and export settings can all affect the final displayed or output size.

- For font sizes and line widths, px describes the standard visual size.
- For raster-output `width` and `height`, px describes the actual number of image pixels.
- For geometry coordinates and view bounds, values are not px; rendering maps them to pixels according to the canvas scale.

## Understanding and handling pt

`pt` (point) is an absolute unit commonly used in typesetting and print, where `1 pt = 1/72 in`. Dino-GSP size parameters do not use pt directly. When your design or typesetting specification provides pt values, convert them using the CSS absolute-unit ratio:

```text
96 px = 72 pt = 1 in

pt = px × 0.75
px = pt × 96 ÷ 72 = pt × 4 ÷ 3
```

For example, a `12 pt` print font converts to `16 px`, so the Dino-GSP font-size parameter should contain the numeric value `16`.

## Converter

<UnitConverter />

Edit either value to update the other automatically. Results use up to three decimal places.

## Filling integration parameters

When you fill a font size, line width, or other visual dimension in SDK, API, or MCP data, convert any pt value you have to px first. The following is illustrative; use the field names documented for the interface you are calling:

```json
{
  "fontSize": 16,
  "strokeWidth": 0.667
}
```

These values correspond to a `12 pt` font size and a `0.5 pt` line width.

## Precision and print considerations

- Keep 2–3 decimal places in protocol values. Do not round fine line widths to integers too early, as this can introduce substantial error.
- The px/pt conversion aligns the meaning of dimension parameters. Final physical size may still be affected by scaling during export, placement, or printing.
- Raster printing also depends on DPI. For a specified physical size, use `pixels = pt ÷ 72 × DPI`. This sampling calculation is separate from the protocol's px/pt size conversion.
- After placing an export in typesetting software, check for automatic scaling and proof the actual output size before production printing.
