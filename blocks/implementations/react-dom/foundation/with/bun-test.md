# React DOM with Bun test

> Specs that render into a DOM `bun test` does not have.

## dom-registered-before-the-sandbox → network-refused-by-the-test-preload
`bunfig.toml` preloads `src/__tests__/dom.fixtures.ts`, which registers happy-dom's globals, before the sandbox fixture.

| Why | Check | Tags |
|---|---|---|
| `bun test` has no document of its own, and the sandbox makes `fetch` unwritable, so the DOM must be in place before it. | review | [] |
