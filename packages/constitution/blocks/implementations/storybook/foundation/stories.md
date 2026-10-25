# Stories

> Governs the stories: the kit's states, their fixtures, coverage, screenshots and accessibility check.

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

### stories-outside-coverage → logic-fully-covered · MUST

Stories are outside coverage.

| Why |
|---|
| a story renders a component without asserting anything, so a line it covers would count as proven when no spec proves it. |

### stories-unreachable-from-production → test-code-never-reached-from-production · MUST

Production code never imports a story.

| Why |
|---|
| a story in production ships fixtures and fakes to users. |

### screenshots-over-kit-stories-only → screenshots-only-where-look-is-contract · SHOULD

Screenshots are compared over the UI kit's stories, where the look is the contract, and nowhere else.

| Why |
|---|
| the kit's look is the one place a changed pixel is a changed contract. |

## Accessibility

### stories-fail-on-a11y-violations → ui-specs-scan-accessibility · MUST

The accessibility check of the stories is set to fail — `parameters.a11y.test: 'error'` — for the whole project.

| Why |
|---|
| Storybook's default runs no check, and a report nobody fails on is ignored. |
