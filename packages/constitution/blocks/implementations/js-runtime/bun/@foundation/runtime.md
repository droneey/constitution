# Runtime

> Governs what runs on Bun and what Bun builds.

## General

### node-shebang-tool-runs-on-bun → tool-pinned-exactly-by-the-repository · MUST

Every tool whose shebang names `node` runs on the pinned Bun. `bunfig.toml` sets `[run] bun = true`.

| Why |
|---|
| such a tool otherwise runs on whichever runtime the machine finds, and one runtime for the program and its tools means one version to pin. |

### other-runtime-only-where-bun-cannot · SHOULD

Another runtime is pinned only for a tool Bun cannot run, with the reason written beside its pin.

| Why |
|---|
| each exception is a second runtime to pin and keep, and one without its reason stays on after Bun can run the tool. |

### programs-built-by-bun-build · SHOULD

Every program whose build no other active block owns is built by `bun build`.

| Why |
|---|
| a build that resolves modules otherwise than the runtime ships code that differs from what was run and tested. |
