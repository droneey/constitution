# Layers

> Governs the place of the shared flags, of the command-line parser and of a command.

## Homes

### shared-flag-declared-once-in-shared → shared-piece-placed-by-meaning · SHOULD

A flag two or more commands take is declared once, in `shared/`, and every command that takes it imports that declaration.

| Why | Tags |
|---|---|
| a flag then means the same in every command that takes it, and no command owns a declaration the others borrow. | [] |

### command-parser-imported-by-the-command-files → layer-imports-dependencies-by-its-role · MUST

The library that parses the command line has its home past the edge in the command files alone, in the operation folders of the `app/` of features and of composition modules.

| Why | Tags |
|---|---|
| a command lives beside its operation, and the parser stays out of the domain and the use cases below it. | [] |

## Delivery units

### command-is-its-operations-binding-unit → delivery-unit-beside-what-it-serves · SHOULD

A command is the binding unit of the operation it runs: one file carrying the `cli` role in the language's spelling, in that operation's folder of the application layer — `use-cases/{queries,commands}/<op>/` of the feature, or of the composition module whose features it composes; no folder of the tree gathers the commands.

| Why | Tags |
|---|---|
| a command changes with its operation and is found beside it, as a binding unit of any other interface is; a folder that gathers commands names the platform the whole program already is. | [] |

### command-built-by-a-factory-the-root-calls → delivery-unit-stays-thin · SHOULD

Each command file exports a factory named after its command in the language's spelling, which builds the command from the context it is handed; the root builds the context, calls each factory and registers the command it returns.

| Why | Tags |
|---|---|
| a command receives what it needs from the root, the root lists every command the program answers, and a spec builds a command with fakes. | [] |
