# NestJS

## nestjs-keeps-decorator-metadata · MUST
The compiler and the build keep what Nest's injector reads: `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

| Why | Check | Tags |
|---|---|---|
| Nest finds a provider by the type its constructor names, which only decorator metadata carries; without it the injector passes `undefined` and the program fails at its first request. | tool — types | [errors] |

## providers-injected-through-the-constructor · SHOULD
A provider takes its dependencies as `private readonly` parameters of its constructor, never from a module's own instance or a global.

| Why | Check | Tags |
|---|---|---|
| a dependency the constructor names is one the injector replaces in a spec; one taken from elsewhere is fixed for good. | review | [testing] |
