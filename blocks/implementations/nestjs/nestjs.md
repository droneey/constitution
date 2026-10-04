---
id: nestjs
summary: NestJS — modules, providers and the injector that wires them.
requires: [typescript, tsc]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [NestJS, Nest, "@nestjs", nestjs-pino, nest-cli.json, .swcrc]
governs: ["nest-cli.json", ".swcrc"]
---

# NestJS

> Builds a server program from modules whose providers the injector wires by their constructors' types. Its parts of the constitution's release archive and the template `templates/project/nestjs/.swcrc` keep the decorator metadata the injector reads.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `one-explicit-composition-root` | the modules are the one place the program is wired, and a provider receives its dependencies through its constructor, but Nest's injector builds them from the modules' declarations — the container the rule forbids | partly |
| `compiler-is-the-type-gate` | `tsc --noEmit` runs with `strict` and the listed options, but `verbatimModuleSyntax` and `strictPropertyInitialization` are off: decorator metadata needs a constructor's types imported as values, and a class the framework fills from a request has no initializer | partly |
