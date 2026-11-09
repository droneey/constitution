# Modules

> Governs the suffixes of Nest's files and their place in the tree, what a feature's module imports, registers and takes from the root, and global modules.

## Vocabulary

A module's file ends in **`.module.ts`**{#nest-module}: a feature's module file is `<feature>.module.ts`, and a composition module's `<name>.module.ts`. A controller's file ends in **`.controller.ts`**{#nest-controller}; a file of tokens bound to their implementations by `useClass` or `useFactory` ends in **`.providers.ts`**{#nest-provider}, a pipe and an interceptor, the framework's providers of a request, in **`.pipe.ts`**{#nest-pipe} and **`.interceptor.ts`**{#nest-interceptor}, and a guard and an exception filter, which decide for the operations they guard or answer, in **`.guard.ts`**{#nest-guard} and **`.filter.ts`**{#nest-filter}.

**`module/`**{#framework-module} holds a presentation's one module, and **`providers/`**{#framework-provider} the framework's providers.

## General

### nest-module-sits-in-the-presentation-it-serves → delivery-unit-beside-what-it-serves · MUST

Every Nest module lives in the `module/` of the presentation it serves. Exempt: the root's module, `root/root.module.ts`, one of the root's own files.

#### Why

A module placed by habit is looked for in a different place in each program, one outside its feature's presentation hides which feature it belongs to, and the check of imports lets Nest's packages into a presentation and its `providers/` alone.

#### Examples

```text title="Avoid"
src/
├── features/orders/
│   ├── application/
│   ├── presentation/bindings/orders.controller.ts
│   └── orders.module.ts
└── root/root.module.ts
```

```text title="Prefer"
src/
├── features/orders/
│   ├── application/
│   └── presentation/
│       ├── bindings/orders.controller.ts
│       └── module/orders.module.ts
└── root/root.module.ts
```

### nest-controller-carries-the-controller-suffix → file-carries-its-role-suffix · MUST

Every controller sits in a file that ends in `.controller.ts`.

#### Why

A controller named otherwise hides its role, and the lint settings that let a controller's decorated constructor import its classes as values miss it.

#### Examples

```text title="Avoid"
features/orders/presentation/
├── bindings/
│   ├── orders.ts
│   └── index.ts
└── module/orders.module.ts
```

```text title="Prefer"
features/orders/presentation/
├── bindings/
│   ├── orders.controller.ts
│   └── index.ts
└── module/orders.module.ts
```

### global-guard-registered-as-app-guard → delivery-unit-registered-by-the-root · MUST

Every global guard is an interface-wide unit of the presentation, which the root's module registers as `APP_GUARD`.

#### Why

A guard bound route by route leaves the route someone forgot open to every caller, and a global guard kept among the root's files decides who passes where no case proves it.

#### Examples

```ts title="Avoid"
@Controller('orders')
@UseGuards(SessionGuard)
export class OrdersController {
  constructor(@Inject(PLACE_ORDER) private readonly placeOrder: PlaceOrder) {}
}
```

```ts title="Prefer"
// src/root/root.module.ts
import { SessionGuard } from '../presentation';

@Module({
  imports: [OrdersModule.register({ imports: [OrdersAdaptersModule] })],
  providers: [{ provide: APP_GUARD, useClass: SessionGuard }],
})
export class RootModule {}
```

### feature-module-is-where-the-root-assembles-its-feature → composition-root-assembles-the-program · MUST

Every module of a feature or of a composition module is the place where the root assembles it. The providers it lists are registrations the root declares through it, each binding a token to the implementation the root's module hands in, or to a use case built over it, by `useClass` or `useFactory`, and deciding nothing.

#### Why

A use case imports no installed dependency, so the injector builds it only through a factory some module registers, and a module whose registrations decide or are found apart from the root's choice hides a concrete choice outside the one place the program is assembled.

#### Examples

```ts title="Avoid"
@Module({})
export class OrdersModule {
  static register({ imports, isInMemory }: OrdersModuleOptions): DynamicModule {
    return {
      module: OrdersModule,
      imports,
      providers: [
        {
          provide: ORDER_REPOSITORY,
          useClass: isInMemory ? InMemoryOrderRepositoryAdapter : PostgresOrderRepositoryAdapter,
        },
      ],
    };
  }
}
```

```ts title="Prefer"
@Module({})
export class OrdersModule {
  static register({ imports }: OrdersModuleOptions): DynamicModule {
    return {
      module: OrdersModule,
      imports,
      controllers: [OrdersController],
      providers: [
        {
          provide: PLACE_ORDER,
          inject: [ORDER_REPOSITORY],
          useFactory: (orderRepository: OrderRepositoryPort) => createPlaceOrder({ orderRepository }),
        },
      ],
    };
  }
}
```

### providers-folder-holds-only-providers → package-laid-out-by-the-tree · MUST

Every `providers/` folder holds only the framework's providers. A custom provider, a pipe and an interceptor sit in the `providers/` folder of the presentation, or of `root/`, whose module lists them, and that folder holds only `.providers.ts`, `.pipe.ts` and `.interceptor.ts` files and its surface; a class the program writes, such as a use case, a port or an adapter, keeps the suffix and the folder of its role.

#### Why

A provider kept away from the module that lists it is looked for in vain, and a class of the program's own layers filed among the framework's providers leaves the layer whose rules govern it.

#### Examples

```text title="Avoid"
features/orders/presentation/
├── module/orders.module.ts
└── providers/
    ├── orders.providers.ts
    ├── order-id.pipe.ts
    ├── place-order.use-case.ts
    └── index.ts
```

```text title="Prefer"
features/orders/
├── application/use-cases/commands/
│   ├── place-order.use-case.ts
│   └── index.ts
└── presentation/
    ├── module/orders.module.ts
    └── providers/
        ├── orders.providers.ts
        ├── order-id.pipe.ts
        └── index.ts
```

### guard-or-filter-never-filed-as-a-provider → package-laid-out-by-the-tree · MUST

Every guard and exception filter is a unit of its presentation, never a provider in `providers/`.

#### Why

A guard or a filter filed among the providers hides a decision every operation shares from the presentation that answers for it.

#### Examples

```text title="Avoid"
src/presentation/
├── bindings/index.ts
└── providers/
    ├── session.guard.ts
    ├── errors.filter.ts
    ├── timing.interceptor.ts
    └── index.ts
```

```text title="Prefer"
src/presentation/
├── bindings/
│   ├── session.guard.ts
│   ├── errors.filter.ts
│   └── index.ts
└── providers/
    ├── timing.interceptor.ts
    └── index.ts
```

### feature-module-imports-no-other-features-module → feature-never-imports-a-feature · MUST

No feature's module imports another feature's module. It imports only modules of its own feature, of `shared/` and those an installed library ships.

#### Why

A feature's module that imports another feature's ties the two features as an import of code would.

#### Examples

```ts title="Avoid"
// src/features/orders/presentation/module/orders.module.ts
import { PaymentsModule } from '../../../payments';

@Module({
  imports: [PaymentsModule],
  controllers: [OrdersController],
})
export class OrdersModule {}
```

```ts title="Prefer"
// src/features/orders/presentation/module/orders.module.ts
@Module({})
export class OrdersModule {
  static register({ imports }: OrdersModuleOptions): DynamicModule {
    return { module: OrdersModule, imports, controllers: [OrdersController] };
  }
}
```

### global-module-never-declared → container-holds-only-registrations-the-root-declares · MUST

No module is `@Global()`. Exempt: a global module a library ships, such as a logger's, which only the root's module imports.

#### Why

A global module's providers reach every module unannounced, so a module's imports no longer show what it depends on; a library's, imported by the root alone, is a registration the root shows, as a logger is.

#### Examples

```ts title="Avoid"
@Global()
@Module({
  providers: [{ provide: CLOCK, useClass: SystemClockAdapter }],
  exports: [CLOCK],
})
export class ClockModule {}
```

```ts title="Prefer"
@Module({
  providers: [{ provide: CLOCK, useClass: SystemClockAdapter }],
  exports: [CLOCK],
})
export class ClockModule {}

// src/root/root.module.ts
@Module({ imports: [OrdersModule.register({ imports: [ClockModule, OrdersAdaptersModule] })] })
export class RootModule {}
```

### feature-module-takes-its-adapters-from-the-root → composition-root-assembles-the-program · MUST

Every feature's module takes each adapter, its own feature's included, from the root's module. It is a dynamic module whose static method takes the modules to import.

#### Why

A feature's module that imports its adapters itself fixes them for good, so the root's module no longer names every concrete adapter and a spec cannot pass a fake in their place.

#### Examples

```ts title="Avoid"
// src/features/orders/presentation/module/orders.module.ts
@Module({
  imports: [OrdersAdaptersModule],
  controllers: [OrdersController],
})
export class OrdersModule {}
```

```ts title="Prefer"
// src/features/orders/presentation/module/orders.module.ts
@Module({})
export class OrdersModule {
  static register({ imports }: OrdersModuleOptions): DynamicModule {
    return { module: OrdersModule, imports, controllers: [OrdersController] };
  }
}

// src/root/root.module.ts
@Module({ imports: [OrdersModule.register({ imports: [OrdersAdaptersModule] })] })
export class RootModule {}
```
