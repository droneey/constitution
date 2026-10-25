# Browser

> Governs specs of browser code, which reach a DOM `bun test` does not have.

## General

### dom-registered-before-the-sandbox · MUST

Every `bunfig` a run of the specs reads preloads `src/__tests__/dom.fixtures.ts`, which registers happy-dom's globals, and `bunfig.toml` preloads it before the sandbox fixture.

| Why |
|---|
| `bun test` has no document of its own, and the sandbox makes `fetch` unwritable, so the DOM must be in place before it. |
