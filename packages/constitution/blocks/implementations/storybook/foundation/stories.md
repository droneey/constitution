# Stories

> Governs the stories: the kit's states, their fixtures, screenshots and accessibility check.

## General

### story-for-every-kit-state · SHOULD

Every UI-kit component has `<name>.stories.tsx` beside it, with a story per variant and state — disabled, loading, error, empty, long text — each shown in every theme through the theme global. A story never replaces the spec.

| Why |
|---|
| the catalogue shows every state a designer and a reviewer need to see; the spec proves the behaviour. |

### stories-render-from-fixtures · SHOULD

Stories render from fixtures and fakes; no request leaves a story.

| Why |
|---|
| a story that reaches the network breaks when the server does, and shows data nobody chose. |

## Accessibility

### stories-fail-on-a11y-violations → ui-specs-scan-accessibility · MUST

The accessibility check of the stories is set to fail — `parameters.a11y.test: 'error'` — for the whole project.

| Why |
|---|
| Storybook's default runs no check, and a report nobody fails on is ignored. |
