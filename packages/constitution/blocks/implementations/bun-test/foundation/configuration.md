# Configuration

> Governs what `bunfig` sets: the specs it leaves out, the coverage gate, the order of the cases and the network the preload refuses.

## General

### integration-specs-ignored-by-bunfig → integration-spec-runs-the-real-engine · SHOULD

The unit run leaves the integration and end-to-end specs out. `pathIgnorePatterns` in `bunfig.toml` leaves out `*.integration.test.ts` and `tests/`.

| Why |
|---|
| `bun test` takes every spec file under the folder it starts in, so without an ignored pattern the integration and end-to-end specs run as unit specs, inside a sandbox that refuses the engines they need. |

### coverage-gate-on-loaded-files → logic-fully-covered · MUST

The coverage gate counts every file a spec loads, over the unit and the integration specs run together. `bunfig.integration.toml` runs both and fails when the lines or functions of a file a spec loads fall below 100 percent, outside core's exclusions.

| Why |
|---|
| Bun merges no coverage of two runs, so a gate on either run alone misses, or fails on, the lines of a contract's implementation that only its engine reaches. |

### test-order-randomized → case-independent-of-order · SHOULD

`bunfig.toml` sets `randomize = true`.

| Why |
|---|
| Bun otherwise runs the cases in the order they are written, so a case that leans on an earlier one passes every run until someone runs it alone; shuffled, each run also prints the seed that replays its order. |

### network-refused-by-the-test-preload → unit-spec-refuses-the-network · MUST

The unit run preloads a fixture that refuses every connection. `bunfig.toml` preloads a fixture that replaces with functions that throw every way the runtime opens a connection: `fetch`, `WebSocket`, `Bun.connect` and `Bun.SQL`; `node:net`'s `Socket.prototype.connect`, `connect` and `createConnection`; `node:tls`'s `connect`; and `request` and `get` of `node:http` and `node:https`. A configuration for the integration specs does not preload it.

| Why |
|---|
| a refusal written in each spec is missing from the next spec that forgets it, while a preload runs before every spec file its configuration takes. |
