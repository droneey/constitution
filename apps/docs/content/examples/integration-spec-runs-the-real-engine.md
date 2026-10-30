```pseudo
# infrastructure/postgres/__tests__/order.repository.integration.test
let postgres = startPostgres()  # a disposable container on the loopback
function newRepository()
  return new PostgresOrderRepository(postgres.url)

orderRepositorySuite(newRepository)  # the contract suite, real engine

# a case for each failure the adapter maps
test "should fail with OrderAlreadyExists when the id is taken"
  # Arrange
  let orders = newRepository()
  orders.save(anOrder({ id: "order-7" }))
  # Act
  let result = orders.save(anOrder({ id: "order-7" }))
  # Assert
  assert result is OrderAlreadyExists({ orderId: "order-7" })
```
