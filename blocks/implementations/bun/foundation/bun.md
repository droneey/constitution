# Bun

## Packages and installs

## bun-is-the-only-package-manager → dependencies-pinned-by-lockfile
Bun installs (`bun install`), runs scripts (`bun run`) and runs binaries (`bunx`); never npm, yarn, pnpm or npx, except `npm publish` in the release workflow. `bun.lock` is the only lockfile, and no other is committed.

| Why | Check | Tags |
|---|---|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. | review | [] |

## installs-follow-the-lockfile → dependencies-pinned-by-lockfile
CI and every script install with `bun install --frozen-lockfile`.

| Why | Check | Tags |
|---|---|---|
| an install that may update the lockfile runs code nobody reviewed. | review | [] |

## trusted-dependencies-listed-by-name → install-scripts-only-for-listed-dependencies
Bun runs no dependency's install script unless `trustedDependencies` in `package.json` lists that package by name.

| Why | Check | Tags |
|---|---|---|
| an install script runs with the developer's rights; listing each package keeps that a decision, not a default. | review | [] |

## release-age-set-for-installs → dependency-release-cooldown
`minimumReleaseAge` under `[install]` in `bunfig.toml` sets the cooldown for new releases.

| Why | Check | Tags |
|---|---|---|
| the package manager then holds the cooldown on every install, not only the bot. | review | [] |

## Running

## every-tool-runs-on-bun · SHOULD
`bunfig.toml` sets `[run] bun = true`, so every tool, one with a Node shebang included, runs on the pinned Bun.

| Why | Check | Tags |
|---|---|---|
| one runtime for the program and its tools means one version to pin and one behaviour to trust. | review | [] |

## other-runtime-only-where-bun-cannot · SHOULD
Another runtime or tool runs only where Bun cannot run it, with the reason written in the configuration or script that makes the exception.

| Why | Check | Tags |
|---|---|---|
| each exception is a second runtime to pin and keep; its reason says when it can go. | review | [] |

## programs-built-by-bun-build · SHOULD
A program is built by `bun build`.

| Why | Check | Tags |
|---|---|---|
| the build resolves modules as the runtime does, so what was run and tested is what ships. | review | [] |

## check-chains-tool-scripts → one-check-command
Each tool has an `<area>:check` script that only checks, and an `<area>:fix` beside it where the tool can write; `check` chains the check scripts.

| Why | Check | Tags |
|---|---|---|
| CI, the hooks and a person run the same script names, so the names stay stable. | review | [] |
