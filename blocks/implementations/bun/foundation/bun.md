# Bun

## Packages and installs

## bun-is-the-only-package-manager → dependencies-pinned-by-lockfile
`bun.lock` is the only lockfile of the repository's TypeScript; no lockfile of npm, yarn or pnpm is kept.

| Why | Check | Tags |
|---|---|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. | review | [] |

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

## no-automatic-env-file → configuration-parsed-once-at-boot
Bun's automatic loading of the local environment file is off — `--no-env-file` in the entry's shebang — so the program parses only the variables its deployment provides.

| Why | Check | Tags |
|---|---|---|
| a file loaded behind the program's back sets values nobody declared, and hides a missing one. | review | [] |

## other-runtime-only-where-bun-cannot · SHOULD
Another runtime is pinned only for a tool Bun cannot run, with the reason written beside its pin.

| Why | Check | Tags |
|---|---|---|
| each exception is a second runtime to pin and keep; its reason says when it can go. | review | [] |

## programs-built-by-bun-build · SHOULD
A program whose build no other active block owns is built by `bun build`.

| Why | Check | Tags |
|---|---|---|
| the build resolves modules as the runtime does, so what was run and tested is what ships. | review | [] |
