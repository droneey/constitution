# Stories

> Governs the stories: the primitives' states, their fixtures and their accessibility scan.

## Vocabulary

A story file carries Storybook's mark of an example that renders a unit in isolation for review, **`.stories`**{#story}.

## General

### story-for-every-primitive-state → primitive-shown-whole-in-one-place · SHOULD

Every component primitive shows each variant and state in a story of its own, in `<name>.stories.tsx` beside it. Such states include disabled, loading, error, empty and long text. Each story can be shown in every theme mode through the theme global.

| Why |
|---|
| a state with no story is one a designer and a reviewer never see before it ships. |

### story-never-counts-as-the-spec → component-spec-proves-its-interaction · SHOULD

Every component with stories also has its spec, which no story replaces.

| Why |
|---|
| a story shows a state and proves no behaviour, so a component whose only proof is its stories ships a broken interaction that every story still shows. |

### stories-render-from-fixtures · MUST

Every story renders from fixtures and fakes. No request leaves a story.

| Why |
|---|
| a story that reaches the network breaks when the server does, shows data nobody chose, and breaks or harms the run that executes the stories as tests. |

## Accessibility

### stories-fail-on-a11y-violations → rendered-state-scanned-for-accessibility-once · MUST

Every state a story renders that no component spec renders is scanned in that story, and any violation fails the check. The project sets the scan to fail, with `parameters.a11y.test: 'error'`, and the check runs the stories as tests.

| Why |
|---|
| a violation that only warns is ignored and ships, and a state no component spec scans reaches the person who cannot use it before any tool does; the scan fails a story only when the stories run as tests. |

### layout-rules-scanned-in-the-story → unscannable-criterion-proven-where-it-renders · MUST

Every story whose state a component spec also renders is scanned only on the rules a simulated document cannot judge. It is scanned in the browser it renders in, on those rules, such as `color-contrast` and `target-size`.

| Why |
|---|
| a component spec's simulated document passes contrast and target size whatever the screen shows, so without the story's scan in a real browser the failure ships, while a rule the spec already judged proves nothing new when run again. |
