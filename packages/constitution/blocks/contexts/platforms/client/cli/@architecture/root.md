# Root

> Governs how the composition root builds a subcommand's binding unit.

## Assembly

### subcommand-built-by-a-factory-the-root-calls → unit-handed-its-dependencies · SHOULD

Every subcommand's binding unit is built by a factory its file offers, which the composition root calls with what the unit needs. Exempt: a binding unit whose framework's block gives it another form, which the root builds alike.

| Why |
|---|
| a binding unit that builds what it needs binds itself to the real adapters, so no spec can build it with fakes. |
