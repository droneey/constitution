# Browser

> Governs specs of browser code, which reach a DOM `bun test` does not have.

## General

### dom-registered-before-the-sandbox · MUST

The DOM is registered before the sandbox. Every `bunfig` a run of the specs reads preloads `src/__tests__/dom.fixtures.ts`, which registers happy-dom's globals, and `bunfig.toml` preloads it before the sandbox fixture.

| Why |
|---|
| `bun test` has no document of its own, so a spec that renders fails without the fixture, and the sandbox makes `fetch` unwritable, so a DOM registered after it cannot put its globals in place. |
