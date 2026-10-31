# Layers

> Governs the layers of a command-line program: where the command-line parser and a command sit.

## Homes

### command-parser-imported-by-the-command-files → layer-imports-dependencies-by-its-role · MUST

The library that parses the command line has its home past the edge in the command files alone, in the operation folders of the presentation of features and of composition modules.

| Why |
|---|
| a command lives beside its operation, and the parser stays out of the domain and the use cases below it. |

## Delivery units

### command-is-its-operations-binding-unit → delivery-unit-beside-what-it-serves · SHOULD

A command is the binding unit of the operation it runs: one file carrying the role suffix **`.cli`**{#command-binding} in the language's spelling, in that operation's folder of the presentation — `bindings/{queries,commands}/<op>/` of the feature, or of the composition module whose features it composes; no folder of the tree gathers the commands.

| Why |
|---|
| a command changes with its operation and is found beside it, as a binding unit of any other interface is; a folder that gathers commands names the platform the whole program already is. |
