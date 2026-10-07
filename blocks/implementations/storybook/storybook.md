---
id: storybook
summary: Storybook — a story for every state of a UI kit component.
requires: [_react]
extends: null
abstract: false
languages: []
dictionary: [Storybook, .stories, .storybook]
governs: ["**/*.stories.tsx", ".storybook/**"]
---

# Storybook

> A catalogue of the UI kit. **Vocabulary:** suffix `.stories`.

### story-for-every-kit-state · SHOULD
Every UI-kit component has `<name>.stories.tsx` beside it, with a story per variant and state — disabled, loading, error, empty, long text — each shown in every theme through the theme global. A story never replaces the spec.

| Why | Tags |
|---|---|
| the catalogue shows every state a designer and a reviewer need to see; the spec proves the behaviour. | [ux, testing] |

### stories-render-from-fixtures · SHOULD
Stories render from fixtures and fakes; no request leaves a story.

| Why | Tags |
|---|---|
| a story that reaches the network breaks when the server does, and shows data nobody chose. | [] |

### stories-outside-coverage → logic-fully-covered · MUST
Stories are outside coverage.

| Why | Tags |
|---|---|
| a story renders a component without asserting anything, so a line it covers would count as proven when no spec proves it. | [testing] |

### stories-unreachable-from-production → test-code-never-reached-from-production · MUST
Production code never imports a story.

| Why | Tags |
|---|---|
| a story in production ships fixtures and fakes to users. | [] |

## Accessibility

### stories-fail-on-a11y-violations → ui-specs-scan-accessibility · MUST
The accessibility check of the stories is set to fail — `parameters.a11y.test: 'error'` — for the whole project.

| Why | Tags |
|---|---|
| Storybook's default runs no check, and a report nobody fails on is ignored. | [a11y] |
