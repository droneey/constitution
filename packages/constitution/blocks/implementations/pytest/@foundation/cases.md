# Cases

> Governs how a pytest case is written: the variants of one behaviour.

## Variants

### variants-are-parametrize-rows-with-ids → variants-are-one-table · SHOULD

The variants of one behaviour are the rows of one `@pytest.mark.parametrize`. It decorates one `test_` function, and each row is a `pytest.param(…, id='when <condition>')` holding its input and its expected value.

#### Why

Variants looped inside one case stop at the first that fails and hide the rest, and a row without an id is reported by its index, so a failure does not say which condition broke.

#### Examples

```py title="Avoid"
def test_should_refuse_the_coupon_when_it_has_expired() -> None:
    # Act
    with pytest.raises(CouponExpiredError) as raised:
        apply_coupon(a_cart(), an_expired_coupon())

    # Assert
    assert raised.value.code == CouponExpiredError.code


def test_should_refuse_the_coupon_when_it_is_used_up() -> None:
    # Act
    with pytest.raises(CouponUsedUpError) as raised:
        apply_coupon(a_cart(), a_used_up_coupon())

    # Assert
    assert raised.value.code == CouponUsedUpError.code
```

```py title="Prefer"
@pytest.mark.parametrize(
    ("coupon", "error"),
    [
        pytest.param(an_expired_coupon(), CouponExpiredError, id="when it has expired"),
        pytest.param(a_used_up_coupon(), CouponUsedUpError, id="when it is used up"),
    ],
)
def test_should_refuse_the_coupon(coupon: Coupon, error: type[CouponError]) -> None:
    # Act
    with pytest.raises(error) as raised:
        apply_coupon(a_cart(), coupon)

    # Assert
    assert raised.value.code == error.code
```
