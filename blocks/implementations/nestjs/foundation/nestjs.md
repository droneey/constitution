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

## program-throws-no-http-exception → framework-errors-never-raised
The program throws the error kit's errors, never `HttpException` or one of its subclasses.

| Why | Check | Tags |
|---|---|---|
| an `HttpException` carries a status and no code, and ties the code that throws it to HTTP. | review | [errors] |
