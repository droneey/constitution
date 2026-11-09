# Specs

> Governs the specs of screens and components: what they prove, how they find an element, where a screenshot belongs, and the showcase of component primitives.

## General

### screen-spec-proves-what-a-person-does → spec-proves-one-boundary · SHOULD

Every screen's spec proves what a person does with the screen: each data state, each interaction that changes something, each notice or error the person is shown and each navigation.

#### Why

A screen spec that misses a state, an interaction, a notice or a navigation passes while that part of the person's experience breaks.

#### Examples

```pseudo title="Avoid"
describe "orders screen"
  test "should show the orders when they load"
```

```pseudo title="Prefer"
describe "orders screen"
  test "should show the orders when they load"
  test "should offer to create an order when there are none"
  test "should show the failure and retry when the load fails"
  test "should cancel an order when the person confirms"
  test "should tell the person when a cancel is refused"
  test "should open the order when its row is pressed"
```

### component-spec-proves-its-interaction → spec-proves-one-boundary · SHOULD

Every reusable component's spec proves how a person uses it: the component variants that change its behaviour or meaning, its keyboard use, its focus, and its accessible name, role and state.

#### Why

A component used on many screens breaks all of them at once, and its spec is where that is caught.

#### Examples

```pseudo title="Avoid"
describe "Switch"
  test "should render"
  test "should match its snapshot"
```

```pseudo title="Prefer"
describe "Switch"
  test "should turn on when pressed"
  test "should turn on when Space is pressed while it has focus"
  test "should show its focus when reached by Tab"
  test "should be named by its label"
  test "should expose the switch role and its checked state"
  test "should stay off when disabled"
```

### element-found-by-role-label-or-text → case-asserts-what-a-caller-observes · SHOULD

Every spec finds an element by its role, its label or its text, never by a class or an internal state. Exempt: an element no person perceives, such as one hidden from assistive technology or a framework's own element, which is found by an attribute the code that renders it sets for the spec.

#### Why

A spec that finds an element by a class or internal state breaks when the markup changes while the behaviour holds, and passes when the element loses the role or name a person finds it by.

#### Examples

```pseudo title="Avoid"
test "should place the order when the person confirms"
  # Arrange
  let screen = render(CheckoutScreen(cart: createCart()))

  # Act
  call screen.press(screen.findBySelector(".checkout-submit"))

  # Assert
  assert placedOrders has 1 item
```

```pseudo title="Prefer"
test "should place the order when the person confirms"
  # Arrange
  let screen = render(CheckoutScreen(cart: createCart()))

  # Act
  call screen.press(screen.findByRole(Button, { name: messages.checkout.placeOrder }))

  # Assert
  assert placedOrders has 1 item
```

### locator-text-taken-from-its-message → case-pins-meaning-never-wording · MUST

Wherever the program keeps its texts apart from its code, every spec takes the texts it finds elements by from that source. None is typed into the spec.

#### Why

A spec that types the wording it looks for fails on every rewording while the screen still works, so one change of text rewrites the specs.

#### Examples

```pseudo title="Avoid"
let placeOrder = screen.findByRole(Button, { name: "Place order" })
```

```pseudo title="Prefer"
let placeOrder = screen.findByRole(Button, { name: messages.checkout.placeOrder })
```

### framework-selector-proven-by-one-spec · MUST

Every selector the program configures a framework with is proven by one spec, which reads it through the same constant.

#### Why

A selector handed to a framework is a contract with markup the program does not render, so only a spec of that selector catches markup that no longer matches it.

#### Examples

```pseudo title="Avoid"
# presentation/screens/checkout-screen/checkout-screen
paymentWidget.mount({ into: "#payment-frame" })  # no spec reads it
```

```pseudo title="Prefer"
# presentation/screens/checkout-screen/constants/selectors.constants
let PAYMENT_FRAME_SELECTOR = "#payment-frame"

# presentation/screens/checkout-screen/checkout-screen
paymentWidget.mount({ into: PAYMENT_FRAME_SELECTOR })

# presentation/screens/checkout-screen/__tests__/checkout-screen.test
test "should render the element the payment widget mounts into"
  # Act
  let screen = render(CheckoutScreen(cart: createCart()))

  # Assert
  assert screen.findBySelector(PAYMENT_FRAME_SELECTOR) is not <absent>
```

### rendered-behaviour-proven-on-the-platform · SHOULD

Every behaviour that depends on layout, visibility or real focus is proven on the platform's own rendering engine. Its spec is an end-to-end spec or a component spec that engine runs, never one that runs only in a simulation of it.

#### Why

A simulated screen computes no layout and fakes focus, so a spec there passes while the element is hidden, covered or unreachable.

#### Examples

```pseudo title="Avoid"
# presentation/screens/checkout-screen/__tests__/checkout-screen.test, in a simulated document
test "should keep Place order in view when the cart is long"
  # Act
  let screen = render(CheckoutScreen(cart: createCart({ lines: 40 })))

  # Assert
  assert screen.findByRole(Button, { name: messages.checkout.placeOrder }).isVisible
```

```pseudo title="Prefer"
# presentation/screens/checkout-screen/__tests__/checkout-screen.test, in the platform's own engine
test "should keep Place order in view when the cart is long"
  # Arrange
  let screen = render(CheckoutScreen(cart: createCart({ lines: 40 })))

  # Act
  call screen.scrollToEnd()

  # Assert
  assert screen.findByRole(Button, { name: messages.checkout.placeOrder }).isInViewport
```

### screenshots-only-where-look-is-contract → snapshot-readable-by-eye · SHOULD

Appearance is compared by screenshot only where the look is the contract, such as a showcase of component primitives.

#### Why

Screenshots elsewhere fail on every harmless change of style and are approved without reading.

#### Examples

```pseudo title="Avoid"
# presentation/screens/orders-screen/__tests__/orders-screen.test
test "should show the orders when they load"
  # Act
  let screen = render(OrdersScreen(orders: createOrders(3)))

  # Assert
  assert screenshot(screen) matches "orders-screen.png"
```

```pseudo title="Prefer"
# presentation/screens/orders-screen/__tests__/orders-screen.test
test "should show the orders when they load"
  # Act
  let screen = render(OrdersScreen(orders: createOrders(3)))

  # Assert
  assert screen.findAllByRole(Row) has 3 items

# libs/ui/components/button/__tests__/button.test
test "should look as designed in every variant, state and mode"
  # Act
  let image = screenshot(showcase("Button"))

  # Assert
  assert image matches "button-showcase.png"
```

### primitive-shown-whole-in-one-place · SHOULD

Every component primitive is shown in every component variant, state and theme mode, in one place people and screenshot specs both see.

#### Why

A component variant nobody renders breaks unseen, and a component primitive shown piecemeal, or nowhere, leaves a review and a screenshot nothing whole to compare.

#### Examples

```pseudo title="Avoid"
showcase "Button"
  Button(label: "Save", variant: Primary)
```

```pseudo title="Prefer"
showcase "Button"
  for mode in [Light, Dark]
    for variant in [Primary, Secondary, Danger]
      for state in [Idle, Hovered, Focused, Pressed, Disabled, Busy]
        Button(label: "Save", variant: variant, forcedState: state, mode: mode)
```
