---
title: Scenarios
description: Understand Dino-GSP Open Platform from business scenarios first, with recommended capability units and example integrations
---

# Scenarios

If you prefer to start from “what kind of product am I building?”, this page is the better entry point. Each scenario below maps to recommended capability units and a representative integration example.

## How to read this page

- Want to know whether your product is a fit: jump to the scenario closest to your business.
- Want to know what to integrate: check the “Recommended capability units” under each scenario.
- Want clearer capability boundaries first: return to <a href="./capabilities.html#capability-summary" target="_blank" rel="noreferrer">Capabilities</a>.

<a id="scenario-mapping"></a>

## Scenario-to-capability mapping

| Scenario                                         | Core goal                                                            | Recommended capability units                                                                                                                                                                                                                                                                                                                                                |
| :----------------------------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Online Education and Smart Classrooms            | Make abstract geometry dynamic inside teaching flows                 | <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">Embedded Presentation Canvas</a>, <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent Geometry Interaction</a>                                                                                                                      |
| Digital Question Banks and Content Platforms     | Lower figure production cost and improve exercise interactivity      | <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">Embedded Presentation Canvas</a>, <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">Geometry Protocol and JS SDK</a>, <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">Image and Structured Export</a> |
| AI Tutoring                                      | Let models reason with geometry and deliver more vivid explanations  | <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent Geometry Interaction</a>, <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">Geometry Protocol and JS SDK</a>                                                                                                                               |
| Lesson Plan and Courseware Authoring Tools       | Let curriculum teams produce geometry directly in their own systems  | <a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">Embedded Editor Canvas</a>, <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">Image and Structured Export</a>                                                                                                                                      |
| Independent Developers and Math Innovation Tools | Reuse mature geometry infrastructure and focus on product innovation | <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">Geometry Protocol and JS SDK</a>, <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">Image and Structured Export</a>                                                                                                                                   |

<a id="scenario-online-education"></a>

## 1. Online Education and Smart Classrooms

This is the most typical teaching-display scenario. The goal is to insert dynamic geometry naturally into classroom and learning workflows.

**You may be building**

- Online classroom products
- Interactive lesson pages
- Courseware playback systems
- Learning tablets or classroom large-screen systems

**Recommended capability units**

- <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">Embedded Presentation Canvas</a>
- <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent Geometry Interaction</a>

**Why it fits**

- Static figures can become draggable, demonstrable, and replayable learning content.
- If your teaching system includes an AI assistant, the assistant can draw while explaining.

**Typical examples**

- A teacher explains congruent triangles with a dynamic figure whose vertices can be dragged live in class.
- An AI teaching assistant outputs text explanation while automatically adding auxiliary lines to the canvas.

<a id="scenario-question-bank"></a>

## 2. Digital Question Banks and Content Platforms

These scenarios usually involve large content volume and frequent updates. Creating static figures manually for every problem is expensive, so a better model is to structure geometry content and render, interact with, and export it on demand.

**You may be building**

- Question-bank platforms
- Search-and-solution pages
- Practice systems
- Educational content platforms

**Recommended capability units**

- <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">Embedded Presentation Canvas</a>
- <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">Geometry Protocol and JS SDK</a>
- <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">Image and Structured Export</a>

**Why it fits**

- You can present dynamic figures on the front end while processing geometry in code on the back end.
- Geometry content can be connected to existing question-bank workflows and result pipelines.

**Typical examples**

- A problem detail page loads an interactive figure so students can verify a conclusion by dragging points.
- An operations system generates thumbnails and display figures in bulk from structured geometry data.

<a id="scenario-ai-tutoring"></a>

## 3. AI Tutoring

The key in this scenario is giving AI real geometry-operating ability. If a model can only output text, its geometry explanation can feel dry.

**You may be building**

- AI tutors
- Intelligent Q&A tools
- Automated problem-solving and explanation products
- Agent-driven math learning assistants

**Recommended capability units**

- <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent Geometry Interaction</a>
- <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">Geometry Protocol and JS SDK</a>

**Why it fits**

- The model can include drawing steps directly in its reasoning chain and make geometry part of the explanation context.
- The system can inspect figure state in real time to support stronger diagnosis, explanation, and follow-up.

**Typical examples**

- While explaining a proof about equal inscribed angles, AI constructs the circle, chord, and relevant angles step by step.
- An intelligent tutoring system inspects how a student manipulates the figure and judges whether the student truly understood the relationship.

<a id="scenario-authoring-tools"></a>

## 4. Lesson Plan and Courseware Authoring Tools

This scenario serves content producers. The emphasis is production efficiency, lower repetitive effort, and easier geometry reuse across systems.

**You may be building**

- Lesson-plan authoring platforms
- Courseware production tools
- Curriculum collaboration systems
- Content production back offices

**Recommended capability units**

- <a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">Embedded Editor Canvas</a>
- <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">Image and Structured Export</a>

**Why it fits**

- Professional geometry editing becomes a built-in part of the content workflow.
- Figures can be delivered as images while preserving structured outputs for later editing.

**Typical examples**

- A teacher edits a geometry figure directly inside a lesson-prep system and exports it into a courseware page.
- A curriculum team builds a reusable library of structured geometry assets inside its own content platform.

<a id="scenario-independent-developers"></a>

## 5. Independent Developers and Math Innovation Tools

If your innovation is a new interaction, analysis method, or subject-specific application, it is usually better to reuse the underlying geometry infrastructure directly.

**You may be building**

- Function-graph tools
- Theorem verification tools
- Math lab applications
- Vertical math products

**Recommended capability units**

- <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">Geometry Protocol and JS SDK</a>
- <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">Image and Structured Export</a>

**Why it fits**

- You can focus on your own algorithms, interaction model, or product design while reusing low-level rendering and geometry constraints.
- This is often the fastest way to validate a new product direction before deepening the integration later.

**Typical examples**

- A theorem-verification tool generates figures through structured protocol data and renders final results through export capability.
- A math lab app uses the SDK to control parameter changes and reflect them on the canvas in real time.

## How to choose an integration path

| Your goal                                              | Start here                                                                                                                       |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| I only need to show dynamic figures                    | <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">Embedded Presentation Canvas</a> |
| I need editing and content production in my own system | <a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">Embedded Editor Canvas</a>             |
| I need code-level canvas and data control              | <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">Geometry Protocol and JS SDK</a>          |
| I need AI to call geometry capabilities                | <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent Geometry Interaction</a>             |
| I need image or structured outputs                     | <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">Image and Structured Export</a>                 |

## Continue from the scenario view

- To understand each capability unit in more detail: see <a href="./capabilities.html#capability-summary" target="_blank" rel="noreferrer">Capabilities</a>
- To move directly into engineering docs: see [SDK Docs](../sdk/)
- To focus on AI and agents first: see [REPL Capabilities](../sdk/repl)
