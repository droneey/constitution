```pseudo title="Avoid"
# coupons/application/use-cases/commands/issue-coupon
function createIssueCoupon({ couponRepository })
  return function(input, context)
    let code = randomCode()

    call couponRepository.save(issue(input.couponId, code), context)
```

```pseudo title="Prefer"
# coupons/application/use-cases/commands/issue-coupon
function createIssueCoupon({ couponRepository, codeSource })
  return function(input, context)
    let code = codeSource.next()

    call couponRepository.save(issue(input.couponId, code), context)
```
