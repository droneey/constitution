# NestJS

## nestjs-keeps-decorator-metadata · MUST
The compiler and the build keep what Nest's injector reads: `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

| Why | Check | Tags |
|---|---|---|
| Nest finds a provider by the type its constructor names, which only decorator metadata carries; without it the injector passes `undefined` and the program fails at its first request. | tool/types | [errors] |
