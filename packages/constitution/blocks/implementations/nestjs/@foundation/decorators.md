# Decorators

> Governs the classes the injector and the framework build: their metadata, imports and fields.

## General

### nestjs-keeps-decorator-metadata · MUST

Every build of a Nest program keeps the decorator metadata Nest's injector reads, in the legacy decorators the framework requires. It sets `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json` and, where swc builds the program, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

| Why |
|---|
| Nest finds a provider by the type its constructor names, which only the legacy decorators' metadata carries, NestJS 12 among the versions that keep them; without it the injector passes `undefined` and the program fails at its first request. |

### injected-classes-imported-as-values → type-only-import-written-as-import-type · MUST

Every class a decorated constructor names is imported as a value, never with `import type`.

| Why |
|---|
| the metadata of a class imported as a type is `Object`, which the injector cannot resolve, and the compiler reports nothing. |

### framework-filled-fields-marked-definite → compiler-strict-options-set · MUST

Every field the framework fills is marked definite, or optional where it may be absent, and has no initializer. Such a field, of a body, a query or the parameters of a request, is written `name!: string`, a definite assignment assertion, which is no non-null assertion, or `name?: string` when it may be absent.

| Why |
|---|
| the framework assigns these fields after it builds the object, so `strictPropertyInitialization` refuses them unmarked; `!` says so, and the compiler still refuses any other field left unset. |
