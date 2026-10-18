```pseudo
property "should return an Order or an InvalidRow for any row"
  # Arrange
  given row from anyString()
  # Act
  let result = parseOrderRow(row)
  # Assert
  assert result is Order or result is InvalidRow

# a counterexample the property found, kept as a fixed case
test "should return InvalidRow when the row ends inside a quote"
  # Arrange
  let row = 'order-7,"Crème'
  # Act
  let result = parseOrderRow(row)
  # Assert
  assert result is InvalidRow({ line: 1, reason: "unclosed quote" })
```
