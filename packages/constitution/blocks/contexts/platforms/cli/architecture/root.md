# Root

> Governs how the root builds and registers a command.

## Assembly

### command-built-by-a-factory-the-root-calls → delivery-unit-registered-by-the-root · MUST

The root builds every command from the context it hands it, and registers it. By default each command file exports a factory named after its command in the language's spelling, which builds the command from that context, and the root calls each factory and registers the command it returns; a framework's block may give a command another form, which the root builds and registers alike. No command builds what it needs or registers itself.

| Why |
|---|
| a command that builds what it needs, or registers itself, binds itself to the real adapters, so no spec can build it with fakes, and the root no longer lists every command the program answers. |
