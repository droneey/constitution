---
id: storybook
kind: implementation
summary: Storybook — a story for every state of a UI kit component.
chapters: []
requires: [_react]
extends: null
abstract: false
checks: []
owns: [Storybook, .stories, .storybook]
governs: ["**/*.stories.tsx", ".storybook/**"]
status: stable
---

# Storybook

> A catalogue of the UI kit. **Vocabulary:** suffix `.stories`.

## story-for-every-kit-state · SHOULD
Every UI-kit component has `<name>.stories.tsx` beside it, with a story per variant and state — disabled, loading, error, empty, long text, both themes. A story never replaces the spec.
**Why:** the catalogue shows every state a designer and a reviewer need to see; the spec proves the behaviour.
**Check:** review
**Tags:** ux, testing

## stories-render-from-fixtures · SHOULD
Stories render from fixtures and fakes; no request leaves a story.
**Why:** a story that reaches the network breaks when the server does, and shows data nobody chose.
**Check:** review
**Tags:** testing
**Implements:** `tests-run-in-a-sandbox`

## stories-unreachable-from-production · MUST
Production code never imports a story, and stories are outside coverage.
**Why:** a story in production ships fixtures and fakes to users.
**Check:** tool — architecture
**Tags:** architecture, testing
**Implements:** `test-code-unreachable-from-production`

## screenshots-over-kit-stories-only · SHOULD
Screenshots are compared over the UI kit's stories, where the look is the contract, and nowhere else.
**Why:** the kit's look is the one place a changed pixel is a changed contract.
**Check:** review
**Tags:** testing
**Implements:** `screenshots-only-where-look-is-contract`
