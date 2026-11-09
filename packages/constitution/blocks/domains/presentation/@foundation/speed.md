# Speed

> Governs how fast a screen feels: what it shows while it loads, the images it fetches and how it answers input.

## Loading

### loading-never-replaces-shown-content · SHOULD

No reload replaces content a screen already shows with a loading indicator: the content stays in place while it reloads or the screen moves to its next state.

#### Why

Content that blinks to a placeholder on every refresh reads as a failure, and the user loses their place.

#### Examples

```pseudo title="Avoid"
when orders
  is Loading, Reloading then return LoadingIndicator()  # blanks the table on refresh
  is Failed then return ErrorNotice(error: orders.error, onRetry: orders.retry)
  is Loaded then return OrderTable(orders.data)
```

```pseudo title="Prefer"
when orders
  is Loading then return LoadingIndicator()
  is Failed then return ErrorNotice(error: orders.error, onRetry: orders.retry)
  is Reloading then return OrderTable(orders.data, isRefreshing: true)
  is Loaded then return OrderTable(orders.data)
```

### loading-indicator-delayed · SHOULD

Every indicator of a data load appears only once the load outlasts a delay the project sets. A fast load then shows none.

#### Why

Below about a second a wait needs no sign, and an indicator flashed for a fast load reads as a glitch.

#### Examples

```pseudo title="Avoid"
component OrdersLoading()
  return Spinner()
```

```pseudo title="Prefer"
component OrdersLoading()
  let isLate = useElapsed(LOADING_INDICATOR_DELAY)

  return isLate ? Spinner() : <absent>
```

### loading-indicator-held-once-shown · SHOULD

Every indicator of a data load stays, once shown, for a minimum the project sets, so it never flashes.

#### Why

An indicator that vanishes a moment after it appears reads as a glitch and makes the screen feel slower than it is.

#### Examples

```pseudo title="Avoid"
let isSpinnerShown = useDelayedFlag(orders.status is Loading, {
  delay: LOADING_INDICATOR_DELAY
})
```

```pseudo title="Prefer"
let isSpinnerShown = useDelayedFlag(orders.status is Loading, {
  delay: LOADING_INDICATOR_DELAY,
  minimumShown: LOADING_INDICATOR_MINIMUM
})
```

### late-content-reserves-its-space · SHOULD

All late content has its space reserved before it arrives, so nothing already shown moves. Late content arrives after the screen is drawn, such as data, an image, an embed or a notice, and its space is reserved from that first draw at its declared size, whether or not an indicator of its load shows yet.

#### Why

A layout that jumps when content lands makes the user lose their place or press what slid under their finger.

#### Examples

```pseudo title="Avoid"
Stack(
  Image(source: product.photo),  # pushes the price down when it lands
  Text(formatMoney(product.price))
)
```

```pseudo title="Prefer"
Stack(
  Image(source: product.photo, width: product.photo.width, height: product.photo.height),
  Text(formatMoney(product.price))
)
```

### long-work-named-while-it-runs · SHOULD

Every task a person waits on past a bound the project sets names what it is doing while it runs.

#### Why

A wait with no name looks like a hang, and the person leaves or starts the work again.

#### Examples

```pseudo title="Avoid"
when export
  is Running then return Spinner()
  is Done then return DownloadLink(export.file)
```

```pseudo title="Prefer"
when export
  is Running then return Busy(label: "Exporting invoices")
  is Done then return DownloadLink(export.file)
```

### long-work-shows-its-progress · SHOULD

Every task a person waits on past a bound the project sets shows how far it has come. It shows the share done, the current step or the time left, wherever the program knows it.

#### Why

A wait with no progress gives the person no way to tell a slow task from a stuck one, so they give up on work about to finish.

#### Examples

```pseudo title="Avoid"
when export
  is Running then return Busy(label: "Exporting invoices")
  is Done then return DownloadLink(export.file)
```

```pseudo title="Prefer"
when export
  is Running then return ProgressBar(
    label: "Exporting invoices",
    value: export.exportedCount,
    maximum: export.totalCount
  )
  is Done then return DownloadLink(export.file)
```

## Images

### image-sharp-at-the-pixel-density · SHOULD

Every image a screen shows is fetched for the screen's pixel density: sharp, and never larger than that density needs.

#### Why

One image size is blurry on a dense screen and wasteful on a plain one.

#### Examples

```pseudo title="Avoid"
Image(
  source: product.photoUrl(width: 1600),
  width: tokens.size.productPhotoWidth,
  height: tokens.size.productPhotoHeight
)
```

```pseudo title="Prefer"
let PHOTO_DENSITIES = [1, 2, 3]

Image(
  sources: PHOTO_DENSITIES.map(density -> {
    url: product.photoUrl(width: tokens.size.productPhotoWidth * density),
    density: density
  }),
  width: tokens.size.productPhotoWidth,
  height: tokens.size.productPhotoHeight
)
```

## Response

### felt-speed-measured-in-the-field-within-budget · SHOULD

The interface's felt speed stays within the project's budget, measured in the field at the 75th percentile of real uses. That speed is the wait for its main content, the answer to the person's input and the stillness of what it shows.

#### Why

A fast developer's machine hides the slow devices and networks people use, and the 75th percentile counts the slow quarter an average smooths away.

#### Examples

```text title="Avoid"
Speed check, before release
  Measured on   the developer's laptop, office network
  Main content  0.9 s
  Input answer  40 ms
```

```text title="Prefer"
Felt speed, field data from real uses, 75th percentile
  Main content     2.1 s    budget 2.5 s
  Input answer     160 ms   budget 200 ms
  Layout shift     0.04     budget 0.1
```

### interaction-answered-before-its-work · SHOULD

Every interaction shows its first visible response before the work it starts, within a bound the project sets. Such a response is a pressed state, an opened layer or a busy mark.

#### Why

A press that shows nothing reads as missed, so the user presses again or leaves.

#### Examples

```pseudo title="Avoid"
function onAddToCart(product)
  setCart(addToCart(product))  # nothing shows until the server answers
```

```pseudo title="Prefer"
function onAddToCart(product)
  setAddingProductId(product.id)

  try
    setCart(addToCart(product))
  finally
    setAddingProductId(<absent>)
```

### long-work-never-blocks-input · SHOULD

No work an interaction starts that lasts past a bound the project sets blocks the next input; it runs after the interaction's first response.

#### Why

Work that holds the screen still swallows the next press, so the person thinks the program froze and presses again.

#### Examples

```pseudo title="Avoid"
function onFilterChange(filter)
  setFilter(filter)
  setRows(sortAndGroup(allInvoices, filter))  # holds the screen for a second
```

```pseudo title="Prefer"
function onFilterChange(filter)
  setFilter(filter)

  afterNextPaint(function()
    setRows(sortAndGroup(allInvoices, filter)))
```

### fast-source-updates-once-per-frame · SHOULD

Every fast source updates a screen's state at most once a frame, its events folded in batches. Such sources include a resize, a scroll and a stream.

#### Why

Dozens of updates a second redraw nothing the user can see and starve everything else.

#### Examples

```pseudo title="Avoid"
priceStream.onMessage(function(tick)
  setPrices(prices => applyTick(prices, tick)))
```

```pseudo title="Prefer"
let pending = []

priceStream.onMessage(function(tick)
  pending.push(tick))

onEveryFrame(function()
  if pending is not empty then
    setPrices(prices => applyTicks(prices, pending.takeAll())))
```

### result-never-held-back-by-motion · SHOULD

No animation holds back the result of an action: the change the action makes takes effect, and what it opens takes input, while any animation of it plays.

#### Why

A result held back by motion makes the interface slow however fast its work is.

#### Examples

```pseudo title="Avoid"
function onArchive(order)
  call animateOut(rowOf(order), { transition: tokens.motion.exit.standard })
  call archiveOrder(order.id)
```

```pseudo title="Prefer"
function onArchive(order)
  call archiveOrder(order.id)

  animateOut(rowOf(order), { transition: tokens.motion.exit.standard })
```

### frequent-interaction-never-waits-on-motion · SHOULD

Every layer the person opens many times a session, such as a menu or a command palette, opens without an entrance animation.

#### Why

An animation seen for the hundredth time is only a wait, even one that holds nothing back.

#### Examples

```pseudo title="Avoid"
CommandPalette(
  isOpen: isPaletteOpen,
  enter: { fade: true, scaleFrom: 0.96, transition: tokens.motion.enter.standard }
)
```

```pseudo title="Prefer"
CommandPalette(
  isOpen: isPaletteOpen,
  exit: { fade: true, transition: tokens.motion.exit.quick }
)
```

### long-lists-virtualised · SHOULD

Every list whose length the product does not bound renders only the rows in view and those near them, or is paged.

#### Why

A list that mounts every row at once grows slower with every item, and a long one freezes the device.

#### Examples

```pseudo title="Avoid"
List(
  items: transactions,
  renderItem: TransactionRow
)
```

```pseudo title="Prefer"
VirtualList(
  items: transactions,
  rowHeight: tokens.size.listRow,
  renderItem: TransactionRow
)
```
