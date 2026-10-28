---
title: Intelligent Image Generation Overview
description: Describe Dino Geometry open platform intelligent image generation API, including task creation, listing, and details.
---

# Intelligent Image Generation Overview

**Base URL:** `https://api.dajiaoai.com`

This document describes the Agent task API provided by the Dino Geometry Open Platform.

The Intelligent Image Generation API works asynchronously: the creation request returns a `taskId` immediately, and you poll the task detail endpoint to retrieve the result once generation is complete.

## Overview

| Description | Path | Method |
| --- | --- | --- |
| [Create a task](/en/api/agent-create) | `/api/agent/run` | `POST` |
| [List tasks](/en/api/agent-tasks) | `/api/agent/tasks` | `GET` |
| [Task detail](/en/api/agent-detail) | `/api/agent/tasks/:taskId` | `GET` |

See [Authentication](/en/api/auth) for auth and [API Billing](/en/api/pricing) for billing.

## Billing

- Billing type: agent
- Cost per call: varies by model — see [API Billing](/en/api/pricing)
- Deducted on successful execution

## Typical call flow

1. Call [`POST /api/agent/run`](/en/api/agent-create) to create a task.
2. Receive the `taskId`.
3. Poll [`GET /api/agent/tasks/:taskId`](/en/api/agent-detail) until the status is `incomplete`, `finished`, or `error`.
4. When `incomplete` or `finished`, download the result from `artifactUrl`.
