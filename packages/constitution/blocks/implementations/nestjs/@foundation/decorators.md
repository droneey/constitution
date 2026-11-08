# Decorators

> Governs the classes the injector and the framework build: their metadata, imports and fields.

## General

### nestjs-keeps-decorator-metadata · MUST

Every build of a Nest program keeps the decorator metadata Nest's injector reads, in the legacy decorators the framework requires. It sets `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json` and, where swc builds the program, `legacyDecorator` and `decoratorMetadata` in `.swcrc`.

#### Why

Nest finds a provider by the type its constructor names, which only the legacy decorators' metadata carries, NestJS 12 among the versions that keep them; without it the injector passes `undefined` and the program fails at its first request.

#### Examples

```json title="Avoid"
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "strict": true
  }
}
```

```json title="Prefer"
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### injected-classes-imported-as-values → type-only-import-written-as-import-type · MUST

Every class a decorated constructor names is imported as a value, never with `import type`.

#### Why

The metadata of a class imported as a type is `Object`, which the injector cannot resolve, and the compiler reports nothing.

#### Examples

```ts title="Avoid"
// src/presentation/bindings/session.guard.ts
import { Injectable } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

@Injectable()
export class SessionGuard {
  constructor(private readonly reflector: Reflector) {}
}
```

```ts title="Prefer"
// src/presentation/bindings/session.guard.ts
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SessionGuard {
  constructor(private readonly reflector: Reflector) {}
}
```

### framework-filled-fields-marked-definite → compiler-strict-options-set · MUST

Every field the framework fills is marked definite, or optional where it may be absent, and has no initializer. Such a field, of a body, a query or the parameters of a request, is written `name!: string`, a definite assignment assertion, which is no non-null assertion, or `name?: string` when it may be absent.

#### Why

The framework assigns these fields after it builds the object, so `strictPropertyInitialization` refuses them unmarked; `!` says so, and the compiler still refuses any other field left unset.

#### Examples

```ts title="Avoid"
export class PlaceOrderBody {
  @IsString()
  cartId: string = '';

  @IsString()
  couponCode: string = '';
}
```

```ts title="Prefer"
export class PlaceOrderBody {
  @IsString()
  cartId!: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
```
