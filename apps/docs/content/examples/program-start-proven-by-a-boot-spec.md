```pseudo title="Avoid"
test "should answer when started"
  # Arrange
  let server = createServer({
    placeOrder: createPlaceOrder(fakes),
  })
  # Act
  let answer = server.get("/health")

  # Assert
  assert answer.status is 200
```

```pseudo title="Prefer"
test "should answer when started"
  # Arrange
  let program = run({
    env: testEnvironment,
    outside: createOutsideFakes(),
  })
  # Act
  let answer = program.get("/health")

  # Assert
  assert answer.status is 200
```
