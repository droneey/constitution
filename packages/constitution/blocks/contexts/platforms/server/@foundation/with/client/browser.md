# Browser

> Governs a server that renders a browser program: what it may hold and do, where it keeps the tokens of its user's session, and which of its modules the tab's bundle may reach.

## Vocabulary

A **rendering server** is a server that renders a browser program whose API is another program, and serves it.

## General

### rendering-server-only-delivers · SHOULD

Every rendering server only delivers the program it renders. It serves documents, files and the tab's configuration, and proxies its user's session to the API where the API needs it; it reaches no store but the one its sessions live in, and runs no business rule.

#### Why

A web tier with logic of its own is a second backend nobody designed, with its own secrets, failures and copies of the rules.

#### Examples

```ts title="Avoid"
// web/src/presentation/bindings/queries/show-orders.ts
export const showOrders = (database: Pool): Handler => async (c) => {
  const orders = await database.query(   // a second backend, with its own queries
    "select id, total, status from orders where customer_id = $1",
    [c.get("session").customerId],
  );

  return c.html(renderOrdersPage(orders.rows));
};
```

```ts title="Prefer"
// web/src/presentation/bindings/queries/show-orders.ts
export const showOrders = (ordersApi: OrdersApi): Handler => async (c) => {
  const orders = await ordersApi.list({ session: c.get("session") });

  return c.html(renderOrdersPage(orders));
};
```

## Secrets

### rendering-server-holds-bearer-tokens-behind-the-session → credential-never-readable-by-script · MUST

Where its API takes bearer tokens, every rendering server keeps those tokens on the server, behind its user's session. It exchanges its user's sign-in for the tokens and forwards each call of the tab to the API with the token in place of the session's own credential.

#### Why

A token that reaches the tab is read by any script injected into the page, and opens the API to whoever runs that script — the backend-for-frontend pattern.

#### Examples

```ts title="Avoid"
// web/src/presentation/bindings/commands/sign-in-callback.ts
export const completeSignIn = (identity: IdentityProvider): Handler => async (c) => {
  const tokens = await identity.exchangeCode(c.req.query("code"));

  return c.json({ accessToken: tokens.accessToken });   // any script in the page reads it
};
```

```ts title="Prefer"
// web/src/presentation/bindings/commands/sign-in-callback.ts
export const completeSignIn = (identity: IdentityProvider, sessions: Sessions): Handler => async (c) => {
  const tokens = await identity.exchangeCode(c.req.query("code"));
  const session = await sessions.create({ tokens });

  setCookie(c, "__Host-session", session.id, { httpOnly: true, secure: true, sameSite: "Lax", path: "/" });
  return c.redirect("/orders");
};

// web/src/presentation/bindings/api-proxy.ts
export const forwardToApi = (sessions: Sessions, api: ApiForwarder): Handler => async (c) => {
  const session = await sessions.find(getCookie(c, "__Host-session"));

  if (session === undefined) return c.body(null, 401);
  return api.forward(c.req.raw, { bearer: session.tokens.accessToken });
};
```

## What reaches the tab

### server-only-module-kept-out-of-the-tabs-bundle → device-program-holds-nothing-hidden · MUST

No server-only module is reached by the tab's bundle. A module is server-only when it holds a secret, reads the server's environment variables or reaches its stores.

#### Why

Shared code runs on both sides by default, and a server module the tab's graph reaches ships its secrets and its queries to every visitor.

#### Examples

```ts title="Avoid"
// src/features/orders/infrastructure/postgres/order-repository.adapter.ts
import type { Sql } from "postgres";   // nothing stops the tab's bundle from reaching this module

export const createOrderRepository = (sql: Sql): OrderRepositoryPort => ({
  find: async (orderId) => restoreOrder(await sql`select * from orders where id = ${orderId}`),
});
```

```ts title="Prefer"
// src/features/orders/infrastructure/postgres/order-repository.adapter.ts
import "server-only";
import type { Sql } from "postgres";

export const createOrderRepository = (sql: Sql): OrderRepositoryPort => ({
  find: async (orderId) => restoreOrder(await sql`select * from orders where id = ${orderId}`),
});
```
