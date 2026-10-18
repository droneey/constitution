```pseudo
# orders/domain/value-objects/discount.value-object
function discountFor(total)
  if total >= 100 then return 10
  return 0

# the mutant `>=` → `>` survives: no case has a total of exactly 100,
# so the change adds the case that kills it
test "should give a discount of 10 when the total is 100"
  # Arrange
  let total = 100
  # Act
  let discount = discountFor(total)
  # Assert
  assert discount is 10
```
