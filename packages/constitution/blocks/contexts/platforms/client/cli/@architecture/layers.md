# Layers

> Governs the layers of a command-line program: where its command-line parser is imported.

## Direction

### command-line-parser-imported-only-by-binding-units → layer-imports-dependencies-by-its-role · MUST

Outside the edge, only the binding units of the program's subcommands import its command-line parser.

| Why |
|---|
| a parser imported by the domain or its use cases ties them to one command line, so they cannot be reused by another interface or tested without it. |
