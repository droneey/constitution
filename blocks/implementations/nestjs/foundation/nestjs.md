# NestJS

### nestjs-keeps-decorator-metadata · MUST
The compiler and the build keep what Nest's injector reads: `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`, and, where swc builds the program, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

| Why | Tags |
|---|---|
| Nest finds a provider by the type its constructor names, which only decorator metadata carries; without it the injector passes `undefined` and the program fails at its first request. | [errors] |

### compiler-keeps-decorator-metadata → nestjs-keeps-decorator-metadata
The compiler's options set `experimentalDecorators` and `emitDecoratorMetadata`.

| Why | Tags |
|---|---|
| without them the injector reads no constructor types and wires nothing. | [] |

### injected-classes-imported-as-values → nestjs-keeps-decorator-metadata
A class a decorated constructor names is imported as a value, never with `import type`, and no lint rule that asks for the type import runs on the program.

| Why | Tags |
|---|---|
| the metadata of a class imported as a type is `Object`, which the injector cannot resolve, and the compiler reports nothing. | [] |

### decorated-constructor-takes-every-dependency → parameters-at-most-three-wholes-as-one-object
A constructor the injector calls takes one parameter for each dependency, however many: the injector imposes its signature, so the limit of three positions leaves it out, and the linter's limit is lifted in the files that hold such classes.

| Why | Tags |
|---|---|
| the injector resolves each parameter by its type, so dependencies gathered into one object would no longer be injected; a class with too many is split by its responsibilities, not by its signature. | [] |

### framework-filled-fields-marked-definite → compiler-is-the-type-gate
A field of a class the framework fills — a body, a query or the parameters of a request — has no initializer and is marked definite: `name!: string`, or `name?: string` when it may be absent.

| Why | Tags |
|---|---|
| the framework assigns these fields after it builds the object, and `!` says so to `strictPropertyInitialization`, which still refuses any other field left unset. | [] |

### nest-exceptions-answered-by-their-kind → failure-answered-by-its-code
An `HttpException` Nest throws before a controller runs — the `NotFoundException` of an unknown route or method, the `BadRequestException` of a malformed body — is answered as the kind its status maps to.

| Why | Tags |
|---|---|
| Nest throws these with no code of the error kit, so their answer takes its kind from their status, and the caller learns what to correct. | [errors] |

### program-throws-no-http-exception → errors-carry-codes-not-statuses
The program throws the error kit's errors, never `HttpException` or one of its subclasses.

| Why | Tags |
|---|---|
| an `HttpException` carries a status and no code, and ties the code that throws it to HTTP. | [errors] |
