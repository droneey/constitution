# Screens

> Governs a screen's place in the tree, its name, its screen pieces and its navigation.

## Vocabulary

A **screen piece** is a presentational component a screen's layout is composed of.

A screen's role word is **`Screen`**{#screen-role-word}: `-screen` ends its folder's name, as in `order-screen/`, and `Screen` its type's, as in `OrderScreen`. It is a default a language's block respells where a module's name takes no hyphen.

## General

### screen-loads-what-its-pieces-render → delivery-unit-stays-thin · SHOULD

Every screen loads the data its own screen pieces render, from the parsed screen address its registration hands it.

#### Why

A screen whose screen pieces load their own data fills in one screen piece at a time, with a loading state and an error for each.

#### Examples

```pseudo title="Avoid"
# presentation/screens/order-screen
component OrderScreen({ params })
  return Stack(
    OrderDetails({ orderId: params.orderId }),
    OrderLines({ orderId: params.orderId })  # each piece loads and fails alone
  )
```

```pseudo title="Prefer"
# presentation/screens/order-screen
component OrderScreen({ params })
  let order = showOrder(params.orderId)

  when order
    is Loading then return LoadingIndicator()
    is Failed then return ErrorNotice(error: order.error, onRetry: order.retry)
    is Loaded then return Stack(
      OrderDetails({ order: order.data }),
      OrderLines({ lines: order.data.lines })
    )
```

### screen-composed-only-of-widgets-or-its-own-pieces · SHOULD

Every screen's layout is composed only of widgets and of screen pieces of its own.

#### Why

Markup a screen lays out outside its screen pieces is proven only through the screen and its loading, never alone with the data it is handed.

#### Examples

```pseudo title="Avoid"
# presentation/screens/order-screen
component OrderScreen({ params })
  let order = showOrder(params.orderId)

  when order
    is Loading then return LoadingIndicator()
    is Failed then return ErrorNotice(error: order.error, onRetry: order.retry)
    is Loaded then return Stack(
      OrderDetails({ order: order.data }),
      Row(Text("Total"), Text(formatMoney(order.data.total)))  # markup outside any piece
    )
```

```pseudo title="Prefer"
# presentation/screens/order-screen
component OrderScreen({ params })
  let order = showOrder(params.orderId)

  when order
    is Loading then return LoadingIndicator()
    is Failed then return ErrorNotice(error: order.error, onRetry: order.retry)
    is Loaded then return Stack(
      OrderDetails({ order: order.data }),
      OrderTotal({ total: order.data.total }),
      OrdersRecommendationsWidget({ orderId: order.data.id })
    )
```

### screen-piece-knows-no-screen · SHOULD

Every screen piece takes data and event callbacks and knows no screen, its own included.

#### Why

A screen piece that knows its screen can be neither reused nor tested alone.

#### Examples

```pseudo title="Avoid"
component OrderLines({ lines, screen })
  return List(lines.map(line => OrderLineRow({
    line,
    isEditable: screen is CheckoutScreen
  })))
```

```pseudo title="Prefer"
component OrderLines({ lines, isEditable, onRemoveLine })
  return List(lines.map(line => OrderLineRow({
    line,
    isEditable,
    onRemove: onRemoveLine
  })))
```

### slow-piece-becomes-a-widget · SHOULD

Every screen piece whose loading would hold back its screen becomes a widget that loads its own data through a binding unit.

#### Why

A slow screen piece loaded by its screen holds the whole screen behind its wait, though the rest has its data.

#### Examples

```pseudo title="Avoid"
component ProductScreen({ params })
  let both = combineStates(
    showProduct(params.productId),
    showRecommendations(params.productId)  # slow, holds back the whole screen
  )

  when both
    is Loading then return LoadingIndicator()
    is Failed then return ErrorNotice(error: both.error, onRetry: both.retry)
    is Loaded then return Stack(
      ProductDetails({ product: both.data[0] }),
      Recommendations({ products: both.data[1] })
    )
```

```pseudo title="Prefer"
component ProductScreen({ params })
  let product = showProduct(params.productId)

  when product
    is Loading then return LoadingIndicator()
    is Failed then return ErrorNotice(error: product.error, onRetry: product.retry)
    is Loaded then return Stack(
      ProductDetails({ product: product.data }),
      CatalogRecommendationsWidget({ productId: params.productId })
    )
```

### screen-lives-in-the-programs-presentation → delivery-unit-beside-what-it-serves · SHOULD

Every screen is a page of the program, in the program's presentation, whatever features it shows. A feature and a composition module offer their widgets, components and binding units, never a screen.

#### Why

A screen is a place in the product, not an operation of a feature nor a rule of the business, so one kept in a feature must move the day it shows a second.

#### Examples

```text title="Avoid"
src/features/orders/presentation/
├── bindings/
├── components/
├── screens/
│   └── order-screen/
└── widgets/
```

```text title="Prefer"
src/
├── presentation/screens/
│   └── order-screen/
└── features/orders/presentation/
    ├── bindings/
    ├── components/
    └── widgets/
```

### screen-named-with-its-role-word → role-word-ends-the-name · MUST

Every screen's name ends in its role word, its folder's in `-screen` and its type's in `Screen`.

#### Why

A screen named like a component must be opened to learn that it is a place of the program, and its type takes the name of the domain type it shows, as a screen `Order` takes the aggregate's, so the file that renders one imports two things of one name.

#### Examples

```text title="Avoid"
presentation/screens/
└── order/
    ├── order          Order
    └── <surface>
```

```text title="Prefer"
presentation/screens/
└── order-screen/
    ├── order-screen   OrderScreen
    └── <surface>
```

## Navigation

### ui-never-touches-navigation → layer-imports-dependencies-by-its-role · MUST

Only the root imports the navigation library: no screen, widget or component imports a navigation or route-parameter primitive.

#### Why

A screen, widget or component that imports the navigation library is tied to it and cannot render without the router, and one that navigates by itself hides its behaviour from what composes it.

#### Examples

```pseudo title="Avoid"
# presentation/screens/order-screen
import { currentParams, navigator } from "router"

component OrderScreen()
  let params = currentParams()
  let navigation = navigator()

  return OrderView({ orderId: params.orderId, onCancelled: function() navigation.open("/orders") })
```

```pseudo title="Prefer"
# presentation/screens/order-screen
component OrderScreen({ params, onCancelled })
  return OrderView({ orderId: params.orderId, onCancelled })

# root/routes
import { route } from "router"

route("/orders/:orderId", OrderAddress, function(params, navigation)
  return OrderScreen({ params, onCancelled: function() navigation.open("/orders") }))
```

### ui-knows-no-address · SHOULD

No screen, widget or component knows a screen address of the program.

#### Why

A screen address known outside the root ties a screen, widget or component to the navigation's paths, so a change of a path reaches it.

#### Examples

```pseudo title="Avoid"
component OrderRow({ order })
  return Row(
    Link(to: "/orders/" + order.id, label: order.number),
    Text(formatMoney(order.total))
  )
```

```pseudo title="Prefer"
component OrderRow({ order, renderOrderLink })
  return Row(
    renderOrderLink(order),
    Text(formatMoney(order.total))
  )
```

### navigation-passed-by-slot · MUST

All navigation reaches the interface as props. A screen, a widget or a component takes its parameters as values, its links as slot props that render them, and its transitions and every other action as event callbacks; the screen's registration hands them to the screen, which passes them on.

#### Why

Navigation reached any other way ties the screen, widget or component to the router, and a link turned into a press handler can no longer be opened, shared or announced as a link.

#### Examples

```pseudo title="Avoid"
component OrderRow({ order, onOpen })
  return Row(
    Button(label: order.number, onPress: function() onOpen(order.id)),  # a link that cannot be opened in a new tab
    Text(formatMoney(order.total))
  )
```

```pseudo title="Prefer"
component OrderRow({ order, renderOrderLink })
  return Row(
    renderOrderLink(order),
    Text(formatMoney(order.total))
  )

# root/routes
OrdersScreen({
  renderOrderLink: function(order) Link(to: "/orders/" + order.id, label: order.number)
})
```
