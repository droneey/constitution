---
id: bun
kind: implementation
summary: Bun as runtime, package manager and script runner.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: []
owns: [Bun, bun, bunx, bun.lock, bunfig.toml, trustedDependencies]
governs: ["bunfig.toml", "package.json"]
status: stable
---

# Bun

> Runs the program, installs its dependencies and runs its scripts.

## Packages and installs

## bun-is-the-only-package-manager · MUST
Bun installs (`bun install`), runs scripts (`bun run`) and runs binaries (`bunx`); never npm, yarn, pnpm or npx, except `npm publish` in the release workflow. `bun.lock` is the only lockfile, and no other is committed.
**Why:** two package managers resolve differently, and a second lockfile is a second truth about what is installed.
**Check:** review
**Tags:** security, workflow
**Implements:** `dependencies-pinned-by-lockfile`

## installs-follow-the-lockfile · MUST
CI and every script install with `bun install --frozen-lockfile`.
**Why:** an install that may update the lockfile runs code nobody reviewed.
**Check:** review
**Tags:** security
**Implements:** `dependencies-pinned-by-lockfile`

## trusted-dependencies-listed-by-name · MUST
Bun runs no dependency's install script unless `trustedDependencies` in `package.json` lists that package by name.
**Why:** an install script runs with the developer's rights; listing each package keeps that a decision, not a default.
**Check:** review
**Tags:** security
**Implements:** `install-scripts-only-for-listed-dependencies`

## release-age-set-for-installs · SHOULD
`minimumReleaseAge` under `[install]` in `bunfig.toml` sets the cooldown for new releases.
**Why:** the package manager then holds the cooldown on every install, not only the bot.
**Check:** review
**Tags:** security
**Implements:** `dependency-release-cooldown`

## Running

## every-tool-runs-on-bun · SHOULD
`bunfig.toml` sets `[run] bun = true`, so every tool, one with a Node shebang included, runs on the pinned Bun.
**Why:** one runtime for the program and its tools means one version to pin and one behaviour to trust.
**Check:** review
**Tags:** workflow

## other-runtime-only-where-bun-cannot · SHOULD
Another runtime or tool runs only where Bun cannot run it, with the reason written in the configuration or script that makes the exception.
**Why:** each exception is a second runtime to pin and keep; its reason says when it can go.
**Check:** review
**Tags:** workflow

## no-automatic-env-file · SHOULD
Bun's automatic loading of the local environment file is off — `--no-env-file` in the entry's shebang and in the scripts — so the program reads its environment only where the configuration is parsed.
**Why:** a file loaded behind the program's back sets values nobody declared, and hides a missing one.
**Check:** review
**Tags:** security
**Implements:** `environment-read-once-at-boot`

## check-chains-tool-scripts · SHOULD
Each tool has an `<area>:check` script that only checks, and an `<area>:fix` beside it where the tool can write; `check` chains the check scripts.
**Why:** the script names are the stable interface: CI, the hooks and a person run the same ones.
**Check:** review
**Tags:** workflow
**Implements:** `one-check-command`

## bun-build-after-the-check · SHOULD
A program is built by `bun build`, in CI after the check.
**Why:** a build of code that fails its check ships the failure.
**Check:** review
**Tags:** workflow

## Requirements

| Requirement | How in bun | Status |
|---|---|---|
| `workspace-packages-linked-locally` | `workspace:*` resolves a package from the working tree | met |
| `publishing-with-provenance-supported` | Bun does not publish; the release workflow runs `npm publish` through trusted publishing | partial: publishing goes through npm |
