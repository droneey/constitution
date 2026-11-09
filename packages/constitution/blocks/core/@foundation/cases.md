# Cases

> Governs how a case is written: what it asserts, its fixtures, the files it compares with, its name, its steps, and that it always runs.

## Vocabulary

The **behaviour word** is **`should`**{#behaviour-word} and the **condition word** **`when`**{#condition-word}.

A case's steps are its **arrange step**, its **act step** and its **assert step**, and their **step comments** are **`Arrange`**{#arrange-comment}, **`Act`**{#act-comment} and **`Assert`**{#assert-comment}.

Each spelling is a default.

## Assertions

### case-proves-one-intent · SHOULD

Every case proves one intent, asserting only the part of the outcome the intent is about.

#### Why

A case of several intents fails without saying which behaviour broke, and an assertion on the whole outcome fails on every change to a part another case is about.

#### Examples

```pseudo title="Avoid"
test "should apply the coupon"
  # Arrange
  let cart = createCart({ total: 100 })
  # Act
  let discounted = applyCoupon(cart, "TEN")

  # Assert
  assert discounted.total is 90
  assert discounted.loyaltyPoints is 9
```

```pseudo title="Prefer"
test "should apply the coupon"
  # Arrange
  let cart = createCart({ total: 100 })
  # Act
  let discounted = applyCoupon(cart, "TEN")

  # Assert
  assert discounted.total is 90
```

### case-asserts-what-a-caller-observes · SHOULD

Every case checks an outcome a caller observes. Such outcomes include a returned value, a changed state and what a user sees. Exempt: a call on a fake, where the call itself is the behaviour.

#### Why

A test of calls breaks when the implementation changes and passes when the behaviour breaks behind the same calls.

#### Examples

```pseudo title="Avoid"
test "should cancel a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  let orderRepository = new OrderRepositoryFake([order])
  let cancelOrder = createCancelOrder({ orderRepository })
  let context = createContext()

  # Act
  cancelOrder({ orderId: order.id }, context)
  # Assert
  assert orderRepository.updates is [order.id]
```

```pseudo title="Prefer"
test "should cancel a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  let orderRepository = new OrderRepositoryFake([order])
  let cancelOrder = createCancelOrder({ orderRepository })
  let context = createContext()

  # Act
  cancelOrder({ orderId: order.id }, context)
  # Assert
  assert orderRepository.find(order.id).status is Cancelled
```

### case-asserts-by-strict-equality · SHOULD

Every assertion of a case compares by strict equality, never by a loose one. Exempt: an assertion that compares no two values, such as the invariant a property case states or a parse's rejection of its input.

#### Why

A loose equality lets the part it compares change unseen, so the case passes on a value it was meant to refuse.

#### Examples

```pseudo title="Avoid"
test "should apply the coupon"
  # Arrange
  let cart = createCart({ total: 100 })
  # Act
  let discounted = applyCoupon(cart, "TEN")

  # Assert
  assert discounted.total looselyEquals "90"
```

```pseudo title="Prefer"
test "should apply the coupon"
  # Arrange
  let cart = createCart({ total: 100 })
  # Act
  let discounted = applyCoupon(cart, "TEN")

  # Assert
  assert discounted.total is 90
```

### case-pins-meaning-never-wording · MUST

Every case pins what a text means, never its wording. It reads a message, a report or a rendered text by what it means, such as its code, its subject and the values it names, taken from the value before it is rendered where the unit gives one, and compares that whole.

#### Why

A case that pins wording fails on every rewording while the behaviour holds, so one change of text rewrites the specs.

#### Examples

```pseudo title="Avoid"
# Assert
assert failure.message is
  "Order 42 was not found."
```

```pseudo title="Prefer"
# Assert
assert failure is {
  code: "order.not-found",
  orderId: "42",
}
```

### expected-value-written-as-a-literal · SHOULD

Every case's expected value is a literal, or a fixture's default with literal field values, never computed by the logic under test. Exempt: a property case, whose assert step states the invariant for every input it draws.

#### Why

An expected value computed by the code under test agrees with whatever that code does.

#### Examples

```pseudo title="Avoid"
test "should total the invoice lines"
  # Arrange
  let lines = [createLine({ net: 40 }), createLine({ net: 60 })]
  # Act
  let total = invoiceTotal(lines)

  # Assert
  assert total is sum(lines, lineNet)
```

```pseudo title="Prefer"
test "should total the invoice lines"
  # Arrange
  let lines = [createLine({ net: 40 }), createLine({ net: 60 })]
  # Act
  let total = invoiceTotal(lines)

  # Assert
  assert total is 100
```

### test-asserts-something · MUST

Every test asserts something.

#### Why

A test without an assertion passes whatever the code does, and counts as coverage it never gives.

#### Examples

```pseudo title="Avoid"
test "should cancel the order"
  # Arrange
  let order = createOrder()
  # Act
  let cancelled = cancel(order)

  # Assert
  let isCancelled = cancelled.status is Cancelled
```

```pseudo title="Prefer"
test "should cancel the order"
  # Arrange
  let order = createOrder()
  # Act
  let cancelled = cancel(order)

  # Assert
  assert cancelled.status is Cancelled
```

## Fixtures

### fixture-builds-a-valid-default · SHOULD

Every fixture builds a valid value by default.

#### Why

A fixture that builds an invalid value makes every case build its own value whole — a test data builder.

#### Examples

```pseudo title="Avoid"
test "should refund a paid order"
  # Arrange
  let order = { id: "order-7",
    userId: "user-3", total: 12,
    lines: [{ sku: "mug", quantity: 1 }],
    currency: "EUR", status: Paid }
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund
    is createRefund({ total: 12 })
```

```pseudo title="Prefer"
# __tests__/orders.fixtures
function createOrder(overrides)
  return { id: "order-7", total: 12,
    status: Draft, ...overrides }

test "should refund a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund
    is createRefund({ total: 12 })
```

### fixture-takes-the-values-a-case-sets · SHOULD

Every fixture takes the field values a case sets in place of its defaults.

#### Why

A fixture that takes no field values makes every case that needs one field of its own build its value whole — a test data builder.

#### Examples

```pseudo title="Avoid"
# __tests__/orders.fixtures
function createOrder()
  return { id: "order-7", total: 12, status: Draft }

test "should refund a paid order"
  # Arrange
  let order = { id: "order-7", total: 12, status: Paid }
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund.total is 12
```

```pseudo title="Prefer"
# __tests__/orders.fixtures
function createOrder(overrides)
  return { id: "order-7", total: 12, status: Draft, ...overrides }

test "should refund a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund.total is 12
```

### case-sets-only-the-fields-its-condition-is-about · SHOULD

Every case sets in a fixture only the fields its condition is about.

#### Why

A case that sets every field hides the one it is about among the rest.

#### Examples

```pseudo title="Avoid"
test "should refuse to ship when the order is unpaid"
  # Arrange
  let order = createOrder({ id: "order-7", total: 12,
    currency: "EUR", customerId: "customer-3", status: Placed })
  # Act
  let failure = thrownBy(function() shipOrder(order))

  # Assert
  assert failure is OrderNotPaidError({ orderId: "order-7" })
```

```pseudo title="Prefer"
test "should refuse to ship when the order is unpaid"
  # Arrange
  let order = createOrder({ status: Placed })
  # Act
  let failure = thrownBy(function() shipOrder(order))

  # Assert
  assert failure is OrderNotPaidError({ orderId: order.id })
```

### generator-built-on-the-fixture · SHOULD

Every property case's generator is built on the fixture, so each draw is valid. Exempt: a case about invalid input.

#### Why

A generator with its own idea of a valid value spends its draws on input the unit refuses.

#### Examples

```pseudo title="Avoid"
property "should never refund more than was paid"
  # Arrange
  given order from anyRecord({ total: anyNumber(), status: anyString() })
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund.total <= order.total
```

```pseudo title="Prefer"
property "should never refund more than was paid"
  # Arrange
  given total from anyPositiveMoney()
  let order = createOrder({ total, status: Paid })
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund.total <= order.total
```

## Golden files and snapshots

### renderer-wording-pinned-once · SHOULD

Every renderer's wording and layout are pinned once, by a case that compares its generated output.

#### Why

Wording no case pins changes unseen, so the text its users read breaks while every case of meaning passes.

#### Examples

```pseudo title="Avoid"
# the reminder's wording is checked by no case
test "should name the overdue invoice"
  # Arrange
  let invoice = createInvoice({ number: "INV-7" })
  # Act
  let reminder = reminderFor(invoice)

  # Assert
  assert reminder.invoiceNumber is "INV-7"
```

```pseudo title="Prefer"
test "should render the overdue reminder"
  # Arrange
  let reminder = createReminder({ invoiceNumber: "INV-7" })
  # Act
  let text = renderReminder(reminder)

  # Assert
  assert text is readGolden("overdue-reminder.golden.txt")
```

### snapshot-readable-by-eye · SHOULD

Every snapshot holds only what a reader can check by eye.

#### Why

A snapshot nobody reads is accepted whatever it holds.

#### Examples

```pseudo title="Avoid"
test "should export the invoice"
  # Arrange
  let invoice = createInvoice()
  # Act
  let file = exportInvoice(invoice)

  # Assert
  assert file matches snapshot  # 2,400 lines of escaped XML in one string
```

```pseudo title="Prefer"
test "should export the invoice"
  # Arrange
  let invoice = createInvoice()
  # Act
  let file = exportInvoice(invoice)

  # Assert
  assert file is readGolden("invoice.golden.xml")
```

### generated-format-compared-with-one-golden-file · SHOULD

Every generated format is compared with one golden file a reader can read, never with a table of its wording.

#### Why

A format pinned by a table of its wording is rewritten line by line while no reader sees it whole.

#### Examples

```pseudo title="Avoid"
test "should export the invoice as CSV"
  # Arrange
  let invoice = createInvoice()
  # Act
  let lines = exportInvoiceCsv(invoice).lines()

  # Assert
  assert lines[0] is "number,date,net,tax"
  assert lines[1] is "INV-7,2026-03-01,100.00,20.00"
```

```pseudo title="Prefer"
test "should export the invoice as CSV"
  # Arrange
  let invoice = createInvoice()
  # Act
  let csv = exportInvoiceCsv(invoice)

  # Assert
  assert csv is readGolden("invoice.golden.csv")
```

## Names

### case-named-should-when · MUST

Every case's name gives its behaviour after the behaviour word, then, where it depends on one, its condition after the condition word. The name opens with the behaviour word.

#### Why

A case named otherwise fails without saying which behaviour broke or under what condition, so every failure is opened before it is understood.

#### Examples

```pseudo title="Avoid"
suite "OrderServiceTests"
  test "cancel"
  test "cancel 2"
  test "test refund"
```

```pseudo title="Prefer"
suite "cancelOrder"
  test "should cancel a draft order"
  test "should refund when it is paid"
  test "should fail when it has shipped"
```

## Steps

### case-split-by-arrange-act-assert-comments · MUST

Every case is split into its arrange, act and assert steps, each opened by its step comment on its own line. Each is present once, in that order, and never left empty. Exempt: the arrange step of a case that arranges nothing, such as one whose table row gives every input, which is left out; and the act and assert steps of a lifecycle case, repeated for each transition, and of an end-to-end case, repeated for each step of its scenario.

#### Why

A case whose steps run together leaves its reader to work out what is set up, what is done and what is proven — Arrange–Act–Assert.

#### Examples

```pseudo title="Avoid"
test "should refund a paid order"
  let order = createOrder({ status: Paid })
  let refund = refundFor(order)
  assert refund is createRefund()
```

```pseudo title="Prefer"
test "should refund a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund is createRefund()
```

### act-makes-one-call · SHOULD

Every case's act step makes one call.

#### Why

An act step of two calls hides which one the assert step is about.

#### Examples

```pseudo title="Avoid"
test "should cancel a paid order"
  # Arrange
  let order = createOrder({ status: Placed })
  # Act
  let paid = payOrder(order)
  let cancelled = cancelOrder(paid)

  # Assert
  assert cancelled.status is Cancelled
```

```pseudo title="Prefer"
test "should cancel a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  # Act
  let cancelled = cancelOrder(order)

  # Assert
  assert cancelled.status is Cancelled
```

### case-holds-no-logic · MUST

Every case is a straight line of literal steps, never logic. It has no branch, loop or conditional expression.

#### Why

Logic in a case can be as wrong as the code it checks, and nothing checks the case.

#### Examples

```pseudo title="Avoid"
test "should add tax to each line"
  # Arrange
  let invoice = createInvoice({
    lines: [createLine({ net: 100 })] })
  # Act
  let taxed = invoiceWithTax(invoice)

  # Assert
  for each line in taxed.lines
    assert line.gross is
      line.net * (1 + TAX_RATE)
```

```pseudo title="Prefer"
test "should add tax to each line"
  # Arrange
  let invoice = createInvoice({
    lines: [createLine({ net: 100 })] })
  # Act
  let taxed = invoiceWithTax(invoice)

  # Assert
  assert taxed.lines is [
    createLine({ net: 100, gross: 120 })]
```

### variants-are-one-table · SHOULD

The variants of every behaviour are one table of cases, each row naming its condition.

#### Why

Variants spread over separate cases hide which conditions are covered, so the missing one goes unseen.

#### Examples

```pseudo title="Avoid"
test "should charge 5 when it is light"
  # Arrange
  let parcel = createParcel({ weightKg: 1 })
  # Act
  let fee = shippingFee(parcel)

  # Assert
  assert fee is 5

test "should charge 15 when it is heavy"
  # Arrange
  let parcel = createParcel({ weightKg: 20 })
  # ...the same, with 15
```

```pseudo title="Prefer"
for each { when, weightKg, fee } in
  | it is light   | 1  | 5  |
  | it is medium  | 5  | 9  |
  | it is heavy   | 20 | 15 |

  test "should charge {fee} when {when}"
    # Arrange
    let parcel = createParcel({ weightKg })
    # Act
    let actual = shippingFee(parcel)

    # Assert
    assert actual is fee
```

## Running

### test-runs-unconditionally · MUST

Every test runs unconditionally. No test is skipped, left unfinished, singled out so the others do not run, run only under a condition or expected to fail. Exempt: a test compiled only for the platform its code is compiled for.

#### Why

A skipped test looks like coverage and proves nothing, and a singled-out one silently skips all the others.

#### Examples

```pseudo title="Avoid"
skip test "should email the receipt"
  ...
only test "should refund the order"
  ...
```

```pseudo title="Prefer"
test "should email the receipt"
  ...

test "should refund the order"
  ...
```
