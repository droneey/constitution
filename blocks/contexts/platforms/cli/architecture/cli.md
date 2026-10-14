# Command line

> Governs the command line's place in the tree: its commands, their registration and their shared flags.

## Layers

### shared-flag-declared-once-in-shared → shared-piece-placed-by-meaning · SHOULD
A flag two or more commands take is declared once, in `shared/`, and every command that takes it imports that declaration.

| Why | Tags |
|---|---|
| a flag then means the same in every command that takes it, and no command owns a declaration the others borrow. | [] |

### command-is-its-operations-binding-unit → delivery-unit-beside-what-it-serves · SHOULD
A command is the binding unit of the operation it runs: one file carrying the `cli` role in the language's spelling, in that operation's folder of the application layer — `use-cases/{queries,commands}/<op>/` of the feature, or of the composition module whose features it composes; no folder of the tree gathers the commands.

| Why | Tags |
|---|---|
| a command changes with its operation and is found beside it, as a binding unit of any other interface is; a folder that gathers commands names the platform the whole program already is. | [] |
