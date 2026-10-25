# Root

> Governs how the root builds and registers a command.

## Wiring

### command-built-by-a-factory-the-root-calls → delivery-unit-registered-by-the-root · MUST

Each command file exports a factory named after its command in the language's spelling, which builds the command from the context it is handed; the root builds the context, calls each factory and registers the command it returns.

| Why |
|---|
| a command receives what it needs from the root, the root lists every command the program answers, and a spec builds a command with fakes. |
