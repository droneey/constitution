# Layers

> Governs the place of the shared flags, of the command-line parser and of a command.

## Homes

### shared-flag-declared-once-in-shared → shared-piece-placed-by-meaning · SHOULD

A flag two or more commands take is declared once, in `shared/`, and every command that takes it imports that declaration.

| Why |
|---|
| a flag then means the same in every command that takes it, and no command owns a declaration the others borrow. |

### command-parser-imported-by-the-command-files → layer-imports-dependencies-by-its-role · MUST

The library that parses the command line has its home past the edge in the command files alone, in the operation folders of the `app/` of features and of composition modules.

| Why |
|---|
| a command lives beside its operation, and the parser stays out of the domain and the use cases below it. |

## Delivery units

### command-is-its-operations-binding-unit → delivery-unit-beside-what-it-serves · SHOULD

A command is the binding unit of the operation it runs: one file carrying the role suffix **`.cli`** in the language's spelling, in that operation's folder of the application layer — `use-cases/{queries,commands}/<op>/` of the feature, or of the composition module whose features it composes; no folder of the tree gathers the commands.

| Why |
|---|
| a command changes with its operation and is found beside it, as a binding unit of any other interface is; a folder that gathers commands names the platform the whole program already is. |
