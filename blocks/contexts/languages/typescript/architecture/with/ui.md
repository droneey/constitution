# TypeScript with UI

> The input and output a UI's components never reach.

### components-call-no-global-fetch → components-dumb-widgets-smart · MUST
No file in a `components/` folder calls the global `fetch`.

| Why | Tags |
|---|---|
| the runtime gives every module `fetch` without an import, so no import rule sees it, and a component that fetches can no longer be shown or tested with plain data. | [] |
