# Tests

> Governs specs and what their cases prove, where test code lives, when a test is written, the sandbox, fakes and engines, and the test gates.

## Vocabulary

A **spec** is a file of cases about one boundary, or a section of a file that only tests compile.

A **case** is one test in a spec: one behaviour checked under one condition.

A rule that says **test** binds a spec and a case alike.

A **boundary** is a unit a caller relies on, reached as its callers reach it.

A **fake** is a working implementation of a contract, as the relations chapter defines it, made for specs.

A **contract suite** is the one set of cases that every implementation of a contract, its fake included, passes.

The **test runner** is the tool that finds the specs and runs them.

**Test code** is a spec, a fake, a contract suite, fixtures, a golden file, a snapshot or an example that renders a unit in isolation for review, such as a component's story; all other code is production code.

The program's **assembly**{#assembly} is the code that only builds its parts and connects them, and its entry files hand the process to it.

An **engine** is the real software an implementation over an outside system drives, such as the system itself, a database, a broker, a parser or a file system.

A test's **sandbox** is all it may reach: a network only to the engines and the programs it started, on the loopback; a file system only in a temporary folder and, to read, in the repository's files; the processes it started; and the passwords and keys of its engines.

A spec is of one of four kinds:

**Unit spec.** One boundary, with fakes of the contracts through which it reaches the outside.

**Integration spec.** The code that talks to an outside system, against its real engine run in the sandbox, such as in a temporary folder, as the real parser or as a disposable instance of the engine.

**End-to-end spec.** A critical scenario of `PROJECT.md`, through the built program, the way its users reach it.

**Boot spec.** The whole program, started as its entry file starts it, with the real assembly and only the systems outside the program replaced by their fakes.

An **artefact** is one whole thing a program ships as, such as a binary, an image, a bundle or a built package, or its source at one version where nothing builds it.

The **built program** is the program run from its artefacts, reached the way its users reach it: for a library, its built package, called through its published entries as a consumer calls it.

A **gate** is a bar all the specs together meet for the project's check, as the tools chapter defines it, to pass, such as full coverage or every mutant killed.

The **logic under coverage** is all production code but generated files, declarations, vendored code, and the entry files and the assembly while they decide nothing.

## What a spec proves

### spec-proves-one-boundary · SHOULD

Every spec proves one boundary, and what the boundary uses is proven through it. Exempt: a helper's spec of its own, for a mutant of the helper that its boundary's spec does not kill.

#### Why

A spec per file mirrors the layout, not the behaviour, and breaks when a helper moves while the behaviour stays, and a behaviour proven in two kinds of spec is read, run and updated twice for a bug either catches alone.

#### Examples

```text title="Avoid"
place-order/
├── place-order.use-case
├── round-half-even.utils
├── clamp.utils
└── __tests__/
    ├── place-order.use-case.test
    ├── round-half-even.utils.test
    └── clamp.utils.test
```

```text title="Prefer"
place-order/
├── place-order.use-case
├── round-half-even.utils
├── clamp.utils
└── __tests__/
    └── place-order.use-case.test
```

### spec-named-after-its-boundary · SHOULD

Every spec is named after the boundary it proves. Exempt: a helper's spec of its own, which is named after its helper.

#### Why

A spec named for anything else is not found by the reader of its boundary, and outlives a boundary it no longer names.

#### Examples

```text title="Avoid"
refund-order/
├── refund-order.use-case
└── __tests__/
    └── refund-helpers.test
```

```text title="Prefer"
refund-order/
├── refund-order.use-case
└── __tests__/
    └── refund-order.use-case.test
```

### spec-only-for-behaviour · SHOULD

Every spec proves behaviour. Types, constants, schemas, entry files, generated files and third-party code get none. Exempt: a spec another rule asks for.

#### Why

A spec of what does nothing proves nothing and breaks on every edit.

#### Examples

```pseudo title="Avoid"
test "should allow twenty lines per order"
  # Act
  let limit = MAX_LINES_PER_ORDER

  # Assert
  assert limit is 20
```

```pseudo title="Prefer"
test "should refuse the order when it has more lines than allowed"
  # Arrange
  let lines = repeat(createOrderLine(), 21)
  # Act
  let failure = thrownBy(function() placeOrder({ lines }))

  # Assert
  assert failure is TooManyLinesError({ lineCount: 21 })
```

### constant-others-rely-on-pinned-by-a-table · SHOULD

Every set of constants a reader outside the code relies on is proven by one table of its own. Such constants include the codes users script against and the names another system reads.

#### Why

A constant others rely on changes their behaviour when it changes, and no spec of behaviour notices the change.

#### Examples

```pseudo title="Avoid"
# cli/exit-codes.constants
const EXIT_OK = 0
const EXIT_INVALID_INPUT = 2
const EXIT_ORDER_NOT_FOUND = 3
```

```pseudo title="Prefer"
# cli/__tests__/exit-codes.constants.test
for each { name, code } in
  | EXIT_OK              | 0 |
  | EXIT_INVALID_INPUT   | 2 |
  | EXIT_ORDER_NOT_FOUND | 3 |

  test "should keep {name} at {code}"
    # Act
    let actual = exitCodes[name]

    # Assert
    assert actual is code
```

### case-earns-its-place · SHOULD

Every case earns its place by failing for a plausible bug no other case catches. One that cannot fail, such as a restated constant, a check of a library or a duplicate, is deleted. Exempt: a row of a table the constant-others-rely-on-pinned-by-a-table rule asks for.

#### Why

A case that catches nothing costs reading, running and updating, and makes the specs look stronger than they are.

#### Examples

```pseudo title="Avoid"
test "should set the tax rate"
  # Arrange
  let expected = 0.2
  # Act
  let rate = TAX_RATE

  # Assert
  assert rate is expected
```

```pseudo title="Prefer"
test "should add tax to the net total"
  # Arrange
  let invoice = createInvoice({ net: 100 })
  # Act
  let total = grossTotal(invoice)

  # Assert
  assert total is 120
```

### declared-failure-has-a-case · SHOULD

Every failure a boundary declares has a case that produces it and checks what the caller receives.

#### Why

A failure path is the code least exercised by use, so it is the first to break unnoticed.

#### Examples

```pseudo title="Avoid"
# cancelOrder declares OrderNotFoundError, and no case produces it
test "should cancel a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  let orderRepository = new OrderRepositoryFake([order])
  let cancelOrder = createCancelOrder({ orderRepository })
  # Act
  let cancelled = cancelOrder({ orderId: order.id }, createContext())

  # Assert
  assert cancelled.status is Cancelled
```

```pseudo title="Prefer"
test "should fail with OrderNotFoundError when the order does not exist"
  # Arrange
  let orderRepository = new OrderRepositoryFake()
  let cancelOrder = createCancelOrder({ orderRepository })
  let context = createContext()
  # Act
  let failure = thrownBy(function() cancelOrder({ orderId: "order-404" }, context))

  # Assert
  assert failure is OrderNotFoundError({ orderId: "order-404" })
```

### edge-cases-chosen-by-risk · SHOULD

Every spec's boundary cases are chosen by risk and by the partitions of the input. Such cases include empty input, the values on and off each limit, Unicode, invalid input, a concurrent call and a lost connection.

#### Why

Bugs live at the boundaries, and cases picked without the partitions of the input pile up in its middle while the boundary that breaks goes untested — equivalence partitioning and boundary-value analysis.

#### Examples

```pseudo title="Avoid"
suite "addToCart"  # a quantity from 1 to 99, tested only in its middle
  for each { quantity } in
    | 5  |
    | 10 |
    | 50 |

    test "should add the product when the quantity is {quantity}"
```

```pseudo title="Prefer"
suite "addToCart"
  test "should add the product when the cart is empty"

  for each { quantity } in
    | 1  |
    | 99 |

    test "should add the product when the quantity is {quantity}"

  for each { quantity } in
    | 0   |
    | 100 |

    test "should fail with InvalidQuantityError when the quantity is {quantity}"

  test "should keep the product name when it is Crème brûlée"
  test "should add both products when two calls add at once"
  test "should fail with StockUnavailableError when the stock is offline"
```

### property-tested-where-it-pays · SHOULD

Every checked constructor, mapper that can be inverted, transition function and parser of values from outside has a property case. A parser's case proves that on any input it returns a value or its declared failure and nothing else.

#### Why

Cases written by hand miss the inputs no author thought of — property-based testing.

#### Examples

```pseudo title="Avoid"
test "should parse a row of three fields"
  # Act
  let parsed = parseOrderRow("order-7,mug,2")

  # Assert
  assert parsed.quantity is 2
```

```pseudo title="Prefer"
property "should return an Order or an InvalidRowError for any row"
  # Arrange
  given row from anyString()
  # Act
  let parsed = parseOrderRow(row)

  # Assert
  assert parsed is Order or parsed is InvalidRowError
```

### property-counterexample-kept-as-a-fixed-case · SHOULD

Every counterexample a property case finds is kept as a fixed case.

#### Why

A counterexample not kept lets the input that broke the code come back unseen.

#### Examples

```pseudo title="Avoid"
property "should return a Quantity or an InvalidQuantityError for any text"
  # Arrange
  given text from anyString()
  # Act
  let parsed = parseQuantity(text)

  # Assert
  assert parsed is Quantity or parsed is InvalidQuantityError
```

```pseudo title="Prefer"
property "should return a Quantity or an InvalidQuantityError for any text"
  # Arrange
  given text from anyString()
  # Act
  let parsed = parseQuantity(text)

  # Assert
  assert parsed is Quantity or parsed is InvalidQuantityError

test "should return InvalidQuantityError when the text is a full-width digit"
  # Act
  let parsed = parseQuantity("３")

  # Assert
  assert parsed is InvalidQuantityError({ reason: "not a digit" })
```

### lifecycle-tested-to-its-final-stage · SHOULD

Every value that moves through stages is tested through every move to each of its final stages. Each case takes one path from its first stage to a final stage and checks each step, and the paths together take every move.

#### Why

Each transition may pass alone while their sequence breaks.

#### Examples

```pseudo title="Spec"
test "should take an order from draft to delivered"
  # Arrange
  let draft = createOrder({ id: "order-7", lines: [createLine()] })
  # Act
  let paid = pay(draft)

  # Assert
  assert paid is { ...draft, status: Paid }

  # Act
  let shipped = ship(paid, "TRACK-42")

  # Assert
  assert shipped is { ...paid, status: Shipped, tracking: "TRACK-42" }

  # Act
  let delivered = deliver(shipped)

  # Assert
  assert delivered is { ...shipped, status: Delivered }
```

### critical-scenario-has-an-end-to-end-spec · SHOULD

Each critical scenario of `PROJECT.md` has one end-to-end spec. Its cases walk the scenario's steps through the built program, the way its users reach it.

#### Why

A critical scenario proven only in its parts breaks where the parts meet — the test pyramid.

#### Examples

```text title="Scenarios"
PROJECT.md: critical scenarios       tests/e2e/
1. A customer checks out a cart  →   check-out-a-cart.e2e.test
2. A clerk refunds an order      →   refund-an-order.e2e.test
3. A customer tracks a parcel    →   track-a-parcel.e2e.test
```

### end-to-end-spec-holds-no-variant · SHOULD

Every end-to-end spec walks its scenario only, never a variant a unit or an integration spec proves.

#### Why

A variant proven end to end costs the slowest run for a bug a faster spec already catches — the test pyramid.

#### Examples

```pseudo title="Avoid"
# tests/e2e/check-out-a-cart.e2e.test
test "should place the order when the customer pays"
  ...
test "should refuse the card when it has expired"
  ...
test "should refuse the coupon when it ran out"
  ...
```

```pseudo title="Prefer"
# tests/e2e/check-out-a-cart.e2e.test
test "should place the order when the customer pays"
  # Arrange
  let browser = openShop()
  # Act
  browser.addToCart("mug")

  # Assert
  assert browser.cartCount() is 1

  # Act
  browser.checkOut(testCard)

  # Assert
  assert browser.page() is OrderConfirmation
```

## Where test code lives

### spec-folder-holds-only-test-files · MUST

Every folder of specs holds only test code.

#### Why

Production code kept among the specs is held to the rules of test code by every tool that finds tests by their folder.

#### Examples

```text title="Avoid"
orders/__tests__/
├── cancel-order.use-case.test
├── orders.fixtures
└── order-mapping    production code the use case imports
```

```text title="Prefer"
orders/__tests__/
├── cancel-order.use-case.test
├── order-repository.fake
├── order-repository.suite
├── orders.fixtures
└── invoice.golden.xml
```

### spec-found-from-its-units-path · SHOULD

Every unit's specs are found from the unit's path. They sit in a folder of specs beside the unit or, where the language's test runner expects one, in a tree of specs that mirrors the source, under the names package-part-sits-in-its-named-folder gives.

#### Why

A spec placed apart from its unit's path is left behind when the unit moves, and outlives it when the unit is deleted.

#### Examples

```text title="Avoid"
src/
├── features/orders/…/pay-order/
│   └── pay-order.use-case
└── specs/
    └── unit/
        └── payments.test
```

```text title="Prefer"
src/
└── features/orders/…/pay-order/
    ├── pay-order.use-case
    └── __tests__/
        └── pay-order.use-case.test
```

### test-code-never-reached-from-production · MUST

All production code imports only production code, never test code. Exempt: a further entry, as the dependencies chapter defines one, that a package offers for its consumers' tests, which re-exports by name the fakes and fixtures they test with and which no other production code imports.

#### Why

A fake or a fixture in production code ships test behaviour to users, while one offered through a published entry of its own reaches only the tests that import it.

#### Examples

```pseudo title="Avoid"
# src/root/payments
import createPaymentFake from
  "../__tests__/payment.fake"

let payments = createPaymentFake()
let payOrder = createPayOrder({ payments })
```

```pseudo title="Prefer"
# src/root/payments
import createCardPaymentAdapter from
  "../infrastructure/card-gateway"

let payments = createCardPaymentAdapter({ client: cardGatewayClient })
let payOrder = createPayOrder({ payments })
```

## Practice

### test-ships-with-its-behaviour · MUST

Every test ships in the same change as the behaviour it proves. A change of behaviour updates its spec in that change. Exempt: a bug fix, whose case bug-fix-ships-with-a-reproducing-case governs.

#### Why

A behaviour shipped without its test is a behaviour nobody tests later.

#### Examples

```text title="Avoid"
#81  Refund part of an order
  M refund-order.use-case
#84  Test partial refunds
  M refund-order.use-case.test
```

```text title="Prefer"
#81  Refund part of an order
  M refund-order.use-case
  M refund-order.use-case.test
```

### test-seen-failing · SHOULD

Every case has been seen failing for the right reason. It is written before the code, or after it with the code broken for a moment.

#### Why

A case never seen failing may pass whatever the code does.

#### Examples

```text title="Avoid"
1. fix the rounding of total
2. add "should round half to
   even"
   PASS
```

```text title="Prefer"
1. add "should round half to
   even"
   FAIL  expected 2.34, got 2.35
2. fix the rounding of total
   PASS
```

### bug-fix-ships-with-a-reproducing-case · SHOULD

Every bug fix ships with a case that reproduces the bug.

#### Why

A bug fixed without its own case may not be fixed, and can come back unseen.

#### Examples

```text title="Avoid"
fix: Round the tax of each invoice line

M invoices/domain/invoice-total
```

```text title="Prefer"
fix: Round the tax of each invoice line

M invoices/domain/invoice-total
M invoices/domain/__tests__/invoice-total.test
  + should round the tax per line when the invoice has many lines
```

### flaky-test-fixed-never-retried · SHOULD

Every flaky case is fixed or deleted, never retried. A case that passes and fails on the same code is fixed in the next change, or deleted with a record of the race it found; no retry or rerun hides it.

#### Why

A retried case hides the race it found, and specs that fail at random teach everyone to rerun instead of reading.

#### Examples

```text title="Avoid"
"should show the receipt"
  attempt 1  FAIL
  attempt 2  PASS  (retries: 3)
```

```text title="Prefer"
"should show the receipt"
  fails once in 40 runs: the
  receipt renders before the
  payment settles
next change: the case waits for
  the payment to settle
```

## The sandbox

### test-runs-in-a-sandbox · MUST

Every test reaches nothing outside its sandbox. Exempt: the snapshots and golden files that a run told to update them writes.

#### Why

A test that reaches the world is slow, flaky and can do real harm (a write to a real store, a call that spends a vendor's quota) and answers differently from one run to the next.

#### Examples

```pseudo title="Avoid"
test "should store the invoice PDF"
  # Arrange
  let folder = "/Users/ann/invoices"
  let store = new PdfStoreAdapter(folder)
  # Act
  store.save(createInvoice({ id: "inv-7" }))
  # Assert
  assert listFiles(folder)
    is ["inv-7.pdf"]
```

```pseudo title="Prefer"
test "should store the invoice PDF"
  # Arrange
  let folder = createTempFolder()
  let store = new PdfStoreAdapter(folder)
  # Act
  store.save(createInvoice({ id: "inv-7" }))
  # Assert
  assert listFiles(folder)
    is ["inv-7.pdf"]
```

### unit-spec-refuses-the-network · MUST

Every unit spec refuses the network. Once for all unit specs, the test runner refuses every connection a unit spec opens, by replacing each call that opens one with one that fails or by running the specs where no network is reachable.

#### Why

A unit spec that reaches a server by mistake passes while the server answers and fails at random later, far from the mistake.

#### Examples

```pseudo title="Setup"
# src/__tests__/setup
for each connect in [openHttpConnection, openSocket, connectDatabase]
  replace connect with function(target)
    throw new NetworkRefusedError({ target })
```

### unit-case-stays-in-process · SHOULD

Every case of a unit spec stays in its process's memory, and so finishes in milliseconds. It runs with no output and no real clock and reads no file, and a case that needs more belongs in an integration spec. Exempt: its golden files and snapshots, which it reads.

#### Why

Slow unit specs stop being run on every change, and the bugs they would catch wait for a later, slower run.

#### Examples

```pseudo title="Avoid"
test "should total the open invoices"
  # Arrange
  let invoices = readJson(
    "fixtures/invoices.json")
  let today = now()
  # Act
  let total = openTotal(invoices, today)

  # Assert
  print(total)
  assert total is 340
```

```pseudo title="Prefer"
test "should total the open invoices"
  # Arrange
  let invoices = [createInvoice()]
  let today = date("2026-03-01")
  # Act
  let total = openTotal(invoices, today)

  # Assert
  assert total is 340
```

### case-independent-of-order · SHOULD

Every case passes alone and in any order. No state survives from one case or one file to the next.

#### Why

A case that leans on another fails alone when someone runs it to find a bug.

#### Examples

```pseudo title="Avoid"
let carts = new CartRepositoryFake()

test "should add a mug to the cart"
  # ...
  addProduct({ cartId: "cart-1", product: createMug() }, carts)

test "should total the cart at 12"
  # Arrange: the mug added above
  # Act
  let total = carts.find("cart-1").total

  # Assert
  assert total is 12
```

```pseudo title="Prefer"
test "should total the cart at 12"
  # Arrange
  let cart = createCart({ products: [createMug()] })
  # Act
  let total = Cart.total(cart)

  # Assert
  assert total is 12
```

### case-order-shuffled · SHOULD

Every spec's cases run in an order the test runner shuffles. Exempt: a run of the mutation tool, which orders the cases itself.

#### Why

A hidden dependence between cases stays hidden in a fixed order.

#### Examples

```text title="Avoid"
test runner settings
  order: as declared
```

```text title="Prefer"
test runner settings
  order: random
```

### shuffle-seed-reported · SHOULD

Every shuffled run of the specs reports the seed that replays its order.

#### Why

An order that failed cannot be replayed without its seed, so the dependence it showed is lost.

#### Examples

```text title="Avoid"
$ run the unit specs
212 passed, 1 failed (random order)
```

```text title="Prefer"
$ run the unit specs
random order, seed 48213
212 passed, 1 failed
replay: run the unit specs with seed 48213
```

### test-never-sleeps-a-fixed-time · SHOULD

Every test waits for a condition or advances a fake clock, never a fixed delay.

#### Why

A fixed delay is too short on a slow machine, where the test then fails at random, and wasted on a fast one.

#### Examples

```pseudo title="Avoid"
test "should expire an idle cart"
  # Arrange
  let clock = new SystemClockAdapter()
  let cart = createCart({ idleLimit: seconds(2) })

  sleep(seconds(3))

  # Act
  let hasExpired = isExpired(cart, clock)

  # Assert
  assert hasExpired is true
```

```pseudo title="Prefer"
test "should expire an idle cart"
  # Arrange
  let clock = new ClockFake("10:00")
  let cart = createCart({ idleLimit: minutes(30) })

  clock.advance(minutes(31))

  # Act
  let hasExpired = isExpired(cart, clock)

  # Assert
  assert hasExpired is true
```

## Fakes and engines

### contract-has-one-fake · SHOULD

Each faked contract has one fake, shared by every spec that needs it.

#### Why

A fake per spec drifts from the real implementation in as many ways as there are specs.

#### Examples

```pseudo title="Avoid"
# __tests__/pay-order.use-case.test
function fakePayment()
  return { charge: approve }

# __tests__/refund-order.use-case.test
function fakePayment()
  return { charge: approve,
    refund: approve }
```

```pseudo title="Prefer"
# __tests__/payment.fake
class PaymentFake implements PaymentPort
  charges: List<Charge>
  refunds: List<Refund>

# __tests__/pay-order.use-case.test
let payments = new PaymentFake()

# __tests__/refund-order.use-case.test
let payments = new PaymentFake()
```

### contract-has-one-suite · SHOULD

Each faked contract has one contract suite. Its fake passes it, as does each real implementation whose engine runs in the sandbox.

#### Why

A fake no suite holds to the contract behaves unlike the real one, so every test that uses it proves the wrong thing — contract testing.

#### Examples

```pseudo title="Avoid"
# __tests__/payment.fake.test
test "should refund the charge it took"
  ...

# infrastructure/card-gateway/__tests__/payment.adapter.integration.test
test "should refund a captured charge"
  ...
```

```pseudo title="Prefer"
# __tests__/payment.suite
function paymentSuite(createPayment)
  test "should refund the charge it took"
    ...

# __tests__/payment.fake.test
paymentSuite(createPaymentFake)

# infrastructure/card-gateway/__tests__/payment.adapter.integration.test
paymentSuite(createCardPaymentAdapter)
```

### effect-faked-never-mocked · SHOULD

Every spec replaces an effect only by the fake of its contract, never by mocking, patching or spying on a module. Exempt: beneath the code over an outside system whose engine the sandbox cannot run, a transport that serves captured responses, and beneath an implementation over a device or a system service, such as a camera, a keystore or an app store's billing, a fake of the platform's own API, held to that API like any other fake.

#### Why

A mocked module replaces the code the spec claims to test and breaks when the module moves, and an engine the sandbox can run proves the code over it better than any capture of its answers.

#### Examples

```pseudo title="Avoid"
test "should email the receipt"
  # Arrange
  let orderRepository = new OrderRepositoryFake([createOrder()])

  mockModule("../infrastructure/smtp")

  let payOrder = createPayOrder({ orderRepository })
  let context = createContext()

  # Act
  payOrder({ orderId: createOrder().id }, context)
  # Assert
  assert smtp.send.calls
    is [createReceipt()]
```

```pseudo title="Prefer"
test "should email the receipt"
  # Arrange
  let orderRepository = new OrderRepositoryFake([createOrder()])
  let mailer = new MailerFake()
  let payOrder = createPayOrder({ orderRepository, mailer })
  let context = createContext()

  # Act
  payOrder({ orderId: createOrder().id }, context)
  # Assert
  assert mailer.outbox
    is [createReceipt()]
```

### integration-spec-runs-the-real-engine · SHOULD

Wherever its engine can run in the sandbox, every implementation over an outside system is proven against it.

#### Why

A fake proves only the code that relies on the contract, so an implementation never run on its engine ships its mismatches with that engine unseen.

#### Examples

```pseudo title="Spec"
# orders/infrastructure/sql/__tests__/sql-order-repository.adapter.integration.test
let database = startSandboxDatabase()

function createRepository()
  return createSqlOrderRepositoryAdapter({ driver: database.driver })

orderRepositorySuite(createRepository)
```

### mapped-failure-proven-against-the-real-engine · SHOULD

Where the sandbox can run its engine, every failure an implementation over an outside system maps is proven against that engine.

#### Why

A mapping proven only on a fake maps the failure its author expected, and ships its mismatch with the failure the engine really gives.

#### Examples

```pseudo title="Avoid"
test "should fail with OrderAlreadyExistsError when the id is taken"
  # Arrange
  let driver = createDriverStub({ insert: fails(DuplicateKey) })
  let orders = createSqlOrderRepositoryAdapter({ driver })
  # Act
  let failure = thrownBy(function() orders.add(createOrder()))

  # Assert
  assert failure is OrderAlreadyExistsError({ orderId: "order-7" })
```

```pseudo title="Prefer"
test "should fail with OrderAlreadyExistsError when the id is taken"
  # Arrange
  let orders = createSqlOrderRepositoryAdapter({ driver: sandboxDatabase.driver })
  orders.add(createOrder())
  # Act
  let failure = thrownBy(function() orders.add(createOrder()))

  # Assert
  assert failure is OrderAlreadyExistsError({ orderId: "order-7" })
```

## The gates

### program-start-proven-by-a-boot-spec · MUST

Every program with an entry file has a boot spec that sees it answer.

#### Why

The entry files and the assembly are left out of the logic under coverage, so without a boot spec a program wired wrong passes every check and fails in production.

#### Examples

```pseudo title="Avoid"
test "should answer when started"
  # Arrange
  let server = createServer({
    placeOrder: createPlaceOrder(fakes),
  })
  # Act
  let answer = server.get("/health")

  # Assert
  assert answer.status is 200
```

```pseudo title="Prefer"
test "should answer when started"
  # Arrange
  let program = run({
    env: testEnvironment,
    outside: createOutsideFakes(),
  })
  # Act
  let answer = program.get("/health")

  # Assert
  assert answer.status is 200
```

### boot-spec-run-as-an-integration-spec · SHOULD

Every boot spec is kept and run as an integration spec is, though no engine in it is real.

#### Why

A boot spec kept among the unit specs runs where the network is barred and every case stays in process, so it fails there or is skipped, and the start it proves goes unproven.

#### Examples

```text title="Avoid"
src/
├── main
└── __tests__/
    └── main.test
```

```text title="Prefer"
src/
├── main
└── __tests__/
    └── main.integration.test
```

### logic-fully-covered · MUST

All logic under coverage is covered in full by the specs of its boundaries. Coverage is every line and every function, and every branch where the test runner measures them, counted over the unit specs together with the integration specs of an implementation over an outside system whose engine runs in the sandbox; end-to-end specs count toward no coverage. Exempt: code a project leaves out of coverage explicitly, by name in the coverage tool's configuration or by a mark in the code, each with its reason.

#### Why

A line no spec reaches is a missing case, where a bug waits unseen, or dead code, and code over a real engine that only its unit specs could cover is reached through a driver faked for its lines, which passes the gate while its mismatches with the engine ship.

#### Examples

```text title="Avoid"
coverage   lines 91%
           branches 84%
threshold  80%: passed
```

```text title="Prefer"
coverage   lines 100%
           functions 100%
           branches 100%
left out   the entry files, root/
           and *.gen, which decide
           nothing
threshold  100%: passed
```

### every-mutant-killed · MUST

Where a mutation tool exists for the language, every mutant of the logic under coverage a change touches is killed. The specs the coverage gate counts kill it, and the logic a change touches is its changed lines and its new files. Exempt: a mutant no behaviour can tell apart, and one in code no caller relies on, such as a log call or text only a person reads, each left out by the tool's configuration or marked in the code with its reason.

#### Why

Specs that let mutants live are weaker than their coverage says, and a case written only to kill a mutant no caller would notice proves no plausible bug and binds the spec to the code's wording — mutation testing.

#### Examples

```pseudo title="Avoid"
# the mutant of `total >= 100` into `total > 100` survives
for each { total } in
  | 150 |

  test "should give a discount of 10 when the total is {total}"
    # Act
    let discount = discountFor(total)

    # Assert
    assert discount is 10
```

```pseudo title="Prefer"
for each { total } in
  | 100 |
  | 150 |

  test "should give a discount of 10 when the total is {total}"
    # Act
    let discount = discountFor(total)

    # Assert
    assert discount is 10
```
