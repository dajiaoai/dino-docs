---
title: Capabilities
description: Review the current capability range and public availability of Dino-GSP Open Platform
---

# Capabilities

Dino-GSP Open Platform provides a full-stack interaction capability set ranging from low-level rendering to high-level AI collaboration. These capabilities are organized into the following core modules to meet different depths of integration needs.

## 1. Geometry Canvas Embedding

The fastest way to integrate the Dino-GSP geometry canvas into a web product, with multi-device support and deep interaction customization.

### Presentation Mode

Designed for courseware display, problem walkthroughs, and content playback.

- **Lightweight loading**: Optimized rendering performance for instant display even with complex figures.
- **Full dynamic interaction**: Not just static figures — supports dragging, parameter linkage, and animation playback.
- **Multi-device response**: Fully adapted for both PC and mobile (gesture zoom, touch interaction).
- **State snapshot**: Save and restore specific teaching states of the canvas.

### Editor Mode

A productivity tool integration solution for educational content creators.

- **Complete toolbox**: Built-in full set of geometry construction tools including lines, circles, conics, function graphs, and more.
- **Configurable UI components**: Customize which toolbar items are shown or hidden to fit different embedding scenarios.
- **Content export**: Export editing results as standard structured protocol data (JSON) or high-resolution images.
- **History management**: Integrated undo/redo management reduces integration complexity.

## 2. API Services and Data Protocol

Achieve programmatic control of mathematical logic through standardized data mapping.

- **Structured representation protocol**: Defines a standard DSL for geometric figures and mathematical logic, enabling cross-platform data relay and reproduction.
- **Content rendering service** _(planned)_: Cloud-based service for converting geometry content to images or vector graphics.
- **Geometry problem parsing** _(planned)_: Intelligent interface that automatically converts structured geometric constraints into canvas content.
- **Data analytics dashboard** _(planned)_: Track student interactions on the canvas and generate learning-path analysis reports.

## 3. AI Integration and Intelligent Collaboration

Dino-GSP is an AI-native geometry engine, offering multiple ways to deeply integrate with large language models (LLMs) or intelligent agents.

### Model Context Protocol (MCP)

Let AI directly "own" geometry operation capabilities through a standardized MCP interface.

- **Tool calls**: Allow models to create, modify, or query geometric objects directly through instructions.
- **Resource association**: Use the canvas state as live context for AI, improving model reasoning accuracy in mathematical geometry.

### Skills

Skill packages tailored for specific AI scenarios.

- **Intelligent problem-solving skill**: Assists AI in reasoning through geometry proof steps in combination with canvas logic.
- **Auto-drawing skill**: Automatically generates precise geometric construction sequences from natural language descriptions.
- **Interactive tutoring skill**: AI-driven real-time canvas demonstration that dynamically adjusts the solution path based on student feedback.

### REPL (Interactive Commands)

An open programmatic scripting interface that supports driving the canvas in real time through pseudo-code or instruction streams — the foundational layer for AI-driven automated interaction.
