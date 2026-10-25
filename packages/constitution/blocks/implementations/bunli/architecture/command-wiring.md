# Command wiring

> Governs a command file, where bunli is imported, and the configuration the root gives the commands.

## General

### bunli-command-from-a-factory → command-built-by-a-factory-the-root-calls · MUST

A command's factory returns `defineCommand({ name, description, options, handler })`, and `createCLI` registers the commands the root built.

| Why | Tags |
|---|---|
| the command then carries everything bunli needs of it, and the program lists what the root registered, nothing else. | [] |

### bunli-imported-by-commands → command-parser-imported-by-the-command-files · MUST

bunli is the command-line parser, imported in the command files, `<op>.cli.ts`.

| Why | Tags |
|---|---|
| the setting that holds the parser's home names its package. | [] |

### bunli-configured-inline → composition-root-wires-everything · MUST

The root gives `createCLI` the program's configuration — its name, version, description and plugins — inline.

| Why | Tags |
|---|---|
| the root then names every choice the program makes, and a spec builds the same program from it. | [] |
