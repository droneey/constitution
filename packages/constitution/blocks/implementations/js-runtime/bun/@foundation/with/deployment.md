# Deployment

> Governs the environment files Bun would load on its own.

## General

### env-file-never-loaded-automatically → configuration-enters-only-through-its-declaration · MUST

Bun never loads an environment file, such as `.env`, on its own. Every `bunfig` a run reads sets `env = false`, which turns the loading off for the runtime, `bun test` and the scripts, and an entry run without one carries `--no-env-file` in its shebang, so the program parses only the variables its deployment provides.

#### Why

A file loaded behind the program's back sets values nobody declared, and hides a missing one; `--no-env-file` alone reaches no process a script starts, and a run given another `bunfig` by `--config` reads none of `bunfig.toml`.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[test]
randomize = true
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
env = false

[test]
randomize = true
```
