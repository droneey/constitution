# NestJS

## nestjs-keeps-decorator-metadata · MUST
The compiler and the build keep what Nest's injector reads: `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

| Why | Check | Tags |
|---|---|---|
| Nest finds a provider by the type its constructor names, which only decorator metadata carries; without it the injector passes `undefined` and the program fails at its first request. | review | [errors] |

## compiler-keeps-decorator-metadata → nestjs-keeps-decorator-metadata
The compiler's options set `experimentalDecorators` and `emitDecoratorMetadata`.

| Why | Check | Tags |
|---|---|---|
| without them the injector reads no constructor types and wires nothing. | tool/types | [] |

## injected-classes-imported-as-values → nestjs-keeps-decorator-metadata
A class a decorated constructor names is imported as a value, never with `import type`, and no lint rule that asks for the type import runs on the program.

| Why | Check | Tags |
|---|---|---|
| the metadata of a class imported as a type is `Object`, which the injector cannot resolve, and the compiler reports nothing. | review | [] |

## framework-filled-fields-marked-definite → compiler-is-the-type-gate
A field of a class the framework fills — a body, a query or the parameters of a request — has no initializer and is marked definite: `name!: string`, or `name?: string` when it may be absent.

| Why | Check | Tags |
|---|---|---|
| the framework assigns these fields after it builds the object, and `!` says so to `strictPropertyInitialization`, which still refuses any other field left unset. | tool/types | [] |

## program-throws-no-http-exception → framework-errors-never-raised
The program throws the error kit's errors, never `HttpException` or one of its subclasses.

| Why | Check | Tags |
|---|---|---|
| an `HttpException` carries a status and no code, and ties the code that throws it to HTTP. | review | [errors] |
