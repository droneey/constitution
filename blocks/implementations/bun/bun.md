---
id: bun
summary: Bun as runtime, package manager and script runner.
requires: [typescript]
extends: null
abstract: false
languages: []
dictionary: [Bun, bun, bunx, bun.lock, bunfig.toml, trustedDependencies]
governs: ["bunfig.toml", "package.json"]
---

# Bun

> Runs the program, installs its dependencies and runs its scripts.

## Packages and installs

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

### release-age-set-for-installs → new-release-adopted-after-a-cooldown · SHOULD
`minimumReleaseAge` under `[install]` in `bunfig.toml` sets the cooldown for new releases, and `minimumReleaseAgeExcludes` holds the exemptions, each with any new dependency it brings.

| Why | Tags |
|---|---|
| the package manager then holds the cooldown on every install, not only the bot, and a dependency the fix brings is a new release too. | [] |

## Running

### every-tool-runs-on-bun → tool-pinned-exactly-by-the-repository · MUST
`bunfig.toml` sets `[run] bun = true`, so a tool with a Node shebang runs on the pinned Bun.

| Why | Tags |
|---|---|
| a tool with a Node shebang otherwise runs on whichever Node the machine finds, and one runtime for the program and its tools means one version to pin. | [] |

### no-automatic-env-file → configuration-parsed-once-at-start · MUST
Bun's automatic loading of the local environment file is off — `--no-env-file` in the entry's shebang — so the program parses only the variables its deployment provides.

| Why | Tags |
|---|---|
| a file loaded behind the program's back sets values nobody declared, and hides a missing one. | [] |

### other-runtime-only-where-bun-cannot · SHOULD
Another runtime is pinned only for a tool Bun cannot run, with the reason written beside its pin.

| Why | Tags |
|---|---|
| each exception is a second runtime to pin and keep; its reason says when it can go. | [] |

### programs-built-by-bun-build · SHOULD
A program whose build no other active block owns is built by `bun build`.

| Why | Tags |
|---|---|
| the build resolves modules as the runtime does, so what was run and tested is what ships. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `workspace-tool-links-units-from-the-working-tree` | `workspace:*` resolves a unit from the working tree | yes |
| `publishing-tool-supports-run-identity-and-provenance` | `bun publish` has no provenance and no trusted publishing, so npm publishes (`units-published-by-npm`) | no |
