```pseudo
# infrastructure/postgres/__tests__/order-repository.adapter.integration.test
let postgres = startPostgres()  # a disposable container on the loopback

function createRepository()
  return createOrderRepository(new PgClient(postgres.url))

orderRepositorySuite(createRepository)  # the contract suite, real engine

# a case for each failure the adapter maps
test "should fail with OrderAlreadyExistsError when the id is taken"
  # Arrange
  let orders = createRepository()
  orders.save(createOrder({ id: "order-7" }))

  # Act
  let failure = thrownBy(function() orders.save(createOrder({ id: "order-7" })))

  # Assert
  assert failure is OrderAlreadyExistsError({ orderId: "order-7" })
```
