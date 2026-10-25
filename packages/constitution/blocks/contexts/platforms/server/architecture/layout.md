# Layout

> Governs where the server's processes, probes and stop live.

## Form

### server-processes-entered-from-entrypoints → package-laid-out-by-the-tree · SHOULD

The process that serves starts from `main`, and every other process a server's artefact runs — a worker, a scheduler, a migration run, a seed, a repair — from an entry of its own under `entrypoints/<name>/`, which builds the composition root with only what its kind needs.

| Why |
|---|
| each kind of process is found by its name, ships in the one artefact its release promotes, and wires no part it never uses. |

### server-probes-and-stop-path-live-in-the-root → package-laid-out-by-the-tree · SHOULD

A server's probes and its stop path live in `root/`, beside the handler of last resort; no feature and no delivery unit of the product holds them.

| Why |
|---|
| the root alone knows every part a probe reports on and every resource the stop releases, and the product's delivery units stay the product's. |
