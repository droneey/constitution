# Packages

> Governs the package manager, its lockfile, the install scripts and the cooldown of installs.

## General

### bun-is-the-only-package-manager → dependencies-managed-by-one-package-manager · MUST

Only Bun manages the dependencies of the repository's TypeScript packages.

#### Why

Two package managers resolve differently, so the same manifests install different versions.

#### Examples

```json title="Avoid"
{
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "setup": "pnpm install"
  }
}
```

```json title="Prefer"
{
  "packageManager": "bun@1.3.2",
  "scripts": {
    "setup": "bun install --frozen-lockfile"
  }
}
```

### bun-lock-is-the-only-lockfile → dependencies-locked-by-one-lockfile · MUST

Only `bun.lock` locks the dependencies of the repository's TypeScript packages. No other package manager's lockfile, such as `package-lock.json`, `yarn.lock` or `pnpm-lock.yaml`, is kept.

#### Why

A second lockfile is a second truth about what is installed, and the tool that reads it installs what nobody locked with Bun.

#### Examples

```text title="Avoid"
./
├── bun.lock
├── package-lock.json
└── package.json
```

```text title="Prefer"
./
├── bun.lock
└── package.json
```

### trusted-dependencies-listed-by-name → install-scripts-run-only-for-listed-dependencies · MUST

The root `package.json` always declares `trustedDependencies`. It names each dependency whose install script may run, and is `[]` when none may: without the field, Bun runs the scripts of its own list of popular packages.

#### Why

Without the field an install script runs for any package on Bun's list, with the developer's rights, though nobody chose to let it — least privilege.

#### Examples

```json title="Avoid"
{
  "name": "shop",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

```json title="Prefer"
{
  "name": "shop",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "trustedDependencies": ["esbuild"]
}
```

### release-age-set-for-installs → new-release-adopted-after-a-cooldown · MUST

The root's `bunfig.toml` sets the cooldown for new releases. `minimumReleaseAge` under `[install]`, at least three days in seconds (`259200`), sets it, and `minimumReleaseAgeExcludes` holds the exemptions, each with any new dependency it brings.

#### Why

A cooldown held only by the bot that proposes updates leaves every other install open to a release published an hour ago, and a dependency a fix brings is a new release too, which the cooldown holds back unless it is exempted beside the fix.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[install]
exact = true
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# bunfig.toml
[install]
exact = true
minimumReleaseAge = 259200
# Why: 4.2.1 of the payments SDK fixes a vulnerability that is exploited now
minimumReleaseAgeExcludes = ["@shop/payments-sdk"]
```
