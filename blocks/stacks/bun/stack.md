# Stack — Bun

> The **stack axis in one chapter** for a command-line tool: the toolbox and the binding of the cli `architecture` chapter to it. **This is the only chapter that names a brand.** Where a rule and this chapter cover the same ground, the rule chapter states the law and this one the mechanics — the law wins.

---

## 1. The toolbox

Bun is the runtime, package manager, bundler, script runner and test runner.

- Install with `bun install`; run scripts with `bun run <script>`; execute binaries with `bunx <bin>`. Never `npm`/`yarn`/`pnpm`/`npx`.
- One lockfile, `bun.lock`. No second lockfile is ever committed.
- `bun run` starts every tool on Bun, a Node shebang included: `bunfig.toml` sets `[run] bun = true` (§5). `check` runs on the Bun the repository pins, never on a `node` a machine or a runner image happens to carry.
- Fall back to another tool only when something is genuinely incompatible with Bun, and record the reason in the relevant config or script.

| Concern | Tool |
| --- | --- |
| Language | TypeScript, config through `@droneey/devkit-ts-tsconfig` (`node`) |
| Command framework | `@bunli/core` — declares each command's name, description, options and handler |
| Schema engine | zod — the document schema, the environment references, the exported JSON schema |
| Document format | YAML, parsed by `yaml` |
| Environment | a dotenv loader reads `.env` beside the document; nothing else reads the environment |
| HTTP | the runtime's `fetch`, passed into adapters as a function so tests pass a fake |
| Lint + format | Biome, through `@droneey/devkit-ts-biome` (`base`, `node`, `test`) |
| Dependency boundaries | dependency-cruiser |
| Git hooks | lefthook, through `@droneey/devkit-ts-lefthook` |
| Package manifests | Syncpack, through `@droneey/devkit-ts-syncpack`: the field order of `package.json` and the version ranges |
| Dependency updates | Renovate, through the fleet preset `github>droneey/.github` |
| Tests | `bun test`, configured in `bunfig.toml` |
| Developer toolchain pins | mise (`mise.toml`), `mise trust && mise install` |
| Build | `bun build ./src/main.ts --target=bun --outdir dist` |

Introducing a library outside this set requires a concrete justification recorded in the change.

**`#/` resolution.** `tsconfig.json` → `"paths": { "#/*": ["./src/*"] }`; Bun resolves it natively at run time, the bundler at build time.

---

## 2. Commands

- One `<name>.command.ts` per command under `app/commands`, declared with the framework's command function: name, description, typed options, and a handler that receives the **command context** the composition root built.
- Shared option definitions (the document path, the section filter) live in their own file beside the commands and are reused, never redeclared.
- The handler resolves the document, calls one use-case and prints its report. Every failure goes through the app's error handler (cli `architecture` §6).

---

## 3. The document and the environment

- The document is a YAML file named after the tool; `init` writes it from a template and the JSON schema line in its header points editors at the published schema.
- `.env` beside the document is loaded for the `${NAME}` references the document declares; `validate` lists every name the document needs and fails on a missing one.
- The JSON schema is exported by a script from the zod schema and committed under `schema/`; a change to the schema regenerates it in the same change.

---

## 4. Engines

Engines the tool drives — an infrastructure runner, a configuration-management runner, their interpreters — are not vendored: they are downloaded per release into the tool's home directory, pinned by version and checksum, and reached only through the toolchain port. The tool also links each engine it installed into one directory of its home, `bin`, under the engine's own name. The developer machine and CI run exactly those engines: `mise.toml` puts that directory on `PATH` with `[env] _.path`, and mise-action carries it into the steps of a workflow. The versions live in the tool alone; mise pins the rest of the developer toolchain.

---

## 5. Tests

- `bun test` and `bun run` with `bunfig.toml`:

```toml
[test]
coverage = true
coverageReporter = ["text"]
coverageSkipTestFiles = true
coverageThreshold = { functions = 1.0, lines = 1.0 }
coveragePathIgnorePatterns = ["**/__tests__/**", "**/main.ts", "**/composition.ts"]

[run]
bun = true
```

- The file is the devkit template `packages/typescript/templates/bun/bunfig.toml`, copied as it is: the entrypoint is `main.ts` and the composition root `composition.ts`, so the globs hold and the file is identical in every repository.
- The threshold check runs only with the `text` reporter; the line stays.
- Fakes live in `__tests__/fake-<port>.ts` beside the port or kit primitive they replace; a command spec drives the CLI with a fake command context and captures the console and the exit code.
- `toStrictEqual` is the strict matcher the `testing` chapter asks for.

---

## 6. Verification

`check` runs, in this order: `lint:check` (Biome), `packages:check` (`syncpack lint && syncpack format --check`), `type:check` (`tsc --noEmit`), `test:unit` (`bun test` with the gate), `architecture:check` (dependency-cruiser). `build` runs in CI after `check`.

```bash
bun run check
```

Script names are the stable interface; the tools behind them are fixed here. Hooks, commit validation and branch validation come from `@droneey/devkit-ts-lefthook`, installed by `bun install`.
