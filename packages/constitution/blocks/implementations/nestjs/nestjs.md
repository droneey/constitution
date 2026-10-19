---
id: nestjs
summary: NestJS — modules, providers and the injector that wires them.
requires: [typescript, tsc, _api, http-server]
extends: null
abstract: false
languages: []
dictionary: [NestJS, Nest, "@nestjs", nestjs-pino, nest-cli.json, .swcrc]
governs: ["nest-cli.json", ".swcrc", "**/root/**", "**/*.module.ts", "**/*.controller.ts"]
---

# NestJS

> Builds an HTTP server program from modules whose providers the injector wires by their constructors' types.

NestJS's parts of the Constitution's release archive and the template `templates/project/typescript/nestjs/.swcrc` keep the decorator metadata the injector reads.

**Vocabulary:** suffixes `.module`, a module; `.controller`, a controller; `.provider`, a token bound to its implementation by `useClass` or `useFactory`; `.filter`, `.pipe`, `.guard` and `.interceptor`, the framework's providers of a request.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `framework-passes-every-failure-to-one-handler` | a global exception filter whose `@Catch()` names no class receives every exception, the `NotFoundException` of an unknown route or method and the `BadRequestException` of a malformed body included | yes |
| `framework-parses-a-request-before-its-handler` | a pipe, global or bound to a parameter, parses it before the controller's method runs, and the error it throws reaches the filter | yes |
