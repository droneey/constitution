# Layout

> Governs a server's tree: where its processes enter, and where its probes and stop path live.

## Form

### server-processes-entered-from-entrypoints → package-laid-out-by-the-tree · MUST

Each kind of process a server runs starts from an entry of its own. The process that serves starts from `main`, and every other process the server's artefact runs — a worker, a scheduler, a migration run, a seed, a repair — from an entry under `entrypoints/<name>/`, which runs its kind assembled with only what that kind needs.

| Why |
|---|
| a kind of process with no entry of its own hides behind the server's start or ships apart from the one artefact its release promotes, and is assembled with parts it never uses — the twelve-factor app. |

## Homes

### server-probes-and-stop-path-know-no-product → shared-piece-placed-by-meaning · MUST

A server's probes and its stop path know nothing of the product. They live in `libs/`, or come with the server's framework, and no feature and no delivery unit of the product holds them.

| Why |
|---|
| a probe or a stop path written into the product is written and proven again in every server, and the feature or delivery unit that holds it must reach every part the root alone knows. |
