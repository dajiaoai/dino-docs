---
title: Capabilities
description: Understand Dino-GSP Open Platform through customer-facing capability units, linked to scenarios and example integrations
---

# Capabilities

If you already know what kind of product you are building, start with <a href="./scenarios.html#scenario-mapping" target="_blank" rel="noreferrer">Scenarios</a>. If you want to understand what Dino-GSP exposes as productized capabilities and what each part is good for, this page is the right entry point.

## How to read this page

- Want a fast feasibility check: start with the capability summary table below.
- Want to know where a capability fits: check the “Suitable scenarios” and “Typical examples” under each capability unit.
- Want to work backward from business needs to integration choices: continue with <a href="./scenarios.html#scenario-mapping" target="_blank" rel="noreferrer">Scenarios</a>.

## Choose an integration method first

If you are ready to start development, you do not need to read every capability unit first. Choose a primary path based on who will call the capability:

| Integration method | Best suited for | Capability boundary | Pricing model | Start here |
| :--- | :--- | :--- | :--- | :--- |
| **Embedded Canvas (SDK)** | Displaying and editing geometry in your own web pages or systems | Provides a visible canvas that can load content, listen for events, save, export, and interact with frontend business logic | Paid authorization is usually required; free products may apply for a non-commercial license | [SDK 2.x Quick Start](../sdk/2/getting-started) |
| **MCP** | Letting an existing AI assistant or agent draw in real time during conversations and reasoning | AI can create, modify, and query geometry, as well as import and export projects; it does not provide the frontend canvas UI for your product | Usage-based pricing | [MCP Integration](../ai/mcp) |
| **HTTP API** | Generating or rendering geometry in bulk on the server or as part of an automated content pipeline | Does not require an open canvas; supports generating `.algeo` projects from text or images and rendering PNG, SVG, or TikZ output; it is not a real-time canvas interaction API | Usage-based pricing | [API Integration](../api/) |

### Quick decision guide

- **Users need to view, drag, or edit geometry on a page**: choose the Embedded Canvas.
- **AI needs to reason and draw within a conversation**: choose MCP.
- **Programmatic bulk generation followed by manual adjustment and editing**: generate `.algeo` projects with the API, then load them into the Embedded Canvas.

<a id="capability-summary"></a>

## Capability unit summary

| Capability unit                    | What it solves                                                                           | Best for                                                           | Integration docs | Related scenarios                                                                                                                                                                                                                                                                                                                                                                                            |
| :--------------------------------- | :--------------------------------------------------------------------------------------- | :----------------------------------------------------------------- | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embedded Presentation Canvas       | Put dynamic geometry directly into your pages                                            | Question banks, classrooms, courseware platforms                   | [Quick Start](../sdk/2/getting-started#presentation-mode) | <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">Online Education and Smart Classrooms</a>, <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>                                                                                                                                         |
| Embedded Editor Canvas             | Embed a professional geometry editor into your own system                                | Curriculum platforms, lesson-authoring tools, content back offices | [Quick Start](../sdk/2/getting-started#editor-mode) | <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">Online Education and Smart Classrooms</a>, <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">Lesson Plan and Courseware Authoring Tools</a>                                                                                                                                                                                                                                                                          |
| Geometry Protocol and JS SDK       | Load, control, save, and export canvas state in code                                     | Teams that need deep integration                                   | [SDK Documentation](../sdk/) | <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>, <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">Independent Developers and Math Innovation Tools</a>                                                                                                                        |
| AI Agent Geometry Interaction      | Let AI or agents draw, inspect, and update geometry while reasoning                      | AI tutors, intelligent explanation products, automated workflows   | [MCP Integration](../ai/mcp) | <a href="./scenarios.html#scenario-ai-tutoring" target="_blank" rel="noreferrer">AI Tutoring</a>                                                                                                                                                                                                                                                                                                             |
| Image and Structured Export        | Turn geometry content into images or reusable structured output                          | Content production, question-bank pipelines, result delivery flows | [SDK Documentation](../sdk/) · [Render API](../api/render) | <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>, <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">Lesson Plan and Courseware Authoring Tools</a>                                                                                                                                     |
| HTTP API Server-side Integration   | Call AI figure generation and rendering directly from the backend for end-to-end intelligent geometry production | Backend teams, automated content pipelines, AI applications        | [API Integration](../api/) | <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>, <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">Lesson Plan and Courseware Authoring Tools</a>, <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">Independent Developers and Math Innovation Tools</a> |

<a id="capability-embedded-presentation"></a>

## 1. Embedded Presentation Canvas

This is the easiest capability unit to understand and often the fastest to adopt. It lets you embed a draggable, playable, interactive geometry canvas in a web page and replace static figures with dynamic content.

**What you get**

- Dynamic geometry inside lesson pages, explanation pages, and learning flows.
- Basic interactions such as dragging, parameter linkage, and animation playback.
- Support for both desktop and mobile viewing.

**Suitable scenarios**

- <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">Online Education and Smart Classrooms</a>
- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>

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

- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">Lesson Plan and Courseware Authoring Tools</a>
- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>

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

- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>
- <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">Independent Developers and Math Innovation Tools</a>
- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">Lesson Plan and Courseware Authoring Tools</a>

**Typical examples**

- A question-bank system loads protocol data by problem ID and renders the matching geometry automatically.
- A math tool drives the canvas from its own parameter controls and updates figure state in real time.

**When to choose this first**

- You need to integrate the canvas with existing workflows, permissions, and data pipelines.
- You need a complete set of control, observation, save, and export capabilities.

<a id="capability-ai-agent"></a>

## 4. AI Agent Geometry Interaction

This capability unit is for AI-native products. The goal is to give a model, agent, or automation flow direct access to geometry operations during reasoning. It is currently available through the <a href="../ai/mcp" target="_blank" rel="noreferrer">MCP protocol</a>, which works with Claude Code, Cursor, VS Code, Codex, and other major AI clients.

**What you get**

- Let AI create, modify, and query geometry objects through instructions.
- Use the current canvas state as part of model context.
- Turn explanation workflows into “reason while drawing” interactions.
- Export images or project files from within a conversation and pass them downstream.

**Suitable scenarios**

- <a href="./scenarios.html#scenario-ai-tutoring" target="_blank" rel="noreferrer">AI Tutoring</a>
- <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">Online Education and Smart Classrooms</a>

**Typical examples**

- An AI tutor automatically adds the required auxiliary construction while explaining a proof via MCP.
- An intelligent agent inspects the current figure state to decide what geometric relation to verify next.
- An agent workflow exports an image at the end of its reasoning turn and attaches it to the response.

**When to choose this first**

- Your product already includes LLMs, agents, or automated reasoning flows.
- You want AI explanations to include live figure manipulation, not text alone.
- Your scenario is “AI-driven interactive canvas” rather than “batch offline content production” (the latter belongs to HTTP API Server-side Integration).

<a id="capability-export"></a>

## 5. Image and Structured Export

Many products ultimately need deliverable outputs such as images, structured data, or reusable result packages. This capability unit handles the step from canvas state to assets that can be stored, reused, or distributed in your own systems.

**What you get**

- Image export for question lists, handouts, slide decks, and result pages.
- Structured output for later editing, rendering, or downstream processing.
- A result layer suitable for batch content production and workflow handoff.

**Suitable scenarios**

- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>
- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">Lesson Plan and Courseware Authoring Tools</a>
- <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">Independent Developers and Math Innovation Tools</a>

**Typical examples**

- Generate thumbnail figures in bulk for a question-bank list view.
- Export a finished figure as an image for a PPT or handout.

**When to choose this first**

- Your product needs geometry results stored in its own content or workflow system.
- You need both interactive online content and offline deliverable outputs.

<a id="capability-api"></a>

## 6. HTTP API Server-side Integration

This capability unit is for backend and automation scenarios. It provides standard HTTP endpoints so you can call AI figure generation and rendering without running a browser canvas. The caller here is your server-side code, not a user's browser.

**What you get**

- **AI Figure Generation**: Call the Agent API with a text description or reference images. It returns an interactive geometry project file (`.algeo`) asynchronously. Text-only, image-only, or combined text + image input are all supported (for example, recognizing a hand-drawn sketch).
- **Rendering**: Call the Render API to convert an existing geometry project into PNG, SVG, or TikZ output. Returns a file URL synchronously.
- Both API types use Bearer API Key authentication and can be used independently or chained (generate, then render).

**Suitable scenarios**

- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">Digital Question Banks and Content Platforms</a>
- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">Lesson Plan and Courseware Authoring Tools</a>
- <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">Independent Developers and Math Innovation Tools</a>

**Typical examples**

- A question-bank back office automatically generates a geometry figure from the problem text using the Agent API when a new problem is imported, then renders a thumbnail with the Render API.
- A content platform batch-processes existing geometry projects, exporting PNGs via the Render API for PDF reports or question list pages.
- A developer uploads a reference image (hand-drawn or screenshot) to the Agent API; AI recognizes the structure and returns an editable geometry project.

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

### AI-native geometry experience (interactive)

- Recommended combination: AI Agent Geometry Interaction (MCP) + Geometry Protocol and JS SDK
- Common in: AI tutors, intelligent explanation products, automated geometry workflows

### Backend batch production or automated content processing

- Recommended combination: HTTP API Server-side Integration (AI Figure Generation + Rendering) + SDK Editor Mode
- Common in: bulk figure generation for content platforms, automated question-bank processing, and content production workflows where people manually correct and refine geometry after bulk generation
