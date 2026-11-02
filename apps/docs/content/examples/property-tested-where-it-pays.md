```pseudo
property "should return an Order or an InvalidRowError for any row"
  # Arrange
  given row from anyString()
  # Act
  let parsed = parseOrderRow(row)

  # Assert
  assert parsed is Order or parsed is InvalidRowError

# a counterexample the property found, kept as a fixed case
test "should return InvalidRowError when the row ends inside a quote"
  # Arrange
  let row = 'order-7,"Crème'
  # Act
  let parsed = parseOrderRow(row)

  # Assert
  assert parsed is InvalidRowError({ line: 1, reason: "unclosed quote" })
```
