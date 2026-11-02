# Packages

> Governs the package manager, the install scripts and the cooldown of installs.

## General

### bun-is-the-only-package-manager → dependencies-locked-by-one-lockfile · MUST

Bun is the only package manager of the repository's TypeScript. `bun.lock` is its only lockfile; no lockfile of npm, yarn or pnpm is kept.

| Why |
|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. |

### trusted-dependencies-listed-by-name → install-scripts-run-only-for-listed-dependencies · MUST

`package.json` always declares `trustedDependencies`. It names each dependency whose install script may run, and is `[]` when none may: without the field, Bun runs the scripts of its own list of popular packages.

| Why |
|---|
| without the field an install script runs for any package on Bun's list, with the developer's rights, though nobody chose to let it — least privilege. |

### release-age-set-for-installs → new-release-adopted-after-a-cooldown · MUST

`bunfig.toml` sets the cooldown for new releases. `minimumReleaseAge = 259200` — three days, in seconds — under `[install]` sets it, and `minimumReleaseAgeExcludes` holds the exemptions, each with any new dependency it brings.

| Why |
|---|
| a cooldown held only by the bot that proposes updates leaves every other install open to a release published an hour ago, and a dependency a fix brings is a new release too, which the cooldown holds back unless it is exempted beside the fix. |
