# Decorators

> Governs the classes the injector and the framework build: their metadata, imports and fields.

## General

### nestjs-keeps-decorator-metadata · MUST

The compiler and the build keep what Nest's injector reads: `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`, and, where swc builds the program, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

| Why |
|---|
| Nest finds a provider by the type its constructor names, which only decorator metadata carries; without it the injector passes `undefined` and the program fails at its first request. |

### injected-classes-imported-as-values → type-only-import-written-as-import-type · MUST

A class a decorated constructor names is imported as a value, never with `import type`; the lint rule that asks for the type import is lifted only in the files of the classes the injector builds.

| Why |
|---|
| the metadata of a class imported as a type is `Object`, which the injector cannot resolve, and the compiler reports nothing. |

### framework-filled-fields-marked-definite → compiler-is-the-type-gate · MUST

A field of a class the framework fills — a body, a query or the parameters of a request — has no initializer and is marked definite: `name!: string`, or `name?: string` when it may be absent.

| Why |
|---|
| the framework assigns these fields after it builds the object, and `!` says so to `strictPropertyInitialization`, which still refuses any other field left unset. |
