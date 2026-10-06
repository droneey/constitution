# Bun

## Running

## process-env-read-only-in-root → environment-read-only-by-the-root
The environment is `process.env`, read only under `root/`, in the entry files and in specs.

| Why | Check | Tags |
|---|---|---|
| it is where a Bun program reads a variable, and the linter refuses it everywhere else, so a read deep in the program fails the check. | tool/lint | [] |
