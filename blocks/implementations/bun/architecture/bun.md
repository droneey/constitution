# Bun

## Running

### process-env-read-only-in-root → root-alone-reads-the-environment · MUST
The environment is `process.env`, read only under `root/`, in the entry files and in specs.

| Why | Tags |
|---|---|
| it is where a Bun program reads a variable, and the linter refuses it everywhere else, so a read deep in the program fails the check. | [] |

### bun-global-reached-only-from-the-edge → effects-held-only-by-the-edge · MUST
Outside the edge, no code calls through the `Bun` global — `Bun.file`, `Bun.spawn`, `Bun.write` and the rest.

| Why | Tags |
|---|---|
| the global reaches the file system, processes and the network with no import, so only a check of the calls keeps it out of the layers that reach effects through ports. | [] |
