# Configuration

> Governs what `bunfig` sets: the specs it leaves out, the coverage gate, the order of the cases and the network the preload refuses.

## General

### integration-specs-ignored-by-bunfig → integration-spec-runs-the-real-engine · SHOULD

`pathIgnorePatterns` in `bunfig.toml` leaves out `*.integration.test.ts` and `tests/`.

| Why |
|---|
| `bun test` takes every spec file under the folder it starts in, so only an ignored pattern keeps the integration and end-to-end specs out of the unit specs and their sandbox. |

### coverage-gate-on-loaded-files → logic-fully-covered · MUST

`bunfig.integration.toml` runs the unit and the integration specs together and fails when the lines or functions of a file a spec loads fall below 100 percent, outside core's exclusions.

| Why |
|---|
| Bun merges no coverage of two runs, so only a run that loads both kinds of spec counts an adapter's lines that only its engine reaches. |

### test-order-randomized → case-independent-of-order · SHOULD

`bunfig.toml` sets `randomize = true`.

| Why |
|---|
| Bun runs the cases in the order they are written unless the setting shuffles them, and then prints the seed of each run. |

### network-refused-by-the-test-preload → unit-spec-refuses-the-network · MUST

`bunfig.toml` preloads a fixture that replaces with functions that throw every way the runtime opens a connection: `fetch`, `WebSocket`, `Bun.connect` and `Bun.SQL`; `node:net`'s `Socket.prototype.connect`, `connect` and `createConnection`; `node:tls`'s `connect`; and `request` and `get` of `node:http` and `node:https`. A configuration for the integration specs does not preload it.

| Why |
|---|
| a preload runs before every spec file the configuration takes, so the refusal holds for each of them with no line in the spec. |
