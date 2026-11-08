# Functions

> Governs a function.

## Vocabulary

A function **changes** something when it alters what outlives its call or lies beyond it, such as a value it was handed, a store, a file, an outside system or a message it sends; a diagnostic it writes changes nothing.

A **diagnostic** is a record written only for the program's operators or developers to follow its run, such as a line of its log, a trace or a metric, which no part of the program reads to decide on.

The program's **diagnostic handles** are the logger, the tracer and the meter it configures once, at its start, to write its diagnostics, and any stream it names for them there.

A function's **parameter object** is the one named object that carries the parts of one whole it takes by name, as `parts-of-one-whole-passed-by-name` gives them.

An operation that changes anything, as a function changes it, is a **command**, and one that changes nothing is a **query**; one action a command-line program runs by name is a subcommand, as the names chapter defines it.

## Purpose

### function-does-one-thing · SHOULD

Every function does one thing.

#### Why

A function that does two things cannot be named for what it does, nor tested or reused for one of them without the other.

#### Examples

```pseudo title="Avoid"
function placeOrder(order)
  if order.lines is empty then
    throw new EmptyOrderError()

  let total = 0

  for each line in order.lines
    total = total + line.price

  saveOrder(order, total)
  mailer.send(order.email, "Thanks")
```

```pseudo title="Prefer"
function placeOrder(order)
  ensureNotEmpty(order)

  let total = orderTotal(order)

  saveOrder(order, total)
  sendConfirmation(order)
```

### function-stays-at-one-level-of-abstraction · SHOULD

Every function works at one level of abstraction. It calls steps named for what they do, or does one step itself.

#### Why

A function that mixes the steps of a task with the details of one of them makes its reader switch between the two at every line, and hides the task behind the details.

#### Examples

```pseudo title="Avoid"
function checkOut(cart, context)
  let order = placeOrder(cart, context)
  let cents = 0

  for line in order.lines
    cents = cents + line.unitPriceCents * line.quantity

  call payments.charge(Money.ofCents(cents, order.currency), context)
  sendReceipt(order, context)
```

```pseudo title="Prefer"
function checkOut(cart, context)
  let order = placeOrder(cart, context)

  chargeOrder(order, context)
  sendReceipt(order, context)
```

### function-answers-or-changes · SHOULD

Every function either answers a question or changes something, never both. One that changes anything returns nothing but its failure, and one that answers changes nothing. Exempt: a primitive whose one atomic step changes and reports, such as a compare-and-set or a take from a queue, and a call to an outside system that reports the identifier it minted, each returning only what it reports.

#### Why

A question that changes something cannot be asked twice safely, and a function that changes something and returns an answer hands its caller a reason to call it for the answer — command–query separation.

#### Examples

```pseudo title="Avoid"
function cart(session, clock)
  session.lastSeenAt = clock.now()

  return session.cart
```

```pseudo title="Prefer"
function cart(session)
  return session.cart

function markSeen(session, clock)
  session.lastSeenAt = clock.now()
```

### function-decides-only-on-what-it-is-handed · SHOULD

Every function decides only on its input, on what its handed units tell it and on what it changes. The time and the configuration reach it as input or through a unit it is handed, such as a clock, never read from where it runs.

#### Why

A function that reads the time or the configuration from where it runs answers differently on each machine and each run, so a spec cannot pin its answer and a caller cannot see what it depends on, and one that changes something and reads more than it changes decides on data its caller never saw.

#### Examples

```pseudo title="Avoid"
function isOverdue(invoice)
  let graceDays = env("GRACE_DAYS")
  let cutoff = invoice.dueOn + graceDays

  return systemClock.today() > cutoff
```

```pseudo title="Prefer"
function isOverdue(
  invoice, clock, graceDays)

  let cutoff = invoice.dueOn + graceDays

  return clock.today() > cutoff
```

## Size and flow

### function-within-its-limits · MUST

Every function holds at most 100 lines, as the project's check measures them. Exempt: test code, which the tests chapter defines, a generated file, and a function whose body is one data literal it returns, such as a table or a drawing, by a suppression that says so.

#### Why

Past this size a function no longer fits in a reader's head, so a change to it is made without seeing all it does, and a limit that only warns is ignored.

#### Examples

```text title="Avoid"
function        lines
checkout          164
```

```text title="Prefer"
function        lines
checkout           18
priceLines         22
applyDiscounts     31
reserveStock       26
```

### function-complexity-within-15 · MUST

Every function has a cognitive complexity of at most 15, as the project's check measures it.

#### Why

Past this complexity a reader can no longer hold every path through a function at once, so a change to one path breaks another unseen, however short the function is.

#### Examples

```pseudo title="Avoid"
function shippingFee(order)
  if order.country is Home then
    if order.weight > HEAVY_KG then
      if order.isExpress then
        return EXPRESS_HEAVY_FEE
      else
        return HEAVY_FEE
    else
      if order.isExpress then
        return EXPRESS_FEE
      else
        if order.total > FREE_SHIPPING_FROM then
          return ZERO_FEE
        ...
```

```pseudo title="Prefer"
function shippingFee(order)
  if order.country is not Home then
    return abroadFee(order)

  if order.total > FREE_SHIPPING_FROM then
    return ZERO_FEE

  return HOME_FEES[weightClass(order.weight)][order.speed]
```

### function-leaves-early-on-failure · SHOULD

Every function leaves its failure paths first, through guard clauses, so its main path stays at the top level of indentation. Exempt: a genuine hierarchy, such as a parser or a tree walk.

#### Why

Each level of nesting is one more condition a reader holds while reading a line, so a main path buried under them is the one most often misread.

#### Examples

```pseudo title="Avoid"
function refundOrder(order)
  if order.isPaid then
    if not order.isRefunded then
      issueRefund(order)

      return markRefunded(order)
    else
      throw new OrderAlreadyRefundedError()
  else
    throw new OrderNotPaidError()
```

```pseudo title="Prefer"
function refundOrder(order)
  if not order.isPaid then
    throw new OrderNotPaidError()

  if order.isRefunded then
    throw new OrderAlreadyRefundedError()

  issueRefund(order)

  return markRefunded(order)
```

## Parameters

### function-takes-at-most-three-positions · MUST

Every function takes at most three positional parameters. Exempt: a signature a framework imposes.

#### Why

A caller must remember the order of every position and swaps two of them unseen, and each new position changes every call.

#### Examples

```pseudo title="Avoid"
function issueInvoice(customerId,
  dueOn, lines, currency, note)

issueInvoice(customerId, dueOn,
  lines, Eur, "Net 30")
```

```pseudo title="Prefer"
function issueInvoice(draft)

issueInvoice({
  customerId, dueOn, lines,
  currency: Eur, note: "Net 30"
})
```

### parts-of-one-whole-passed-by-name · SHOULD

Every function takes the parts of one whole by name at the call site, never by position. Such parts include the fields of an order and the options of a call, and they come as one named object or as keyword arguments where the language has them, whatever their number. Exempt: a signature a framework imposes.

#### Why

The parts of one whole passed by position are swapped unseen and grow with the whole, while a value named at the call site says what it is.

#### Examples

```pseudo title="Avoid"
let line = OrderLine.of(productId, 3, unitPrice)
```

```pseudo title="Prefer"
let line = OrderLine.of({
  productId,
  quantity: 3,
  unitPrice,
})
```

### function-takes-no-boolean-position · MUST

Every function takes every boolean by name, never by position. The call site names the flag, as a field of the call's object or a keyword argument where the language has them, or the function becomes two that each say what they do.

#### Why

A bare `true` or `false` at a call site says nothing of what it switches, so a reader opens the function to read the call, and a flag passed the wrong way reads as correct.

#### Examples

```pseudo title="Avoid"
function saveUser(user, shouldNotify)

saveUser(user, true)
```

```pseudo title="Prefer"
function saveUser(user, options)

saveUser(user, { shouldNotify: true })
```

### function-tells-same-type-parameters-apart · SHOULD

Every function tells apart the parameters that share a type. It takes them as one named object or gives each a type of its own. Exempt: an operation whose operands play one role, such as a comparison or a combiner, which takes them in order.

#### Why

Two values of one type in a row compile either way round, so a call that swaps them passes every check and does the wrong thing.

#### Examples

```pseudo title="Avoid"
function transfer(
  from: AccountId,
  to: AccountId,
  amount: Money)

# compiles either way round
transfer(bobId, aliceId, amount)
```

```pseudo title="Prefer"
function transfer(request: {
  from: AccountId,
  to: AccountId,
  amount: Money })

transfer({ from: aliceId,
  to: bobId, amount })
```
