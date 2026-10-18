```pseudo
# orders/__tests__/order.repository.suite
function orderRepositorySuite(newRepository)
  test "should find the order it saved"
    # Arrange
    let orders = newRepository()
    orders.save(anOrder({ id: "order-7" }))
    # Act
    let found = orders.find("order-7")
    # Assert
    assert found is anOrder({ id: "order-7" })

# orders/__tests__/order.repository.fake.test
orderRepositorySuite(newOrderRepositoryFake)

# adapters/postgres/__tests__/order.repository.integration.test
orderRepositorySuite(newPostgresOrderRepository)
```
