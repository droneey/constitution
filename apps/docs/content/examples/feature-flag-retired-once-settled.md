```pseudo title="Avoid"
# oneStepCheckout: on everywhere since May
if flags.oneStepCheckout then
  checkOutInOneStep(cart)
else
  checkOutInThreeSteps(cart)
```

```pseudo title="Prefer"
checkOutInOneStep(cart)
```
