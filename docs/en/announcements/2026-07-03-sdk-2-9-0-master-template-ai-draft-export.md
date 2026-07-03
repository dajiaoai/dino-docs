---
title: SDK 2.9.0 Updates Master Templates, AI Drafts, and Export Formats
description: SDK 2.9.0 adds master template APIs for embedded modes, AI draft set and clear support in editor mode, and SVG / LaTeX export formats.
---

# SDK 2.9.0 Updates Master Templates, AI Drafts, and Export Formats

- Type: New capability
- Published: 2026-07-03
- Effective date: 2026-07-03
- Audience: Developers using SDK 2.x editor mode, presentation mode, AI Chat, or slide export
- Action required: To use these new capabilities, upgrade to `@dajiaoai/algeo-sdk@2.9.0` or later and update host-side calls as needed

## What Changed

SDK 2.9.0 includes three updates:

1. **Embedded modes can set master template styles**: editor mode adds `editor.mode.setMasterTemplate(template)`, and presentation mode adds `presentation.mode.setMasterTemplate(template)`, helping align canvas backgrounds, grids, and default object styles.
2. **AI Chat supports setting and clearing drafts**: editor mode adds `editor.ai.setDraft(draft)` and `editor.ai.clearDraft()`. The host page can preload prompts and images into the AI panel, while users can still edit the draft before starting the AI conversation.
3. **Slide export supports SVG and LaTeX**: `editor.slides.exportImage(options)` now supports `svg` and `latex` in `format`, useful for web display, document layout, design-tool editing, and question-bank production.

## Use Cases

- Keep canvas backgrounds, grids, and default geometry styles consistent across host products or documents
- Preload prompts and images into AI Chat after identifying the current geometry figure
- Export geometry figures as scalable, editable, or layout-friendly SVG / LaTeX content
- Add more stable export formats to question-bank, exam-paper, handout, and courseware production workflows

## How to Start

1. Upgrade to `@dajiaoai/algeo-sdk@2.9.0` or later.
2. To set a master template, call `editor.mode.setMasterTemplate(template)` or `presentation.mode.setMasterTemplate(template)`.
3. To preload the AI panel, call `editor.ai.setDraft({ text, images, openPanel, focus })`.
4. To clear the AI draft, call `editor.ai.clearDraft()`.
5. To export SVG or LaTeX, call `editor.slides.exportImage({ format: 'svg' })` or `editor.slides.exportImage({ format: 'latex' })`.

## Related Links

- [Editor Mode](/en/sdk/2/editor)
- [Presentation Mode](/en/sdk/2/presentation)
- [AI Chat in Editor](/en/sdk/2/ai-chat)
- [SDK Examples](https://dajiaoai.github.io/algeo-sdk/)
