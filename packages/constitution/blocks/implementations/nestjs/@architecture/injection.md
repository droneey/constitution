# Injection

> Governs how the injector hands a provider its dependencies, the form an adapter takes for it, and how a spec replaces one.

## General

### providers-injected-through-the-constructor → unit-handed-its-dependencies · MUST

Every provider, controller and guard takes its dependencies through its constructor. None builds a dependency, reaches a global or asks the injector for one, by `ModuleRef`'s `get` or `resolve` or by `DiscoveryService`'s scan of the providers.

#### Why

A dependency the constructor names is one the injector replaces in a spec, while one built, taken from a global or asked for at run time appears in no constructor and no module, so it is fixed for good and neither a reader nor a spec sees it until it fails.

#### Examples

```ts title="Avoid"
@Controller('orders')
export class OrdersController {
  constructor(private readonly moduleRef: ModuleRef) {}

  @Post()
  async place(@Body() body: PlaceOrderBody): Promise<void> {
    const placeOrder = this.moduleRef.get<PlaceOrder>(PLACE_ORDER);

    await placeOrder(parsePlaceOrderInput(body));
  }
}
```

```ts title="Prefer"
@Controller('orders')
export class OrdersController {
  constructor(@Inject(PLACE_ORDER) private readonly placeOrder: PlaceOrder) {}

  @Post()
  async place(@Body() body: PlaceOrderBody): Promise<void> {
    await this.placeOrder(parsePlaceOrderInput(body));
  }
}
```

### ports-injected-by-token → unit-receives-its-dependencies-by-contract · SHOULD

Every dependency that stands for a port is injected by a token. The token is a `Symbol`, or a class with no member that serves only as the token, named by `@Inject` and bound to its implementation with `useClass` or `useFactory` in a module's `providers: [...]`, and it is never the parameter's type.

#### Why

Nest injects a parameter without `@Inject` by its declared class, so a port, an interface gone at run time, reaches a constructor only through a token, and a constructor that names the adapter class instead fixes it for every caller — the dependency inversion principle.

#### Examples

```ts title="Avoid"
@Module({
  providers: [
    OrderRepositoryAdapter,
    {
      provide: PLACE_ORDER,
      inject: [OrderRepositoryAdapter],
      useFactory: (orderRepository: OrderRepositoryAdapter) =>
        createPlaceOrder({ orderRepository }),
    },
  ],
})
export class OrdersAdaptersModule {}
```

```ts title="Prefer"
@Module({
  providers: [
    { provide: ORDER_REPOSITORY, useClass: OrderRepositoryAdapter },
    {
      provide: PLACE_ORDER,
      inject: [ORDER_REPOSITORY],
      useFactory: (orderRepository: OrderRepositoryPort) => createPlaceOrder({ orderRepository }),
    },
  ],
})
export class OrdersAdaptersModule {}
```

### adapter-is-an-injectable-class → program-uses-only-its-frameworks-container · MUST

Every adapter is an `@Injectable()` class.

#### Why

An adapter in another form is assembled apart from every other part the injector builds, by hand beside the container, and replaced in a spec in a way of its own.

#### Examples

```ts title="Avoid"
// src/features/orders/infrastructure/postgres/order-repository.adapter.ts
export const createOrderRepository = (pool: Pool): OrderRepositoryPort => ({
  find: async (orderId) => restoreOrder(await selectOrder(pool, orderId)),
});
```

```ts title="Prefer"
// src/features/orders/infrastructure/postgres/order-repository.adapter.ts
@Injectable()
export class OrderRepositoryAdapter implements OrderRepositoryPort {
  constructor(private readonly database: DatabasePool) {}

  async find(orderId: OrderId): Promise<Order | undefined> {
    return restoreOrder(await selectOrder(this.database.pool, orderId));
  }
}
```

### adapter-faked-through-override-provider → effect-faked-never-mocked · SHOULD

Every spec replaces an adapter by binding its token to a fake with `overrideProvider`.

#### Why

An adapter replaced by patching its module or the import of it proves a program the injector never builds, and breaks when the module moves.

#### Examples

```ts title="Avoid"
vi.mock('../../infrastructure/postgres/order-repository.adapter', () => ({
  OrderRepositoryAdapter: OrderRepositoryFake,
}));

const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();
```

```ts title="Prefer"
const moduleRef = await Test.createTestingModule({ imports: [RootModule] })
  .overrideProvider(ORDER_REPOSITORY)
  .useValue(new OrderRepositoryFake([createOrder()]))
  .compile();
```
