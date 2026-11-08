```pseudo
# orders/presentation/bindings/commands/place-order: the schema of its request
# Why: the program owns this request, so an unknown key or an unknown method fails
let placeOrderRequest = strictObject({
  cartId: String,
  deliveryMethod: enumeration(deliveryMethods)
})
```
