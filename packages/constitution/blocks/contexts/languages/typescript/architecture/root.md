# Root

> Governs the composition root in TypeScript: its wiring file and the reading of the environment.

## Wiring

### wiring-file-is-root-wiring-ts → composition-root-wires-everything · MUST

The program is wired in `root/wiring.ts`, unless the block of the program's framework names another file.

| Why |
|---|
| the one known place core asks for then has one name in every TypeScript program, and a reader opens it without searching. |

### process-env-read-only-under-root → root-alone-reads-the-environment · MUST

`process.env`, and every alias of it the runtime offers, is read only under `root/`, in the entry files and in specs.

| Why |
|---|
| it is where a TypeScript program on a server or a command line reads a variable, and a read deep in the program is a dependency on the process that no signature shows. |
