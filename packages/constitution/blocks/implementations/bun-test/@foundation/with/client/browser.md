# Browser

> Governs specs of browser code, which reach a DOM `bun test` does not have.

## Vocabulary

The **DOM preload**{#dom-preload} is `src/__tests__/dom.fixtures.ts`, the preload that registers a DOM implementation's globals.

## General

### dom-preload-listed-by-every-bunfig · MUST

Every `bunfig` a run of the specs reads lists the DOM preload in `preload`.

#### Why

`bun test` has no document of its own, so a spec that renders fails without the DOM preload.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.integration.toml
[test]
randomize = true
preload = []
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.integration.toml
[test]
randomize = true
preload = ["./src/__tests__/dom.fixtures.ts"]
```

### dom-registered-before-the-sandbox · MUST

Every `bunfig.toml` lists the DOM preload in `preload` before the sandbox preload.

#### Why

The sandbox preload makes `fetch` unwritable, so a DOM registered after it cannot put its globals in place.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
randomize = true
preload = ["./src/__tests__/sandbox.fixtures.ts", "./src/__tests__/dom.fixtures.ts"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
randomize = true
preload = ["./src/__tests__/dom.fixtures.ts", "./src/__tests__/sandbox.fixtures.ts"]
```
