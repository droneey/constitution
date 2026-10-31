# Command wiring

> Governs a command file.

## General

### bunli-command-from-a-factory → command-built-by-a-factory-the-root-calls · MUST

A command's factory returns `defineCommand({ name, description, options, handler })`, and `createCLI` registers the commands the root built.

| Why |
|---|
| the command then carries everything bunli needs of it, and the program lists what the root registered, nothing else. |
