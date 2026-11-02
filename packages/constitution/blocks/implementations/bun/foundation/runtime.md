# Runtime

> Governs what runs on Bun, what Bun builds, and the environment files it loads.

## General

### node-shebang-tool-runs-on-bun → tool-pinned-exactly-by-the-repository · MUST

A tool with a Node shebang runs on the pinned Bun. `bunfig.toml` sets `[run] bun = true`.

| Why |
|---|
| a tool with a Node shebang otherwise runs on whichever Node the machine finds, and one runtime for the program and its tools means one version to pin. |

### other-runtime-only-where-bun-cannot · SHOULD

Another runtime is pinned only for a tool Bun cannot run, with the reason written beside its pin.

| Why |
|---|
| each exception is a second runtime to pin and keep, and one without its reason stays on after Bun can run the tool. |

### programs-built-by-bun-build · SHOULD

A program whose build no other active block owns is built by `bun build`.

| Why |
|---|
| a build that resolves modules otherwise than the runtime ships code that differs from what was run and tested. |

### env-file-never-loaded-automatically → configuration-enters-only-through-its-declaration · MUST

Bun never loads the local environment file on its own. Its automatic loading is off — `--no-env-file` in the entry's shebang — so the program parses only the variables its deployment provides.

| Why |
|---|
| a file loaded behind the program's back sets values nobody declared, and hides a missing one. |
