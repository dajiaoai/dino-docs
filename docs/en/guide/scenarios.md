---
title: Scenarios
description: Decide whether Dino-GSP Open Platform fits your business scenario
---

# Scenarios

Mathematical geometry is a core foundation of many education products, but building a complex geometry sketchpad system in-house often involves an extremely high technical barrier. By decoupling its underlying capabilities, Dino-GSP Open Platform can adapt to the following typical business scenarios.

## 1. Online Education and Smart Classrooms

In the digital teaching process, dynamic geometry demonstrations can make abstract mathematical logic intuitive.

- **Dynamic lesson embedding**: Embed interactive geometry figures directly into lesson pages, allowing teachers to demonstrate in real time and students to explore interactively.
- **Courseware interaction upgrade**: Replace static images with geometry figures that support dragging, parameter linkage, and animation playback — boosting classroom engagement.

## 2. Digital Question Banks and Content Platforms

Provide a low-cost, high-efficiency illustration solution for large-scale math problem sets.

- **Structured figure loading**: Render geometry figures quickly through the protocol, eliminating the need to manually produce static images for every problem.
- **Dynamic problem association**: Embed interactive canvases directly into exercises, letting students verify their thinking by manipulating the figure as they solve a problem.

## 3. AI Tutoring

Dino-GSP is an AI-native geometry engine, with deep integration designed specifically for large language models (LLMs) and intelligent agents.

- **Dynamic drawing and explanation**: When explaining a geometry problem, AI can call the interface to draw in real time on the canvas — showing auxiliary line construction or figure transformation processes.
- **Intelligent interaction diagnostics**: Retrieve the student's canvas operation state programmatically in real time, helping AI accurately identify where the student's problem-solving breaks down.

## 4. Lesson Plan and Courseware Authoring Tools

Empower curriculum teams to increase digital content production efficiency.

- **Canvas component integration**: Lesson plan tools can embed an editor-mode canvas directly, allowing teachers to quickly generate professional geometry figures while writing lesson plans.
- **Content sharing and migration**: Based on the standardized structured protocol, geometry content can be seamlessly transferred and re-edited across different curriculum systems.

## 5. Independent Developers and Math Innovation Tools

If you are building a vertical math tool (such as function graph generators or specific theorem verifiers):

- **Geometry infrastructure**: Directly invoke Dino-GSP's rendering and computation capabilities — no need to build a geometry constraint solver from scratch — so you can focus your energy on the core innovation of your business logic.

## Integration Guidance: How to Choose?

| Your goal                                  | Recommended approach                                      |
| :----------------------------------------- | :-------------------------------------------------------- |
| Display dynamic figures on a web page only | **[Direct iframe embed](../sdk/)**                        |
| Control the canvas based on business logic | **[SDK integration](../sdk/)**                            |
| Building an AI-driven teaching product     | **[REPL and intelligent agent integration](../sdk/repl)** |
