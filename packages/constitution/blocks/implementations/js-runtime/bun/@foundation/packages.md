# Packages

> Governs the package manager, its lockfile, the install scripts and the cooldown of installs.

## General

### bun-is-the-only-package-manager → dependencies-managed-by-one-package-manager · MUST

Only Bun manages the dependencies of the repository's TypeScript packages.

| Why |
|---|
| two package managers resolve differently, so the same manifests install different versions. |

### bun-lock-is-the-only-lockfile → dependencies-locked-by-one-lockfile · MUST

Only `bun.lock` locks the dependencies of the repository's TypeScript packages. No other package manager's lockfile, such as `package-lock.json`, `yarn.lock` or `pnpm-lock.yaml`, is kept.

| Why |
|---|
| a second lockfile is a second truth about what is installed, and the tool that reads it installs what nobody locked with Bun. |

### trusted-dependencies-listed-by-name → install-scripts-run-only-for-listed-dependencies · MUST

The root `package.json` always declares `trustedDependencies`. It names each dependency whose install script may run, and is `[]` when none may: without the field, Bun runs the scripts of its own list of popular packages.

| Why |
|---|
| without the field an install script runs for any package on Bun's list, with the developer's rights, though nobody chose to let it — least privilege. |

### release-age-set-for-installs → new-release-adopted-after-a-cooldown · MUST

The root's `bunfig.toml` sets the cooldown for new releases. `minimumReleaseAge` under `[install]`, at least three days in seconds (`259200`), sets it, and `minimumReleaseAgeExcludes` holds the exemptions, each with any new dependency it brings.

| Why |
|---|
| a cooldown held only by the bot that proposes updates leaves every other install open to a release published an hour ago, and a dependency a fix brings is a new release too, which the cooldown holds back unless it is exempted beside the fix. |
