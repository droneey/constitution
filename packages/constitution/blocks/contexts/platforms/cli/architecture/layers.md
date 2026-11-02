# Layers

> Governs the layers of a command-line program: where the command-line parser sits.

## Direction

### command-parser-imported-by-the-command-files → layer-imports-dependencies-by-its-role · MUST

Outside the edge, only the command files import the command-line parser. They are the parser's one home there, in the presentation of features, of composition modules and of the program.

| Why |
|---|
| a parser imported by the domain or its use cases ties them to one command line, so they cannot be reused by another interface or tested without it. |
