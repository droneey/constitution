---
id: nestjs
summary: NestJS — modules, providers and the injector that wires them.
requires: [typescript, tsc, api]
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
| `one-explicit-composition-root` | the modules' `providers` are where the program is wired: the root module names each feature's module in its `imports`, each provider binds a token to its implementation with `useClass` or `useFactory` (`contracts-injected-by-token`), and the injector follows only those declarations; a provider takes its dependencies through its constructor (`providers-injected-through-the-constructor`), never asks the injector for one (`injector-never-asked-for-a-dependency`), and no module is global (`no-global-module`) | yes |
| `every-failure-reaches-one-handler` | a global exception filter whose `@Catch()` names no class receives every exception, the `NotFoundException` of an unknown route or method and the `BadRequestException` of a malformed body included | yes |
| `request-parsed-before-its-handler` | a pipe, global or bound to a parameter, parses it before the controller's method runs, and the error it throws reaches the filter | yes |
| `compiler-is-the-type-gate` | `tsc --noEmit` runs with `strict` and every listed option, `verbatimModuleSyntax` included; a field the framework fills is marked definite (`framework-filled-fields-marked-definite`), and an injected class is imported as a value (`injected-classes-imported-as-values`) | yes |
