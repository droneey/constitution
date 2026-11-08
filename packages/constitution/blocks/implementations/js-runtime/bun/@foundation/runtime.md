# Runtime

> Governs what runs on Bun and what Bun builds.

## General

### node-shebang-tool-runs-on-bun → tool-pinned-exactly-by-the-repository · MUST

Every tool whose shebang names `node` runs on the pinned Bun. `bunfig.toml` sets `[run] bun = true`.

#### Why

Such a tool otherwise runs on whichever runtime the machine finds, and one runtime for the program and its tools means one version to pin.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[install]
minimumReleaseAge = 259200
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[install]
minimumReleaseAge = 259200

[run]
bun = true
```

### other-runtime-only-where-bun-cannot · SHOULD

Another runtime is pinned only for a tool Bun cannot run, with the reason written beside its pin.

#### Why

Each exception is a second runtime to pin and keep, and one without its reason stays on after Bun can run the tool.

#### Examples

```toml title="Avoid"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[tools]
bun = "1.3.2"
node = "22.11.0"
```

```toml title="Prefer"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[tools]
bun = "1.3.2"
# Why: the app store's upload tool needs node:inspector, which Bun lacks
node = "22.11.0"
```

### programs-built-by-bun-build · SHOULD

Every program whose build no other active block owns is built by `bun build`.

#### Why

A build that resolves modules otherwise than the runtime ships code that differs from what was run and tested.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "build": "esbuild src/main.ts --bundle --platform=node --outfile=dist/main.js"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "build": "bun build src/main.ts --target=bun --outdir=dist"
  }
}
```
