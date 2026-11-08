# Ports

> Governs a server's adapters at its boundaries: the check of its connection an adapter offers.

## General

### readiness-check-offered-by-the-adapter · SHOULD

Every adapter of a required system offers a check of its connection, which the readiness check runs. No port, use case or feature carries such a check.

#### Why

How a system is reached is known only to its adapter, and a check put on a port asks every implementation, fakes included, for something no caller of the port needs — the interface segregation principle.

#### Examples

```ts title="Avoid"
// src/features/orders/application/contracts/order-repository.port.ts
export interface OrderRepositoryPort {
  find(orderId: OrderId, context: CallContext): Promise<Order | undefined>;
  save(order: Order, context: CallContext): Promise<void>;
  isReachable(): Promise<boolean>;   // every fake must answer a check no use case asks
}
```

```ts title="Prefer"
// src/features/orders/application/contracts/order-repository.port.ts
export interface OrderRepositoryPort {
  find(orderId: OrderId, context: CallContext): Promise<Order | undefined>;
  save(order: Order, context: CallContext): Promise<void>;
}

// src/features/orders/infrastructure/postgres/order-repository.adapter.ts
export const checkOrdersDatabase = (pool: Pool): RequiredSystemCheck => ({
  name: "orders-database",
  check: async () => {
    await pool.query("select 1");
  },
});
```
