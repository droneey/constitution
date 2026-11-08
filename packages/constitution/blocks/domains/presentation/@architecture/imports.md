# Imports

> Governs what each part of the interface imports, and the libraries whose home is in it.

## Binding units

### binding-unit-imports-nothing-of-the-ui · MUST

No binding unit imports anything of the interface: no screen, widget or component, which import it.

#### Why

A binding unit that imports the interface forms a cycle with it — the acyclic dependencies principle.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
import { showToast } from "shared/ui/toast"

function onCancelOrder(input, cancelOrder, context)
  cancelOrder(parseCancelOrderInput(input), context)
  showToast("Order cancelled")
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(input, cancelOrder, context)
  return cancelOrder(parseCancelOrderInput(input), context)

# orders/presentation/widgets/orders-cancel-widget
import { showToast } from "shared/ui/toast"
import { onCancelOrder } from "../../bindings/commands/cancel-order"

component OrdersCancelWidget({ orderId })
  return Button(label: "Cancel order", onPress: function()
    onCancelOrder({ orderId })
    showToast("Order cancelled"))
```

### binding-unit-consumed-only-by-screens-or-widgets · MUST

Within the interface, only screens and widgets consume binding units, and no presentational component does.

#### Why

A component that reaches a binding unit renders only the data that unit gives, never what its caller hands it.

#### Examples

```pseudo title="Avoid"
# orders/presentation/components/orders-table
component OrdersTable()
  let orders = showOrders()

  return Table(rows: orders.data, renderRow: OrdersTableRow)
```

```pseudo title="Prefer"
# orders/presentation/components/orders-table
component OrdersTable({ orders })
  return Table(rows: orders, renderRow: OrdersTableRow)

# orders/presentation/widgets/orders-list-widget
component OrdersListWidget()
  let orders = showOrders()

  when orders
    is Loading then return LoadingIndicator()
    is Failed then return ErrorNotice(error: orders.error, onRetry: orders.retry)
    is Loaded then return OrdersTable({ orders: orders.data })
```

### widget-works-wherever-it-is-placed · MUST

Every widget works wherever it is placed, needing nothing of the screen that holds it.

#### Why

A widget that needs a screen's data breaks wherever else it is placed.

#### Examples

```pseudo title="Avoid"
component OrdersRecentWidget()
  let customer = screenData(CustomerScreen).customer  # breaks on any other screen
  let orders = showRecentOrders(customer.id)

  return OrdersList({ orders })
```

```pseudo title="Prefer"
component OrdersRecentWidget({ customerId })
  let orders = showRecentOrders(customerId)

  return OrdersList({ orders })
```

## Widgets and components

### feature-ui-imports-nothing-of-its-workings → presentation-reaches-only-what-it-serves · MUST

Every widget and component of a feature imports of its feature only the members its surface offers. It imports no port and no use case of it. Exempt: a use case's read models, which they import as types alone.

#### Why

An interface that imports how a feature works changes whenever that does, and a change of adapter reaches a screen — the dependency rule.

#### Examples

```pseudo title="Avoid"
# orders/presentation/widgets/orders-recent-widget
import { createGetRecentOrders } from "../../application/use-cases/queries/get-recent-orders.use-case"
import { OrderQueriesPort } from "../../application/contracts/order-queries.port"
```

```pseudo title="Prefer"
# orders/presentation/widgets/orders-recent-widget
import { showRecentOrders } from "../bindings/queries/show-recent-orders"
import type { RecentOrder } from "../../application/use-cases/queries/get-recent-orders.use-case"
```

### feature-ui-imports-only-ui-shared-layers · MUST

Of the program's code beyond its feature, every widget and component of a feature imports only `libs/ui`, `shared/ui` and the kernel. Of the kernel, it imports no port.

#### Why

A widget or a component that imports another shared layer or a port reaches what renders nothing, and a change below the interface reaches the screen.

#### Examples

```pseudo title="Avoid"
# orders/presentation/components/orders-table
import { Table } from "libs/ui/table"
import { httpClient } from "libs/http-client"
import { ClockPort } from "kernel/contracts/clock.port"
```

```pseudo title="Prefer"
# orders/presentation/components/orders-table
import { Table } from "libs/ui/table"
import { MoneyText } from "shared/ui/money-text"
import type { Money } from "kernel/types/money"
```

### component-never-imports-a-widget · MUST

No presentational component imports a widget.

#### Why

A component that holds a widget holds its logic too, and stops being presentational.

#### Examples

```pseudo title="Avoid"
# orders/presentation/components/orders-sidebar
import { OrdersRecentWidget } from "../../widgets/orders-recent-widget"

component OrdersSidebar({ title, customerId })
  return Stack(Heading(title), OrdersRecentWidget({ customerId }))
```

```pseudo title="Prefer"
# orders/presentation/components/orders-sidebar
component OrdersSidebar({ title, recentOrders })
  return Stack(Heading(title), recentOrders)

# presentation/screens/customer
OrdersSidebar({
  title: customer.name,
  recentOrders: OrdersRecentWidget({ customerId: customer.id })
})
```

## Libraries

### rendering-library-imported-by-the-presentation → layer-imports-dependencies-by-its-role · MUST

The library that renders the interface has its home in the presentation and the interface's shared components. Outside the edge, that is the presentation of features, of composition modules and of the program, its screens, widgets and components, and the binding units built on the library's state API, and the shared components of `shared/ui`; at the edge, the generic components and component primitives of `libs/ui`.

#### Why

The view library is what a component is written in and what a binding unit is built on, and one imported anywhere else outside the edge ties a layer that renders nothing to it.

#### Examples

```pseudo title="Avoid"
# orders/domain/order/value-objects/order-status.value-object
import { Element } from "view-library"

type OrderStatus = Pending | Paid | Shipped

let ORDER_STATUS_ICONS: Map<OrderStatus, Element> = { Pending: ClockIcon(), Paid: CheckIcon(), Shipped: TruckIcon() }
```

```pseudo title="Prefer"
# orders/domain/order/value-objects/order-status.value-object
type OrderStatus = Pending | Paid | Shipped

# orders/presentation/components/orders-status-badge/orders-status-badge
import { Element } from "view-library"

let ORDER_STATUS_ICONS: Map<OrderStatus, Element> = { Pending: ClockIcon(), Paid: CheckIcon(), Shipped: TruckIcon() }
```

### form-library-imported-by-the-ui → layer-imports-dependencies-by-its-role · MUST

The form library has its home in the interface's presentation. Outside the edge, that is the components and widgets of a presentation, where a form is built.

#### Why

A form is presentation that holds its own state, and a form library imported anywhere else ties to it a binding unit or a layer below that needs nothing of it.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
import { createForm } from "form-library"

function onPlaceOrder(placeOrder, context)
  let form = createForm({ schema: PlaceOrderForm })

  return { form, submit: function() placeOrder(parsePlaceOrderInput(form.values), context) }
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
function onPlaceOrder(input, placeOrder, context)
  return placeOrder(parsePlaceOrderInput(input), context)

# orders/presentation/widgets/orders-checkout-widget
import { createForm } from "form-library"
import { onPlaceOrder } from "../../bindings/commands/place-order"

component OrdersCheckoutWidget()
  let form = createForm({ schema: PlaceOrderForm, onSubmit: onPlaceOrder })

  return CheckoutForm({ form })
```
