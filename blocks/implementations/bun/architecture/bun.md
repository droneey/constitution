# Bun

## Running

## process-env-read-only-in-root → environment-read-once-at-boot
The environment is `process.env`, read only under `root/`, in the entry files and in specs.

| Why | Check | Tags |
|---|---|---|
| it is where a Bun program reads a variable, and the linter refuses it everywhere else, so a read deep in the program fails the check. | tool/lint | [] |

## no-automatic-env-file → environment-read-once-at-boot
Bun's automatic loading of the local environment file is off — `--no-env-file` in the entry's shebang and in the scripts — so the program reads its environment only where the configuration is parsed.

| Why | Check | Tags |
|---|---|---|
| a file loaded behind the program's back sets values nobody declared, and hides a missing one. | review | [] |
