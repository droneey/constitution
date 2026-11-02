# Decorators

> Governs the classes the injector and the framework build: their metadata, imports and fields.

## General

### nestjs-keeps-decorator-metadata · MUST

The compiler and the build keep the decorator metadata Nest's injector reads. They set `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json` and, where swc builds the program, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

| Why |
|---|
| Nest finds a provider by the type its constructor names, which only decorator metadata carries; without it the injector passes `undefined` and the program fails at its first request. |

### injected-classes-imported-as-values → type-only-import-written-as-import-type · MUST

A class a decorated constructor names is imported as a value, never with `import type`. The lint rule that asks for the type import is lifted only in the files of the classes the injector builds.

| Why |
|---|
| the metadata of a class imported as a type is `Object`, which the injector cannot resolve, and the compiler reports nothing. |

### framework-filled-fields-marked-definite → compiler-is-the-type-gate · MUST

A field the framework fills is marked definite, or optional where it may be absent, and has no initializer. Such a field — a body, a query or the parameters of a request — is written `name!: string`, or `name?: string` when it may be absent.

| Why |
|---|
| the framework assigns these fields after it builds the object, so `strictPropertyInitialization` refuses them unmarked; `!` says so, and the compiler still refuses any other field left unset. |
