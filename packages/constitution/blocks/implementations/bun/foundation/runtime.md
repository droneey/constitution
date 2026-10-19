# Runtime

> Governs what runs on Bun, what Bun builds, and the environment files it loads.

## General

### every-tool-runs-on-bun → tool-pinned-exactly-by-the-repository · MUST

`bunfig.toml` sets `[run] bun = true`, so a tool with a Node shebang runs on the pinned Bun.

| Why | Tags |
|---|---|
| a tool with a Node shebang otherwise runs on whichever Node the machine finds, and one runtime for the program and its tools means one version to pin. | [] |

### other-runtime-only-where-bun-cannot · SHOULD

Another runtime is pinned only for a tool Bun cannot run, with the reason written beside its pin.

| Why | Tags |
|---|---|
| each exception is a second runtime to pin and keep; its reason says when it can go. | [] |

### programs-built-by-bun-build · SHOULD

A program whose build no other active block owns is built by `bun build`.

| Why | Tags |
|---|---|
| the build resolves modules as the runtime does, so what was run and tested is what ships. | [] |

### env-file-never-loaded-automatically → configuration-parsed-once-at-start · MUST

Bun's automatic loading of the local environment file is off — `--no-env-file` in the entry's shebang — so the program parses only the variables its deployment provides.

| Why | Tags |
|---|---|
| a file loaded behind the program's back sets values nobody declared, and hides a missing one. | [] |
