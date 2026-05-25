---
title: Capabilities
description: Understand Dino-GSP Open Platform through customer-facing capability units, linked to scenarios and example integrations
---

# Capabilities

If you already know what kind of product you are building, start with [Scenarios](./scenarios#scenario-mapping). If you want to understand what Dino-GSP exposes as productized capabilities and what each part is good for, this page is the right entry point.

## How to read this page

- Want a fast feasibility check: start with the capability summary table below.
- Want to know where a capability fits: check the “Suitable scenarios” and “Typical examples” under each capability unit.
- Want to work backward from business needs to integration choices: continue with [Scenarios](./scenarios#scenario-mapping).

<a id="capability-summary"></a>

## Capability unit summary

| Capability unit               | What it solves                                                      | Best for                                                           | Related scenarios                                                                                                                                                                   |
| :---------------------------- | :------------------------------------------------------------------ | :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embedded Presentation Canvas  | Put dynamic geometry directly into your pages                       | Question banks, classrooms, courseware platforms                   | [Online Education and Smart Classrooms](./scenarios#scenario-online-education), [Digital Question Banks and Content Platforms](./scenarios#scenario-question-bank)                  |
| Embedded Editor Canvas        | Embed a professional geometry editor into your own system           | Curriculum platforms, lesson-authoring tools, content back offices | [Lesson Plan and Courseware Authoring Tools](./scenarios#scenario-authoring-tools)                                                                                                  |
| Geometry Protocol and JS SDK  | Load, control, save, and export canvas state in code                | Teams that need deep integration                                   | [Digital Question Banks and Content Platforms](./scenarios#scenario-question-bank), [Independent Developers and Math Innovation Tools](./scenarios#scenario-independent-developers) |
| AI Agent Geometry Interaction | Let AI or agents draw, inspect, and update geometry while reasoning | AI tutors, intelligent explanation products, automated workflows   | [AI Tutoring](./scenarios#scenario-ai-tutoring)                                                                                                                                     |
| Image and Structured Export   | Turn geometry content into images or reusable structured output     | Content production, question-bank pipelines, result delivery flows | [Digital Question Banks and Content Platforms](./scenarios#scenario-question-bank), [Lesson Plan and Courseware Authoring Tools](./scenarios#scenario-authoring-tools)              |

<a id="capability-embedded-presentation"></a>

## 1. Embedded Presentation Canvas

This is the easiest capability unit to understand and often the fastest to adopt. It lets you embed a draggable, playable, interactive geometry canvas in a web page and replace static figures with dynamic content.

**What you get**

- Dynamic geometry inside lesson pages, explanation pages, and learning flows.
- Basic interactions such as dragging, parameter linkage, and animation playback.
- Support for both desktop and mobile viewing.

**Suitable scenarios**

- [Online Education and Smart Classrooms](./scenarios#scenario-online-education)
- [Digital Question Banks and Content Platforms](./scenarios#scenario-question-bank)

**Typical examples**

- Embed a draggable auxiliary-line demo on a geometry solution page.
- Insert a dynamic component into courseware to play through a figure transformation.

**When to choose this first**

- Your immediate goal is better presentation and fast adoption.
- You want to upgrade static figures into dynamic content before adding deeper integrations.

<a id="capability-embedded-editor"></a>

## 2. Embedded Editor Canvas

This capability unit is for content production. You embed a professional editor into your own system so teachers, curriculum teams, or operators can create, edit, and export geometry without leaving your workflow.

**What you get**

- A full geometry creation and editing toolbox.
- Configurable toolbar and interaction permissions.
- Save, export, and callback capabilities that fit business workflows.

**Suitable scenarios**

- [Lesson Plan and Courseware Authoring Tools](./scenarios#scenario-authoring-tools)
- [Digital Question Banks and Content Platforms](./scenarios#scenario-question-bank)

**Typical examples**

- Add a “draw figure directly” entry in a question-bank back office.
- Embed the canvas in a lesson-authoring system so teachers can create geometry while writing content.

**When to choose this first**

- Your business has people who continuously produce geometry content.
- You need an embedded editor that directly supports content production.

<a id="capability-sdk-protocol"></a>

## 3. Geometry Protocol and JS SDK

This capability unit is for teams that need code-level control. Through the SDK and structured protocol, geometry becomes part of your product logic and data flow.

**What you get**

- Initialize canvases, switch modes, and load content in code.
- Listen to user actions, inspect state, trigger save, and export results.
- Pass geometry content between your system and Dino-GSP through a structured protocol.

**Suitable scenarios**

- [Digital Question Banks and Content Platforms](./scenarios#scenario-question-bank)
- [Independent Developers and Math Innovation Tools](./scenarios#scenario-independent-developers)
- [Lesson Plan and Courseware Authoring Tools](./scenarios#scenario-authoring-tools)

**Typical examples**

- A question-bank system loads protocol data by problem ID and renders the matching geometry automatically.
- A math tool drives the canvas from its own parameter controls and updates figure state in real time.

**When to choose this first**

- You need to integrate the canvas with existing workflows, permissions, and data pipelines.
- You need a complete set of control, observation, save, and export capabilities.

<a id="capability-ai-agent"></a>

## 4. AI Agent Geometry Interaction

This capability unit is for AI-native products. The goal is to give a model, agent, or automation flow direct access to geometry operations during reasoning.

**What you get**

- Let AI create, modify, and query geometry objects through instructions.
- Use the current canvas state as part of model context.
- Turn explanation workflows into “reason while drawing” interactions.

**Suitable scenarios**

- [AI Tutoring](./scenarios#scenario-ai-tutoring)
- [Online Education and Smart Classrooms](./scenarios#scenario-online-education)

**Typical examples**

- An AI tutor automatically adds the required auxiliary construction while explaining a proof.
- An intelligent agent inspects the current figure state to decide what geometric relation to verify next.

**When to choose this first**

- Your product already includes LLMs, agents, or automated reasoning flows.
- You want AI explanations to include live figure manipulation, not text alone.

<a id="capability-export"></a>

## 5. Image and Structured Export

Many products ultimately need deliverable outputs such as images, structured data, or reusable result packages. This capability unit handles the step from canvas state to assets that can be stored, reused, or distributed in your own systems.

**What you get**

- Image export for question lists, handouts, slide decks, and result pages.
- Structured output for later editing, rendering, or downstream processing.
- A result layer suitable for batch content production and workflow handoff.

**Suitable scenarios**

- [Digital Question Banks and Content Platforms](./scenarios#scenario-question-bank)
- [Lesson Plan and Courseware Authoring Tools](./scenarios#scenario-authoring-tools)
- [Independent Developers and Math Innovation Tools](./scenarios#scenario-independent-developers)

**Typical examples**

- Generate thumbnail figures in bulk for a question-bank list view.
- Export a finished figure as an image for a PPT or handout.

**When to choose this first**

- Your product needs geometry results stored in its own content or workflow system.
- You need both interactive online content and offline deliverable outputs.

## Common capability combinations

### Display-only integration

- Recommended combination: Embedded Presentation Canvas
- Common in: classroom pages, explanation pages, content display pages

### Display plus deep control

- Recommended combination: Embedded Presentation Canvas + Geometry Protocol and JS SDK
- Common in: question-bank platforms, interactive exercises, teaching systems with business-logic linkage

### Content production back office

- Recommended combination: Embedded Editor Canvas + Image and Structured Export
- Common in: lesson platforms, courseware tools, question-bank operations systems

### AI-native geometry experience

- Recommended combination: AI Agent Geometry Interaction + Geometry Protocol and JS SDK
- Common in: AI tutors, intelligent explanation products, automated geometry workflows
