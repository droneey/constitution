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
`package.json` always declares `trustedDependencies`, naming each dependency whose install script may run, and `[]` when none may: without the field, Bun runs the scripts of its own list of popular packages.

| Why | Check | Tags |
|---|---|---|
| an install script runs with the developer's rights; listing each package keeps that a decision, not a default. | review | [] |

## release-age-set-for-installs → dependency-release-cooldown
`minimumReleaseAge` under `[install]` in `bunfig.toml` sets the cooldown for new releases, and `minimumReleaseAgeExcludes` holds the exemptions, each with any new dependency it brings.

| Why | Check | Tags |
|---|---|---|
| the package manager then holds the cooldown on every install, not only the bot, and a dependency the fix brings is a new release too. | review | [] |

## Running

## every-tool-runs-on-bun → tools-run-on-the-pinned-runtime
`bunfig.toml` sets `[run] bun = true`, so a tool with a Node shebang runs on the pinned Bun.

| Why | Check | Tags |
|---|---|---|
| a tool with a Node shebang otherwise runs on whichever Node the machine finds, and one runtime for the program and its tools means one version to pin. | review | [] |

## other-runtime-only-where-bun-cannot → tools-run-on-the-pinned-runtime
Another runtime or tool runs only where Bun cannot run it, with the reason written in the configuration or script that makes the exception, and that runtime is pinned in the toolchain's file like Bun.

| Why | Check | Tags |
|---|---|---|
| each exception is a second runtime to pin and keep; pinned, it runs in one version everywhere, and its reason says when it can go. | review | [] |

## programs-built-by-bun-build · SHOULD
A program whose build no other active block owns is built by `bun build`.

| Why | Check | Tags |
|---|---|---|
| the build resolves modules as the runtime does, so what was run and tested is what ships. | review | [] |

## check-chains-area-scripts → check-chains-one-entry-per-area
The entries are scripts of `package.json`, and `check` chains the check scripts with `&&`.

| Why | Check | Tags |
|---|---|---|
| `bun run` runs a script of `package.json` by its name, and `&&` stops the chain at the first script that fails. | review | [] |

