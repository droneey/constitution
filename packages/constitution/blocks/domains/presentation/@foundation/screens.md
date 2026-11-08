# Screens

> Governs a screen: its states, its address and view state, the direction of its layout, and the permissions it asks for.

## Vocabulary

A **screen address** is a URL or a deep link of the program, with its path and its parameters; a screen's address is the one that opens it.

## States

### data-view-shows-every-state · MUST

Every data view shows each state its data can have: loading, failure, content, and the empty or not-found state where its data can be empty or missing. A data view is a view that shows data it loads. No default stands in for its data not yet loaded. Exempt: a load that ends before the delay `loading-indicator-delayed` sets, whose loading state shows no indicator.

#### Why

An empty view cannot otherwise be told from a slow or a broken one, and an invented default hides loading and failure behind something that looks like data, so the user does not know what to do.

#### Examples

```pseudo title="Avoid"
component OrderList()
  let orders = showOrders()

  return List(items: orders.data ?? [], renderItem: OrderRow)  # loading and failure read as no orders
```

```pseudo title="Prefer"
component OrderList()
  let orders = showOrders()

  when orders
    is Loading then return LoadingIndicator()
    is Failed then return ErrorNotice(error: orders.error, onRetry: orders.retry)
    is Loaded then
      if orders.data is empty then
        return NoOrdersYet()

      return List(items: orders.data, renderItem: OrderRow)
```

### data-call-returns-a-union-of-its-states → illegal-state-unrepresentable · MUST

Every call the interface makes to read or write data returns a union of the states its operation has. The union holds no other state, and its data is present only in the states that hold it. Exempt: a call that suspends to a boundary above it, which shows the waiting and the failed states.

#### Why

A bag of flags allows combinations no state has, which a screen then renders — make illegal states unrepresentable.

#### Examples

```pseudo title="Avoid"
type OrdersResult = {
  isLoading: Boolean,
  error: OrdersError | <absent>,
  data: Order[] | <absent>
}
```

```pseudo title="Prefer"
type OrdersResult =
  | { status: Loading }
  | { status: Failed, error: OrdersError }
  | { status: Loaded, data: Order[] }
```

### failed-reload-keeps-the-shown-data · SHOULD

Every failed reload of data a screen already shows keeps that data shown, beside the error.

#### Why

Data dropped on a failed reload blanks a screen that had something to show, and the person loses what they were reading to a passing fault.

#### Examples

```pseudo title="Avoid"
function onReloadFailed(orders, error)
  return { status: Failed, error }  # drops the orders on screen
```

```pseudo title="Prefer"
function onReloadFailed(orders, error)
  if orders.status is Loaded then
    return { status: ReloadFailed, data: orders.data, error }

  return { status: Failed, error }
```

### failure-contained-to-its-screen → last-resort-handler-one-per-interface · MUST

Every failure a screen's code leaves unhandled while it loads or renders shows in the place the screen renders in. The rest of the program stays usable.

#### Why

A failure that blanks the whole program puts the parts that still work out of the user's reach, though only one screen failed.

#### Examples

```pseudo title="Avoid"
component AppShell()
  return Shell(
    navigation: MainNavigation(),
    content: CurrentScreen()  # a throw here blanks the whole program
  )
```

```pseudo title="Prefer"
component AppShell()
  return Shell(
    navigation: MainNavigation(),
    content: FailureBoundary(
      fallback: ScreenFailed(onRetry: reloadScreen),
      child: CurrentScreen()
    )
  )
```

### empty-state-offers-an-action · SHOULD

Every empty state names its situation and offers the action that changes it.

#### Why

An empty state is a moment the person decides what to do next, and a blank area leaves them stuck.

#### Examples

```pseudo title="Avoid"
EmptyState(title: "No data")
```

```pseudo title="Prefer"
EmptyState(
  title: "No invoices yet",
  description: "Invoices you send appear here.",
  action: Button(label: "Create invoice", onPress: openNewInvoice)
)
```

### no-results-state-repeats-the-query · SHOULD

Every state with no results repeats the query that found none.

#### Why

A person who cannot see what they searched for cannot tell a typo from an empty result.

#### Examples

```pseudo title="Avoid"
EmptyState(
  title: "No results",
  action: Button(label: "Clear search", onPress: clearSearch)
)
```

```pseudo title="Prefer"
EmptyState(
  title: "No orders match \"" + query + "\"",
  action: Button(label: "Clear search", onPress: clearSearch)
)
```

## Address and view state

### address-parsed-as-untrusted-input → outside-value-untyped-until-parsed · MUST

Every screen's address is parsed as untrusted input: its path and its parameters, in a URL or a deep link, reach the screen only after a schema parses them.

#### Why

Anyone can write a link and send it to the user, so a malformed address read unparsed crashes the screen or fills it with nonsense — parse, don't validate.

#### Examples

```pseudo title="Avoid"
component OrdersScreen({ address })
  let page = toNumber(address.query.page)
  let status = address.query.status

  return OrderList(page: page, status: status)
```

```pseudo title="Prefer"
let OrdersAddress = schema({
  page: positiveInteger.withDefault(1),
  status: oneOf(Open, Shipped, Cancelled).optional()
})

component OrdersScreen({ address })
  let parsed = OrdersAddress.parse(address.query)
  let query = parsed.isValid ? parsed.value : OrdersAddress.defaults

  return OrderList(page: query.page, status: query.status)
```

### unparsable-address-opens-a-fallback · MUST

Every screen address that fails its parse opens its screen with the screen's defaults, or a fallback screen. It never crashes the screen, and never fills it from the parts of the address that did parse.

#### Why

Anyone can write a link and send it to the user, so an address whose failed parse crashes the screen is a way to break it that anyone can send.

#### Examples

```pseudo title="Avoid"
component OrdersScreen({ address })
  let query = {
    page: parsePage(address.query.page) ?? 1,
    status: parseStatus(address.query.status)  # keeps what parsed of a broken address
  }

  return OrderList(page: query.page, status: query.status)
```

```pseudo title="Prefer"
component OrdersScreen({ address })
  let parsed = OrdersAddress.parse(address.query)
  let query = parsed.isValid ? parsed.value : OrdersAddress.defaults

  return OrderList(page: query.page, status: query.status)
```

### address-only-opens-a-screen · MUST

Every screen address only opens its screen with its parameters, in a URL and in a deep link alike. It performs no action, such as a payment, a send or a change of settings, until the person confirms it there.

#### Why

Anyone can craft a link and get it tapped, so a link that acts at once acts for its author, not for the user.

#### Examples

```pseudo title="Avoid"
route("/invoices/:invoiceId/pay", InvoiceAddress, function(params)
  call payInvoice(params.invoiceId)

  return InvoicePaidScreen(invoiceId: params.invoiceId))
```

```pseudo title="Prefer"
route("/invoices/:invoiceId/pay", InvoiceAddress, function(params)
  return PayInvoiceScreen(invoiceId: params.invoiceId))

component PayInvoiceScreen({ invoiceId })
  let invoice = showInvoice(invoiceId)

  return Button(
    label: "Pay " + formatMoney(invoice.total),
    onPress: function() onPayInvoice({ invoiceId })
  )
```

### address-write-keeps-the-other-parameters · MUST

Every write to a screen's address changes only the parameter it is for, and every other parameter stays as it was.

#### Why

A screen that changes its page must keep the filter another part of it set, or the link no longer reproduces the view the user built.

#### Examples

```pseudo title="Avoid"
function goToPage(navigation, page)
  navigation.setQuery({ page })  # drops the status filter
```

```pseudo title="Prefer"
function goToPage(navigation, page)
  navigation.setQuery({ ...navigation.query, page })
```

### view-state-kept-in-the-navigation-state → fact-has-one-source · MUST

All view state that a link or a restart brings back lives in the platform's navigation state. Such state includes a filter, a sort, a page and the open tab.

#### Why

State a link must carry is lost on reload or shared by accident anywhere else — a single source of truth.

#### Examples

```pseudo title="Avoid"
component OrdersScreen()
  let [sort, setSort] = state(ByDate)

  return OrderTable(sort: sort, onSortChange: setSort)
```

```pseudo title="Prefer"
component OrdersScreen({ navigation })
  let query = parseOrdersAddress(navigation.query)

  return OrderTable(
    sort: query.sort,
    onSortChange: function(sort) navigation.setQuery({ ...navigation.query, sort })
  )
```

### unknown-address-shows-the-not-found-screen · SHOULD

Every screen address no screen answers shows the program's not-found screen. That screen is apart from the not-found state of a view whose data is missing.

#### Why

A mistyped or stale link otherwise ends on a blank page or an error, and the user cannot tell a wrong screen address from a broken program.

#### Examples

```pseudo title="Avoid"
Routes(
  Route(path: "/orders", screen: OrdersScreen),
  Route(path: "/orders/:orderId", screen: OrderScreen)
)
```

```pseudo title="Prefer"
Routes(
  Route(path: "/orders", screen: OrdersScreen),
  Route(path: "/orders/:orderId", screen: OrderScreen),
  Route(path: "*", screen: NotFoundScreen)
)
```

## Direction

### layout-mirrors-right-to-left · MUST

Where its language is written right to left, every screen's layout mirrors: what starts on the left starts on the right, and an icon that points along the reading direction turns. Exempt: numbers, media controls and logos, which keep their direction.

#### Why

A layout that runs against the reading direction makes a right-to-left reader read every screen backwards.

#### Examples

```pseudo title="Avoid"
Row(
  style: { paddingLeft: tokens.space.md },
  children: [Text(order.number), Icon(name: ChevronRight)]
)
```

```pseudo title="Prefer"
Row(
  style: { paddingStart: tokens.space.md },
  children: [Text(order.number), Icon(name: ChevronForward, isMirroredRightToLeft: true)]
)
```

## Permissions

### permission-asked-in-context · SHOULD

Every permission the platform asks the person for is requested when they first reach the capability that needs it. It is requested after the screen says why, never at start.

#### Why

A person grants what they understand at the moment it is needed, and a request out of context is refused for good.

#### Examples

```pseudo title="Avoid"
function onAppStart()
  call permissions.request(Camera)
  call permissions.request(Notifications)
```

```pseudo title="Prefer"
component ScanReceiptPrompt()
  return Stack(
    Text("Allow the camera to scan a receipt into this expense."),
    Button(label: "Allow camera", onPress: function() permissions.request(Camera))
  )
```

### refused-permission-costs-only-its-capability · SHOULD

Every permission the person refuses costs only the capability that needs it, and every other capability keeps working.

#### Why

A refusal that breaks what never needed the permission punishes the person for their choice, so they leave or grant it against their will.

#### Examples

```pseudo title="Avoid"
component ExpensesScreen()
  if permissions.status(Camera) is Refused then
    return CameraRequired()

  return Stack(ExpenseList(), ScanReceiptButton())
```

```pseudo title="Prefer"
component ExpensesScreen()
  let scan = permissions.status(Camera) is Refused
    ? CameraRefusedNotice()
    : ScanReceiptButton()

  return Stack(ExpenseList(), scan)
```

### refused-capability-says-how-to-grant · SHOULD

Every capability whose permission was refused says what it lacks and how to grant it in the platform's settings.

#### Why

A capability that fails silently tells the person nothing, and a request once refused is often not shown again, so the settings are their only way back.

#### Examples

```pseudo title="Avoid"
component ScanReceipt()
  if permissions.status(Camera) is Refused then
    return <absent>

  return ScanReceiptButton()
```

```pseudo title="Prefer"
component ScanReceipt()
  if permissions.status(Camera) is Refused then
    return Notice(
      text: "Scanning a receipt needs the camera. Allow it in Settings, under Expenses.",
      action: Button(label: "Open settings", onPress: permissions.openSettings)
    )

  return ScanReceiptButton()
```
