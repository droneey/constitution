```pseudo title="Avoid"
test "should charge 5 when it is light"
  # Arrange
  let parcel = createParcel({ kg: 1 })
  # Act
  let fee = shippingFee(parcel)

  # Assert
  assert fee is 5

test "should charge 15 when it is heavy"
  # Arrange
  let parcel = createParcel({ kg: 20 })
  # ...the same, with 15
```

```pseudo title="Prefer"
for each { when, kg, fee } in
  | it is light   | 1  | 5  |
  | it is medium  | 5  | 9  |
  | it is heavy   | 20 | 15 |

  test "should charge {fee} when {when}"
    # Arrange
    let parcel = createParcel({ kg })
    # Act
    let actual = shippingFee(parcel)

    # Assert
    assert actual is fee
```
