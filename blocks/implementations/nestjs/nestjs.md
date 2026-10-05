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
| `one-explicit-composition-root` | the modules' `providers` are where the program is wired: each binds a token to its implementation with `useClass` or `useFactory` (`contracts-injected-by-token`), and the injector follows only those declarations; a provider takes its dependencies through its constructor (`providers-injected-through-the-constructor`), never asks the injector for one (`injector-never-asked-for-a-dependency`), and no module is global (`no-global-module`) | yes |
| `compiler-is-the-type-gate` | `tsc --noEmit` runs with `strict` and every listed option, `verbatimModuleSyntax` included; a field the framework fills is marked definite (`framework-filled-fields-marked-definite`), and an injected class is imported as a value (`injected-classes-imported-as-values`) | yes |
