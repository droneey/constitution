# Packages

> Governs the package manager, the install scripts and the cooldown of installs.

## General

### bun-is-the-only-package-manager → dependencies-locked-by-one-lockfile · MUST

`bun.lock` is the only lockfile of the repository's TypeScript; no lockfile of npm, yarn or pnpm is kept.

| Why | Tags |
|---|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. | [] |

### trusted-dependencies-listed-by-name → install-scripts-run-only-for-listed-dependencies · MUST

`package.json` always declares `trustedDependencies`, naming each dependency whose install script may run, and `[]` when none may: without the field, Bun runs the scripts of its own list of popular packages.

| Why | Tags |
|---|---|
| an install script runs with the developer's rights; listing each package keeps that a decision, not a default. | [] |

### release-age-set-for-installs → new-release-adopted-after-a-cooldown · MUST

`minimumReleaseAge = 259200` — three days, in seconds — under `[install]` in `bunfig.toml` sets the cooldown for new releases, and `minimumReleaseAgeExcludes` holds the exemptions, each with any new dependency it brings.

| Why | Tags |
|---|---|
| the package manager then holds the cooldown on every install, not only the bot, and a dependency the fix brings is a new release too. | [] |
