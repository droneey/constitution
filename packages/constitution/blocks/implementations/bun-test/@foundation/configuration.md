# Configuration

> Governs what `bunfig` sets: the specs it leaves out, the coverage gate, the order of the cases and the network the preload refuses.

## Vocabulary

The **sandbox preload**{#sandbox-preload} is the preload that refuses every connection a unit spec opens. A preload's file carries the `.fixtures` mark here, though it builds no value.

## General

### integration-specs-ignored-by-bunfig → integration-spec-runs-the-real-engine · MUST

The unit run leaves the integration and end-to-end specs out. `pathIgnorePatterns` in `bunfig.toml` leaves out the integration spec files, `**/*.integration.test.*`, and the package's suites, `tests/**`.

#### Why

`bun test` takes every spec file under the folder it starts in, so without an ignored pattern the integration and end-to-end specs run as unit specs, inside a sandbox that refuses the engines they need.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
randomize = true
preload = ["./src/__tests__/sandbox.fixtures.ts"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
randomize = true
preload = ["./src/__tests__/sandbox.fixtures.ts"]
pathIgnorePatterns = ["tests/**", "**/*.integration.test.*"]
```

### coverage-gate-on-loaded-files → logic-fully-covered · MUST

The coverage gate counts every file a spec loads, over the unit and the integration specs run together. `bunfig.integration.toml` runs both with the text reporter and fails when the lines or functions of a file a spec loads fall below 100 percent, outside core's exclusions.

#### Why

Bun documents no merge of the coverage of two runs, so a gate on either run alone misses, or fails on, the lines of a contract's implementation that only its engine reaches.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
randomize = true
coverage = true
coverageThreshold = { lines = 1, functions = 1 }
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.integration.toml
[test]
randomize = true
pathIgnorePatterns = ["tests/**"]
coverage = true
coverageReporter = ["text"]
coverageSkipTestFiles = true
coverageThreshold = { lines = 1, functions = 1 }
```

### bunfig-randomizes-the-order → case-order-shuffled · MUST

Every run of the specs shuffles the cases. `bunfig.toml` and `bunfig.integration.toml` set `randomize = true`. Exempt: a run of the mutation tool.

#### Why

Bun otherwise runs the cases in the order they are written, so a case that leans on an earlier one passes every run until someone runs it alone.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
pathIgnorePatterns = ["tests/**", "**/*.integration.test.*"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
pathIgnorePatterns = ["tests/**", "**/*.integration.test.*"]
randomize = true
```

### network-refused-by-the-test-preload → unit-spec-refuses-the-network · MUST

Every run of the unit specs but the integration run preloads the sandbox preload, which refuses every connection. `bunfig.toml` preloads it, and it replaces each way the runtime opens a connection with a function that throws, such as `fetch`, `WebSocket`, `Bun.connect`, `Bun.udpSocket` and `Bun.SQL`, `connect` and `createConnection` of `node:net`, `connect` of `node:tls` and `node:http2`, `request` and `get` of `node:http` and `node:https`, the sockets of `node:dgram` and the lookups of `node:dns`. Exempt: the integration specs, whose configuration does not preload it.

#### Why

A refusal written in each spec is missing from the next spec that forgets it, while a preload runs before every spec file its configuration takes; the integration run loads the unit specs again only for the coverage gate, and a unit spec that connects has already failed the unit run.

#### Examples

```ts title="Avoid"
// src/features/orders/infrastructure/http/__tests__/order-api.adapter.test.ts
beforeEach(() => {
  globalThis.fetch = () => Promise.reject(new Error('no network'));
});
```

```ts title="Prefer"
// src/__tests__/sandbox.fixtures.ts
import net from 'node:net';

function refuseNetwork(): never {
  throw new Error('A spec reached the network: give it the fake of its transport');
}

for (const [owner, name] of [
  [globalThis, 'fetch'],
  [globalThis, 'WebSocket'],
  [Bun, 'connect'],
  [net, 'connect'],
] as const) {
  Object.defineProperty(owner, name, { value: refuseNetwork, writable: false });
}
```
