# Stack — Bun workspaces

> The **stack axis in one chapter** for a library monorepo: the toolbox and the binding of the library `architecture` chapter to it. **This is the only chapter that names a brand.** Where a rule and this chapter cover the same ground, the rule chapter states the law and this one the mechanics — the law wins.

---

## 1. The toolbox

Bun is the runtime, package manager, workspace manager, script runner and test runner.

- Install with `bun install`; run scripts with `bun run <script>`; execute binaries with `bunx <bin>`. Never `npm`/`yarn`/`pnpm`/`npx` — except `npm publish`, which the deploy workflow runs for the registry.
- One lockfile, `bun.lock`. No second lockfile is ever committed.

| Concern | Tool |
| --- | --- |
| Language | TypeScript, config through `@droneey/devkit-ts-tsconfig` |
| Lint + format | Biome, through `@droneey/devkit-ts-biome` (`base`, `node`, `test`) |
| Dependency boundaries | dependency-cruiser |
| Package manifests | Syncpack, through `@droneey/devkit-ts-syncpack`, plus the workspace version groups of §3 |
| Git hooks | lefthook, through `@droneey/devkit-ts-lefthook` |
| Tests | `bun test`, configured by the devkit template `bunfig.toml` |
| Registry | npm, public packages under one scope |
| Releases | cd-version and cd-release of `droneey/.github`, with a version command that writes every manifest |
| Publishing | `cd-deploy-npm` of `droneey/.github`, through npm trusted publishing |
| Dependency updates | Renovate, through the fleet preset `github>droneey/.github` |

Introducing a library outside this set requires a concrete justification recorded in the change.

---

## 2. The workspace

- `package.json` at the root is `private` and declares `"workspaces": ["packages/<language>/libs/*"]`.
- The root installs the kit's own packages as `workspace:*` devDependencies and extends them like any consumer, so the repository dogfoods every configuration it ships.
- A package is published from its own folder; the root is never published.

---

## 3. Package manifests

- `exports` maps each entry to its file, with a `types` condition beside `default` wherever a consumer imports code.
- `files` lists exactly what ships; `README.md` and `LICENSE.md` ship by default.
- The configured tool is a `peerDependencies` entry with a floor (`>=`); Syncpack ignores peers from the version groups on purpose.
- The root `.syncpackrc.mjs` extends the shared configuration and adds the workspace groups: kit packages pinned to `workspace:*` in the root, peers ignored, root-only tools ignored.

---

## 4. Tests

`bun test` at the root runs every `__tests__/` of every package with the devkit `bunfig.toml` template. A package that generates a copy from `packages/common` asserts equality in its spec; a configuration package asserts that its files parse and that the rules it exists for are set.

---

## 5. Releases and publishing

- `cd-version.yml` calls the hub with a version command that writes the version into the root manifest and every package manifest:

```bash
for f in package.json packages/*/libs/*/package.json; do
  jq --arg v "$VERSION" '.version = $v' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
```

- `cd-pre-release.yml` opens the pre-release; a human promotes it.
- `cd-deploy.yml` runs on the promoted release and calls `cd-deploy-npm` with `packages: "packages/*/libs/*/package.json"`; packages with a `build` script are built first; publishing passes no token — every package carries a trusted publisher on npmjs.com for the calling workflow, `cd-deploy.yml`, with direct publishing allowed.
- A brand-new package is published once by hand, with two-factor authentication, before it gets its trusted publisher.

---

## 6. Verification

`check` runs, in this order: `lint:check` (Biome), `packages:check` (`syncpack lint && syncpack format --check`), `type:check` (`tsc --noEmit`), `test:unit` (`bun test` with the gate), `architecture:check` (dependency-cruiser). CI builds every package that has a `build` script after `check`.

```bash
bun run check
```
