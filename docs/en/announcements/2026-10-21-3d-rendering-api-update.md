---
title: 3D Rendering API Update — Degree Angles, Fixed Views, and Cropping
description: Generated projects include recommended views and bounds for direct export after optional editor adjustments. Also updates 3D angles, viewport defaults, and cropping; only 3D rendering is affected.
date: "2026-10-21"
modules: [api]
topics: [export, ai]
---

# 3D Rendering API Update — Degree Angles, Fixed Views, and Cropping

- Type: API change and usability improvements
- Published: 2026-10-21
- Effective: 2026-10-21
- Affected users: Developers exporting 3D slides through the Render API or MCP; only 3D rendering is affected
- Action required: Review angle fields, default dimensions, and fixed-view settings in existing 3D integrations

Previously, radian angles and difficult view and dimension settings made it hard to complete the workflow from drawing and saving a view to exporting a 3D image. This update addresses those problems with degree-based request angles, explicit fixed-view precedence, and cropping within a full viewport to make export framing easier to control consistently.

**Only 3D rendering is affected. Existing 2D rendering calls require no migration.** The endpoint remains `POST /api/render/v2`.

## Recommended Workflow: Generate → Optionally Adjust → Export Directly

**Generate a project with the intelligent drawing service, then call the image export API directly.** Generated projects include recommended fixed-view or bounds information. For 3D slides, this includes the export camera, viewport dimensions, and crop area. The export API reads these settings from the project, reducing the need to calculate and pass view parameters again and making the workflow from generation to image export smoother.

1. **Generate recommended framing**: Call the <a href="/en/api/agent-create" target="_blank" rel="noopener noreferrer">intelligent drawing service</a>, wait for the task to finish, and retrieve the complete project with its recommended fixed view or bounds through `artifactUrl`.
2. **Adjust in the editor (optional)**: Export the generated project directly, or adjust its fixed view, bounds, or crop in the editor. Save and retrieve the updated complete project. For 3D exports, the fixed view must be enabled; rotating the editing camera alone does not update export settings.
3. **Export without view parameters**: Send the generated or updated project as `content` to `POST /api/render/v2` and select `slideIndex`. **Omit both `view2D` and `view3D`.** The service reads the saved fixed bounds or enabled fixed view for the target slide type and exports the image.

Save the complete project as `project.algeo`, then use this recommended export request:

```bash
jq '{content: ., slideIndex: 1}' project.algeo | \
  curl -X POST https://api.dajiaoai.com/api/render/v2 \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    --data-binary @-
```

To increase output resolution, add top-level `pixelRatio` while continuing to omit `view2D` and `view3D`. Provide the corresponding view parameters only when a particular export needs a temporary framing override. The following sections explain those parameter changes and their usage.

## 3D API Changes

| Item | Previous usage | Current usage |
| --- | --- | --- |
| Horizontal angle | `view3D.yaw`, radians | `view3D.yawDeg`, degrees |
| Vertical angle | `view3D.pitch`, radians | `view3D.pitchDeg`, degrees |
| Oblique projection angle | `view3D.obliqueAngle`, radians | `view3D.obliqueAngleDeg`, degrees |
| Default viewport | `1024 × 1024` | Protocol default of `1920 × 1080`; explicit dimensions and enabled fixed-view dimensions take priority |
| Omitted camera fields | Use the slide’s saved camera | Resolve each field from explicit parameters, the enabled fixed view, then protocol defaults; rotating the editing camera no longer determines export framing |
| Crop area | No crop parameter | Set `view3D.crop` to a rectangle within the full logical viewport |

Request and response angles use different units: **requests use degrees; response `camera.yaw`, `camera.pitch`, and `camera.obliqueAngle` remain in radians**. Update both field names and values when migrating, for example from `yaw: 0.7853981633974483` to `yawDeg: 45`.

Set the output pixel ratio with top-level `pixelRatio`, which defaults to `1`. Nested `view3D.pixelRatio` remains supported and takes priority if both are provided.

## Set the Full Viewport, Then Crop the Output

`width` and `height` define the full logical viewport. `crop` selects a rectangle within it, with the origin at the top left. All four bounds must be provided and satisfy:

- `0 <= left < right <= width`
- `0 <= top < bottom <= height`

The service renders the full viewport before cropping. Cropping does not change the camera framing. Include the figure, labels, and annotations with a suitable margin when choosing the rectangle.

Save a complete project as `project.algeo`, with a 3D slide at index `1`, then use:

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

The crop measures `1000 × 600` logical pixels. With `pixelRatio: 2`, the final PNG is **2000 × 1200 pixels**. Adjust the camera and crop to fit your actual figure. The final physical PNG width and height after cropping must each be at most `2048` pixels; exceeding either limit returns HTTP `422` without automatic downscaling.

## Connecting Drawing, Fixed Views, and Export

When drawing 3D geometry through MCP, use `view_camera3d` to save a fixed view for presentation and export, including viewing angles, full viewport dimensions, and crop area. Fixed views are stored separately from editing views and can be reused for consistent exports.

Drawing guidance has also been updated: when no fixed view exists, recommend and save suitable dimensions and a crop after drawing, keeping figures and labels visible with less empty space. Existing fixed views are preserved unless the user requests changes.

## Migration Checklist

- Replace the three 3D request angle fields with their `*Deg` equivalents and convert values: `degrees = radians × 180 / π`.
- Specify `width` and `height` explicitly to preserve previous output dimensions instead of relying on changed defaults.
- Check whether the fixed view is enabled and whether its camera, dimensions, and crop match the export requirements.
- Continue interpreting response `camera` angles as radians.

See the <a href="/en/api/render-v2" target="_blank" rel="noopener noreferrer">PNG export API</a> for complete parameters and defaults. Use its Playground to verify the updated request format. For related SDK capabilities, see <a href="./2026-10-21-sdk-2-15-0-3d-view-export" target="_blank" rel="noopener noreferrer">SDK 2.15.0 Adds Fixed 3D Views and Expands Image Export</a>.
