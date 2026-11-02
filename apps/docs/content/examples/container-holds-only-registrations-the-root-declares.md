```pseudo title="Avoid"
# root/container
let container = new Container()

container.scan("features/**/infrastructure")
container.scan("features/**/application/use-cases")

let cancelOrder = container.resolve("cancelOrder")
```

```pseudo title="Prefer"
# root/orders
let orderRepository = createOrderRepository(client)
let cancelOrder = createCancelOrder({ orderRepository })
```
