# Server specs

> Governs how a spec drives a server.

## General

### server-spec-runs-in-process → test-runs-in-a-sandbox · MUST

Every unit or integration spec that drives a server drives it in the spec's own process. Exempt: an end-to-end spec, and a spec that proves the server's own start or stop, which reach it as its callers or its host do.

#### Why

A unit or an integration spec that starts the server apart reaches past what its case controls, and leaves a process behind when it fails.

#### Examples

```pseudo title="Avoid"
test "should list the customer's orders"
  # Arrange
  let server = spawnProcess("serve-orders-api")
  # Act
  let answer = call(server.address, "listOrders", { customerId: "cus-1" })

  # Assert
  assert answer.items.length is 2
```

```pseudo title="Prefer"
test "should list the customer's orders"
  # Arrange
  let server = startServer(createOrdersApi(fakeAdapters), { host: loopback, port: 0 })
  # Act
  let answer = call(server.address, "listOrders", { customerId: "cus-1" })

  # Assert
  assert answer.items.length is 2
```

### server-spec-port-chosen-by-the-system → test-runs-in-a-sandbox · MUST

Every spec that starts a server has it listen on a loopback endpoint the system chooses. The spec never picks that endpoint itself.

#### Why

A spec that listens on an endpoint of its own choosing collides with another run's, and fails at random when specs run side by side.

#### Examples

```pseudo title="Avoid"
let server = startServer(createOrdersApi(fakeAdapters), {
  host: loopback,
  port: 8080,
})
let ordersUrl = "http://127.0.0.1:8080"
```

```pseudo title="Prefer"
let server = startServer(createOrdersApi(fakeAdapters), {
  host: loopback,
  port: 0,
})
let ordersUrl = server.address
```

### server-spec-passes-through-the-real-middleware → spec-proves-one-boundary · SHOULD

Every unit or integration spec that drives a server reaches its handlers through the server's real middleware and parsing, never directly. What lies behind the handler is faked or real as the spec's kind asks.

#### Why

A spec that calls the handler directly skips the middleware and the parsing a caller's request goes through, so a fault there passes every spec.

#### Examples

```pseudo title="Avoid"
test "should refuse an order with no lines"
  # Arrange
  let input = { lines: [] }
  # Act
  let answer = placeOrderHandler(input, fakeAdapters)

  # Assert
  assert answer.code is "order.no-lines"
```

```pseudo title="Prefer"
test "should refuse an order with no lines"
  # Arrange
  let server = startServer(createOrdersApi(fakeAdapters), { host: loopback, port: 0 })
  # Act
  let answer = call(server.address, "placeOrder", { lines: [] })

  # Assert
  assert answer.code is "order.no-lines"
```
