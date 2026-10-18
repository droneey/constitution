```pseudo title="Avoid"
# newCheckout: on everywhere since May
if flags.newCheckout then
  checkOutInOneStep(cart)
else
  checkOutInThreeSteps(cart)
```

```pseudo title="Prefer"
checkOutInOneStep(cart)
```
