```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
function showOrder(request, { getOrder, getInvoice }, context)
  let order = getOrder(parseGetOrderInput(request.params), context)
  let invoice = getInvoice(parseGetInvoiceInput({ orderId: order.id }), context)

  return ok({ order, invoice })
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order
function showOrder(request, { getOrder }, context)
  return ok(getOrder(parseGetOrderInput(request.params), context))

# presentation/screens/order-page
function showOrderPage(request, { getOrder, getInvoice }, context)
  let order = getOrder(parseGetOrderInput(request.params), context)
  let invoice = getInvoice(parseGetInvoiceInput({ orderId: order.id }), context)

  return page({ order, invoice })
```
