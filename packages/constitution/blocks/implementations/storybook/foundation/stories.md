# Stories

> Governs the stories: the kit's states, their fixtures and their accessibility check.

## General

### story-for-every-kit-state · SHOULD

Every UI-kit component has a story for each of its states. Its stories sit in `<name>.stories.tsx` beside it, one per variant and state — disabled, loading, error, empty, long text — each shown in every theme through the theme global. A story never replaces the spec.

| Why |
|---|
| a state with no story is one a designer and a reviewer never see before it ships, and a story taken for a spec proves no behaviour. |

### stories-render-from-fixtures · SHOULD

Stories render from fixtures and fakes. No request leaves a story.

| Why |
|---|
| a story that reaches the network breaks when the server does, and shows data nobody chose. |

## Accessibility

### stories-fail-on-a11y-violations → rendered-state-scanned-for-accessibility-once · MUST

An accessibility violation in a story fails the check. The accessibility check of the stories is set to fail, with `parameters.a11y.test: 'error'`, for the whole project.

| Why |
|---|
| Storybook's default runs no check, and a violation reported where nothing fails is ignored and ships. |
