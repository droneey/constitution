# Server

> Governs where a server's processes, probes and stop live in the tree, and who wires them.

## Layout

### server-processes-entered-from-entrypoints → package-laid-out-by-the-tree · SHOULD
The process that serves starts from `main`, and every other process a server's artefact runs — a worker, a scheduler, a migration run, a seed, a repair — from an entry of its own under `entrypoints/<name>/`, which builds the composition root with only what its kind needs.

| Why | Tags |
|---|---|
| each kind of process is found by its name, ships in the one artefact its release promotes, and wires no part it never uses. | [] |

### server-probes-and-stop-path-live-in-the-root → package-laid-out-by-the-tree · SHOULD
A server's probes and its stop path live in `root/`, beside the handler of last resort; no feature and no delivery unit of the product holds them.

| Why | Tags |
|---|---|
| the root alone knows every part a probe reports on and every resource the stop releases, and the product's delivery layer stays the product's. | [] |

## Ports

### readiness-check-offered-by-the-adapter · SHOULD
An adapter of a system the server cannot serve without offers a check of its connection, which the composition root registers with the readiness probe; no port, use case or feature carries a health check.

| Why | Tags |
|---|---|
| how a system is reached is known only to its adapter, and a check put on a port asks every implementation, fakes included, for something no caller of the port needs. | [] |

## Root

### server-lifecycle-wired-by-the-root → composition-root-wires-everything · MUST
The composition root runs a server's lifecycle: it opens the listeners and the consumers only once every part they use is built, and at the stop closes them first and the parts they used after, in the reverse order it built them.

| Why | Tags |
|---|---|
| work taken before its parts are ready fails, and a part closed under work still running turns a clean stop into failures. | [errors] |
