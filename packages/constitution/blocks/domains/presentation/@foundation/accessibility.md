# Accessibility

> Governs what every person can do with the interface whatever their sight, hearing, movement or attention, and how the specs prove it.

## Vocabulary

A **toast** is a notice that appears over the screen and goes away.

A **layout unit** is the unit a platform lays out its screens in, one size whatever the density of the screen's pixels, such as the reference pixel a browser lays out a page in, or an app's point or density-independent pixel.

## Conformance

### wcag-aa-conformance · MUST

Every user interface meets WCAG 2.2 at level AA. Exempt: the criteria that rules of their own hold whole, which are Link Purpose (In Context), Use of Color, Keyboard, Label in Name, Focus Order, Focus Visible, Focus Not Obscured (Minimum), Target Size (Minimum), Dragging Movements, Content on Hover or Focus, Orientation, Timing Adjustable, Contrast (Minimum), Non-text Contrast, Status Messages, Consistent Identification, Consistent Help, Error Suggestion, Language of Page, Language of Parts, Identify Input Purpose, Redundant Entry and Accessible Authentication (Minimum).

#### Why

An interface below that bar shuts out the people who rely on assistive technology, and breaks the accessibility laws that cite it, the European Accessibility Act through EN 301 549 among them — WCAG 2.2, level AA.

#### Examples

```pseudo title="Avoid"
function SalesChart({ sales })
  return Image({ source: sales.chartImage })   # no text for what the chart shows
```

```pseudo title="Prefer"
function SalesChart({ sales })
  return Image({
    source: sales.chartImage,
    description: "Sales rose " + sales.growth + " in " + sales.month
  })
```

### accessibility-statement-published · MUST

Where the law of its region asks for one, every product published to the public states its accessibility. The statement says what the product conforms to, its known gaps and how to report a barrier.

#### Why

Without it a user cannot tell what to expect or where to report a barrier, and a product the EU's Web Accessibility Directive or European Accessibility Act covers breaks the law that asks for it.

#### Examples

```text title="Avoid"
Accessibility
We care about accessibility and
work hard to make our shop usable
by everyone.
```

```text title="Prefer"
Accessibility statement
Conforms partly to WCAG 2.2 AA,
  as EN 301 549 asks.
Known gaps:
  - the order history chart has no
    table beside it; fixed by 2027-03
Report a barrier:
  accessibility@shop.example,
  answered within 5 working days
Reviewed 2026-10-01
```

## Semantics and names

### native-semantics-first · MUST

Every control and structure is built on the platform's native semantic element where one exists for it. A role or a state is added to another element only where no native element exists, and a generic container never takes a press handler. Exempt: a complex pattern built on the active library of accessible component primitives.

#### Why

A control built on a generic element lacks the role and the keyboard a native one brings, so a keyboard or screen-reader user meets a control that is not there for them — the first rule of ARIA use.

#### Examples

```pseudo title="Avoid"
function PlaceOrder({ onPlace })
  return Container({ onPress: onPlace }, Text("Place order"))   # no role, no keyboard
```

```pseudo title="Prefer"
function PlaceOrder({ onPlace })
  return Button({ onPress: onPlace }, "Place order")
```

### added-role-true-to-its-element · MUST

Every role and state added to an element is true of it: the role is the one the element plays, and each state the one it is in.

#### Why

A wrong role announces a control that is not there, and a stale state, such as a menu announced closed while it is open, misleads everyone who hears it — WCAG 2.2, Name, Role, Value.

#### Examples

```pseudo title="Avoid"
function AccountMenu()
  let isOpen = state(false)

  return [
    Button({
      hasPopup: Menu,
      isExpanded: false,   # announced closed while the menu is open
      onPress: () => isOpen.set(not isOpen.value)
    }, "Account"),
    isOpen.value and AccountMenuItems()
  ]
```

```pseudo title="Prefer"
function AccountMenu()
  let isOpen = state(false)

  return [
    Button({
      hasPopup: Menu,
      isExpanded: isOpen.value,
      onPress: () => isOpen.set(not isOpen.value)
    }, "Account"),
    isOpen.value and AccountMenuItems()
  ]
```

### every-control-has-an-accessible-name · MUST

Every control and field has an accessible name, an icon-only control included.

#### Why

A screen reader announces a control by its name, so a control without one is announced only as "button" — WCAG 2.2, Name, Role, Value.

#### Examples

```pseudo title="Avoid"
function RemoveLine({ line, onRemove })
  return IconButton({
    icon: TrashIcon,
    onPress: () => onRemove(line.id)
  })   # announced only as "button"
```

```pseudo title="Prefer"
function RemoveLine({ line, onRemove })
  return IconButton({
    icon: TrashIcon,
    label: "Remove " + line.productName,
    onPress: () => onRemove(line.id)
  })
```

### visible-label-in-accessible-name · MUST

Every control's accessible name contains its visible label, word for word.

#### Why

A person who speaks to the device says the words they see, and a name that differs from the label leaves their command unmatched — WCAG 2.2, Label in Name.

#### Examples

```pseudo title="Avoid"
Button({
  accessibleName: "Submit the form",   # "Place order" spoken matches nothing
  onPress: placeOrder
}, "Place order")
```

```pseudo title="Prefer"
Button({
  accessibleName: "Place order of " + cart.itemCount + " items",
  onPress: placeOrder
}, "Place order")
```

## Operation

### control-operable-by-every-input · MUST

Every interactive element works with every input the platform offers: the keyboard with no timing asked of a keystroke, a pointer, touch and assistive technology. Exempt: a function whose input depends on the path of the pointer's movement, which WCAG 2.2 exempts under Keyboard, such as a freehand stroke.

#### Why

A mouse is not the only way people use an interface, and one control that needs it locks out everyone who uses another input — WCAG 2.2, Keyboard.

#### Examples

```pseudo title="Avoid"
function RatingStar({ value, isSelected, onSelect })
  return Icon({
    name: isSelected ? StarFilledIcon : StarIcon,
    onPointerDown: () => onSelect(value)   # no keyboard, no assistive action
  })
```

```pseudo title="Prefer"
function RatingStar({ value, isSelected, onSelect })
  return ToggleButton({
    label: value + " stars",
    isPressed: isSelected,
    onPress: () => onSelect(value)
  }, Icon({ name: isSelected ? StarFilledIcon : StarIcon }))
```

### focus-layer-always-leavable · MUST

Every layer that holds focus is left by Escape or by its own close control.

#### Why

A person whose focus is caught in a layer with no way out can use nothing else on the screen, and Escape is the way out such a person tries first — WCAG 2.2, No Keyboard Trap.

#### Examples

```pseudo title="Avoid"
Dialog({ isOpen, isDismissible: false }, [   # Escape does nothing, no close control
  DialogTitle("Add a coupon"),
  CouponForm({ onApply: applyCoupon })
])
```

```pseudo title="Prefer"
Dialog({ isOpen, onClose: closeCoupon }, [
  DialogTitle("Add a coupon"),
  CouponForm({ onApply: applyCoupon }),
  DialogClose("Cancel")
])
```

### complex-pattern-follows-keyboard-conventions · MUST

Every complex pattern follows the platform's keyboard and focus conventions. Such conventions include focus that moves into a modal layer, stays in it while it is open and returns to what opened it; a layer that is not modal letting focus leave or closing when it does; and a tooltip and a combobox's list that never take focus.

#### Why

A pattern that breaks these conventions leaves a keyboard or screen-reader user unable to enter, leave or move through a dialog or a menu, however carefully the program composes it.

#### Examples

```pseudo title="Avoid"
Dialog({
  isModal: true,
  isOpen,
  onClose: closeAddress,
  shouldReturnFocus: false   # focus lands at the top of the page on close
}, AddressForm({ onSave: saveAddress }))
```

```pseudo title="Prefer"
Dialog({
  isModal: true,
  isOpen,
  onClose: closeAddress
}, AddressForm({ onSave: saveAddress }))
```

### focus-order-follows-the-visual-order · MUST

Every screen moves focus through its content in the order the content is seen.

#### Why

Focus that jumps around the screen cannot be followed, so a keyboard user loses their place — WCAG 2.2, Focus Order.

#### Examples

```pseudo title="Avoid"
Row([
  Button({ focusOrder: 2, onPress: cancelCheckout }, "Cancel"),
  Button({ focusOrder: 1, onPress: placeOrder }, "Place order")   # focus goes right, then back left
])
```

```pseudo title="Prefer"
Row([
  Button({ onPress: cancelCheckout }, "Cancel"),
  Button({ onPress: placeOrder }, "Place order")
])
```

### focus-always-visible · MUST

Every element focused from the keyboard shows that it has focus. No indicator of keyboard focus is removed without a replacement.

#### Why

A keyboard user who cannot see focus does not know where they are — WCAG 2.2, Focus Visible.

#### Examples

```pseudo title="Avoid"
buttonStyle = {
  background: tokens.color.action,
  focusRing: none   # nothing replaces the platform's ring
}
```

```pseudo title="Prefer"
buttonStyle = {
  background: tokens.color.action,
  focusRing: {
    width: tokens.size.focusRing,
    offset: tokens.space.focusRing,
    color: tokens.color.focus
  }
}
```

### focus-never-obscured · MUST

No focused element is entirely hidden by content the screen lays over it, such as a sticky header or a banner.

#### Why

A keyboard user whose focus sits under content laid over it neither knows where they are nor sees what they are about to operate — WCAG 2.2, Focus Not Obscured (Minimum).

#### Examples

```pseudo title="Avoid"
Page([
  Header({ position: Sticky, height: tokens.size.header }),
  CheckoutForm({ onSubmit: placeOrder })   # a field tabbed to scrolls under the header
])
```

```pseudo title="Prefer"
Page({ scrollPaddingTop: tokens.size.header }, [
  Header({ position: Sticky, height: tokens.size.header }),
  CheckoutForm({ onSubmit: placeOrder })
])
```

### target-meets-the-minimum-size · MUST

Every pointer target is at least 24 × 24 layout units, its hit area counted. Exempt: a target WCAG 2.2 exempts under Target Size (Minimum), such as a link inside a sentence or an undersized target spaced as that criterion allows.

#### Why

A target smaller than a fingertip or a tremor allows is missed and the wrong action runs, and on a platform other than the web the measure is that platform's density-independent unit — WCAG 2.2, Target Size (Minimum), and WCAG2ICT.

#### Examples

```pseudo title="Avoid"
IconButton({
  icon: CloseIcon,
  label: "Remove " + line.productName,
  size: tokens.size.icon.small,   # hit area 16 × 16
  onPress: () => onRemove(line.id)
})
```

```pseudo title="Prefer"
# design/tokens
size.icon.small = 16
size.target.minimum = 24

# cart/cart-line
IconButton({
  icon: CloseIcon,
  label: "Remove " + line.productName,
  iconSize: tokens.size.icon.small,
  hitArea: tokens.size.target.minimum,
  onPress: () => onRemove(line.id)
})
```

### touch-target-at-least-40-layout-units · MUST

Wherever the primary pointer is touch, every pointer target is at least 40 × 40 layout units, its hit area counted. Exempt: a target WCAG 2.2 exempts under Target Size (Minimum) for a reason other than its spacing, such as a link inside a sentence or a control the user agent draws.

#### Why

A finger covers far more than a cursor, so a target that a mouse hits at 24 is missed by a fingertip often enough to run the wrong action, and 40 is the project's floor: above the smallest control the phone platforms allow, short of the 44 to 48 they give as the default.

#### Examples

```pseudo title="Avoid"
# apps/mobile/cart/cart-line
IconButton({
  icon: CloseIcon,
  label: "Remove " + line.productName,
  hitArea: tokens.size.target.minimum,   # 24, a mouse's floor, under a finger
  onPress: () => onRemove(line.id)
})
```

```pseudo title="Prefer"
# design/tokens
size.target.touch = 48

# apps/mobile/cart/cart-line
IconButton({
  icon: CloseIcon,
  label: "Remove " + line.productName,
  hitArea: tokens.size.target.touch,
  onPress: () => onRemove(line.id)
})
```

### touch-target-at-least-48-layout-units · SHOULD

Wherever the primary pointer is touch, every pointer target is at least 48 × 48 layout units, its hit area counted. Exempt: a target WCAG 2.2 exempts under Target Size (Minimum) for a reason other than its spacing, such as a link inside a sentence or a control the user agent draws.

#### Why

A target near the 40 floor is still missed by a tremor or a thumb stretched across the screen, while 48, about 9 mm, clears every phone platform's default and WCAG's level AAA — WCAG 2.2, Target Size (Enhanced).

#### Examples

```pseudo title="Avoid"
# design/tokens
size.target.touch = 40   # the floor, not the aim
```

```pseudo title="Prefer"
# design/tokens
size.target.touch = 48
```

### drag-has-a-single-pointer-alternative · MUST

Every drag has a single-pointer alternative: an action done by dragging can also be done with a single pointer, without dragging. Exempt: a drag WCAG 2.2 exempts under Dragging Movements, such as a freehand stroke.

#### Why

A person who cannot hold a pointer down while moving it cannot do an action offered only by dragging — WCAG 2.2, Dragging Movements.

#### Examples

```pseudo title="Avoid"
function WishlistItem({ item, onMove })
  return DragHandle({
    label: "Reorder " + item.name,
    onDrop: (index) => onMove(item.id, index)   # dragging is the only way
  }, ItemCard(item))
```

```pseudo title="Prefer"
function WishlistItem({ item, index, onMove })
  return Row([
    DragHandle({
      label: "Reorder " + item.name,
      onDrop: (to) => onMove(item.id, to)
    }, ItemCard(item)),
    Menu({ label: "Move " + item.name }, [
      MenuItem({ onPress: () => onMove(item.id, index - 1) }, "Move up"),
      MenuItem({ onPress: () => onMove(item.id, index + 1) }, "Move down")
    ])
  ])
```

### hover-content-reached-without-hover · MUST

All content that hover reveals is also reached by focus and by a tap or a long press. No action appears only on hover.

#### Why

Touch screens have no hover and keyboard users never produce one, so content or an action only hover reveals is out of their reach.

#### Examples

```pseudo title="Avoid"
function OrderRow({ order, isHovered, onCancel })
  return Row([
    Text(order.number),
    isHovered and Button({ onPress: () => onCancel(order.id) }, "Cancel order")   # touch and keyboard never see it
  ])
```

```pseudo title="Prefer"
function OrderRow({ order, onCancel })
  return Row([
    Text(order.number),
    Menu({ label: "Actions for order " + order.number }, [
      MenuItem({ onPress: () => onCancel(order.id) }, "Cancel order")
    ])
  ])
```

### hover-content-dismissible · MUST

All content that hover or focus reveals can be dismissed without moving the pointer or focus, such as by Escape.

#### Why

Content laid over the screen that only moving away dismisses hides what a person magnifying the screen came to read — WCAG 2.2, Content on Hover or Focus.

#### Examples

```pseudo title="Avoid"
Tooltip({
  content: "Prices include VAT",
  isDismissedByEscape: false   # only moving away hides it
}, InfoButton({ label: "About prices" }))
```

```pseudo title="Prefer"
Tooltip({
  content: "Prices include VAT"
}, InfoButton({ label: "About prices" }))
```

### hover-content-stays-under-the-pointer · MUST

All content that hover reveals stays while the pointer moves onto it and rests over it.

#### Why

Content that vanishes as the pointer moves to it cannot be read by a person who magnifies the screen and must move the pointer to see it — WCAG 2.2, Content on Hover or Focus.

#### Examples

```pseudo title="Avoid"
Tooltip({
  content: "Delivered by Friday if ordered before 14:00",
  isContentHoverable: false   # hides as the pointer moves onto it
}, InfoButton({ label: "About delivery" }))
```

```pseudo title="Prefer"
Tooltip({
  content: "Delivered by Friday if ordered before 14:00"
}, InfoButton({ label: "About delivery" }))
```

### hover-content-persists · MUST

All content that hover or focus reveals stays until it is dismissed, its trigger is left or it is no longer relevant.

#### Why

Content that disappears on a timer is gone before a slow reader finishes it — WCAG 2.2, Content on Hover or Focus.

#### Examples

```pseudo title="Avoid"
Tooltip({
  content: "Delivered by Friday if ordered before 14:00",
  hideAfter: tokens.time.tooltip   # gone mid-sentence
}, InfoButton({ label: "About delivery" }))
```

```pseudo title="Prefer"
Tooltip({
  content: "Delivered by Friday if ordered before 14:00"
}, InfoButton({ label: "About delivery" }))
```

### orientation-never-locked · MUST

No screen locks its orientation; each works in portrait and in landscape. Exempt: a screen to which one orientation is essential, such as a piano keyboard or a cheque to photograph.

#### Why

A person whose device is mounted in one orientation cannot turn it, so a locked screen shuts them out — WCAG 2.2, Orientation.

#### Examples

```pseudo title="Avoid"
defineScreen({
  name: "OrderHistory",
  orientation: Portrait   # nothing about orders needs it
})
```

```pseudo title="Prefer"
defineScreen({
  name: "OrderHistory"
})

defineScreen({
  name: "ScanCheque",
  orientation: Landscape   # Why: a cheque is photographed lengthwise
})
```

### time-limit-adjustable · MUST

Every time limit the user did not set can be turned off, adjusted to at least ten times its default, or extended. Such limits include a session that expires and a form that times out. A limit offered for extension warns at least 20 seconds before it ends and is extended by a simple action, at least ten times. Exempt: a limit WCAG 2.2 exempts under Timing Adjustable, such as one of a real-time event or one that is essential.

#### Why

A person who reads, types or moves slowly loses their work to a limit they never saw coming — WCAG 2.2, Timing Adjustable.

#### Examples

```pseudo title="Avoid"
paymentFormLimit = {
  length: 10 minutes,
  onEnd: discardPaymentForm   # no warning, no way to extend
}
```

```pseudo title="Prefer"
paymentFormLimit = {
  length: 10 minutes,
  warnBefore: 2 minutes,
  extendBy: 10 minutes,
  maxExtensions: 10,
  onWarning: offerMoreTime,
  onEnd: discardPaymentForm
}
```

## Perception

### content-meets-the-contrast-minimum · MUST

All text contrasts with its background by at least 4.5:1 in every theme mode, and large text by 3:1. Exempt: text WCAG 2.2 exempts under Contrast (Minimum), such as a logotype or an inactive control's label.

#### Why

A reader who cannot see the text cannot read the screen, and low contrast is the accessibility failure met most often — WCAG 2.2, Contrast (Minimum).

#### Examples

```pseudo title="Avoid"
theme.light = { surface: "#ffffff", textMuted: "#6b7280" }
theme.dark = { surface: "#111827", textMuted: "#6b7280" }   # 3.7:1 in dark mode
```

```pseudo title="Prefer"
theme.light = { surface: "#ffffff", textMuted: "#6b7280" }
theme.dark = { surface: "#111827", textMuted: "#9ca3af" }
```

### control-meets-the-non-text-contrast-minimum · MUST

Every control and every graphic needed to understand the content contrasts with its surroundings by at least 3:1, in every theme mode. That holds for the boundaries and states that identify a control, the focus indicator, and the parts of such a graphic, such as a status icon or a chart's lines. Exempt: what WCAG 2.2 exempts under Non-text Contrast, such as an inactive control, a control whose look the platform sets unchanged, or a logo, a photograph or another graphic whose particular look is essential to what it conveys.

#### Why

A person who cannot see a field's border, the focus or the line of a chart cannot find the control or read what the graphic shows — WCAG 2.2, Non-text Contrast.

#### Examples

```pseudo title="Avoid"
theme.light = { surface: "#ffffff", fieldBorder: "#d1d5db" }   # 1.5:1, the field cannot be found
theme.dark = { surface: "#111827", fieldBorder: "#6b7280" }
```

```pseudo title="Prefer"
theme.light = { surface: "#ffffff", fieldBorder: "#8a8f98" }
theme.dark = { surface: "#111827", fieldBorder: "#6b7280" }
```

### reduced-motion-honoured · MUST

While the person asks for reduced motion, every motion that is not essential stops. A motion moves, scales or turns what the screen shows, and a fade is none.

#### Why

Motion makes some people ill, dizzy or unable to read on — WCAG 2.2, Animation from Interactions, a criterion of level AAA.

#### Examples

```pseudo title="Avoid"
function Hero({ image })
  return ParallaxLayer({ speed: tokens.motion.parallax }, Image(image))   # moves whatever the person asked
```

```pseudo title="Prefer"
function Hero({ image, isMotionReduced })
  if isMotionReduced then
    return Image(image)

  return ParallaxLayer({ speed: tokens.motion.parallax }, Image(image))
```

### reduced-motion-keeps-its-feedback · MUST

While the person asks for reduced motion, every change a stopped motion carried is still shown, by a cut or a fade.

#### Why

Motion removed with the feedback it carried leaves the person unsure what changed or whether their action took.

#### Examples

```pseudo title="Avoid"
function addedToCartMotion(isMotionReduced)
  if isMotionReduced then
    return <absent>   # nothing shows the item went in

  return FlyToCart({ duration: tokens.motion.duration.medium })
```

```pseudo title="Prefer"
function addedToCartMotion(isMotionReduced)
  if isMotionReduced then
    return HighlightCartBadge({ transition: Fade, duration: tokens.motion.duration.short })

  return FlyToCart({ duration: tokens.motion.duration.medium })
```

### status-changes-announced · MUST

Every error and change of status the interface shows is announced to assistive technology.

#### Why

A change that is only shown is missed by everyone who cannot see it — WCAG 2.2, Status Messages.

#### Examples

```pseudo title="Avoid"
function SaveStatus({ status })
  return Text(status is Saved ? "Address saved" : "")   # shown, never announced
```

```pseudo title="Prefer"
function SaveStatus({ status })
  return LiveRegion({ politeness: Polite }, status is Saved ? "Address saved" : "")
```

### announcement-interrupts-only-when-urgent · MUST

Only an urgent announcement interrupts what is being read, and every other waits its turn. An urgent one is one such as an error that stops the person's task.

#### Why

An announcement that interrupts for every change cuts off what the person was hearing, until they can follow neither.

#### Examples

```pseudo title="Avoid"
LiveRegion({ politeness: Assertive }, results.count + " results")   # cuts off what is being read
```

```pseudo title="Prefer"
LiveRegion({ politeness: Polite }, results.count + " results")

LiveRegion({ politeness: Assertive }, payment.declineMessage)
```

### streamed-text-announced-once · MUST

No text that streams onto the screen is announced piece by piece: it sits outside every live region, and what assistive technology hears of it is its start and its end, as two changes of status. Such text arrives in pieces into one place, such as an answer generated as it streams or a log that follows its source.

#### Why

A live region announces each change, and text streamed in hundreds of pieces becomes hundreds of interruptions.

#### Examples

```pseudo title="Avoid"
function AssistantAnswer({ answer })
  return LiveRegion({ politeness: Polite }, answer.textSoFar)   # every piece announced
```

```pseudo title="Prefer"
function AssistantAnswer({ answer })
  return [
    Text(answer.textSoFar),
    LiveRegion({ politeness: Polite },
      answer.status is Streaming ? "Writing the answer" : "Answer ready")
  ]
```

### toast-never-the-only-place · MUST

No toast is the only place that shows an error or the only path to an action.

#### Why

A toast vanishes, steals no focus and is missed by many, so an error or an action that lives only in it is lost to them.

#### Examples

```pseudo title="Avoid"
function onAddressSaveFailed()
  toast.show("Could not save the address", {
    action: { label: "Try again", onPress: saveAddress }   # the only retry, gone in seconds
  })
```

```pseudo title="Prefer"
function AddressForm({ saveState, onSave })
  return Form({ onSubmit: onSave }, [
    AddressFields(),
    saveState is Failed and Alert("Could not save the address. Check your connection and save again."),
    SubmitButton("Save address")
  ])
```

### self-closing-toast-pauses-while-in-use · MUST

Every toast that closes by itself pauses while the pointer rests on it or it has focus.

#### Why

A toast that closes while it is read or reached for takes its words with it before a slow reader or a keyboard user is done.

#### Examples

```pseudo title="Avoid"
toast.show("Address saved", {
  duration: tokens.time.toast,
  isPausedOnHover: false,   # closes under the reader's pointer
  isPausedOnFocus: false
})
```

```pseudo title="Prefer"
toast.show("Address saved", {
  duration: tokens.time.toast,
  isPausedOnHover: true,
  isPausedOnFocus: true
})
```

## Understanding

### help-kept-in-the-same-place · MUST

Wherever help is offered on several screens, it sits in the same place on each, relative to the rest of the screen. Such help includes contact details, a contact form, a self-help page and a chat.

#### Why

A person who needs help looks where they found it last, so help that moves is help they do not find — WCAG 2.2, Consistent Help.

#### Examples

```pseudo title="Avoid"
# screens/cart
Page({ header: Header([Logo(), HelpLink()]), footer: Footer() }, CartView())

# screens/checkout
Page({ header: Header([Logo()]), footer: Footer([HelpLink()]) }, CheckoutView())   # help moved to the footer
```

```pseudo title="Prefer"
# layouts/shop-layout
function ShopLayout({ children })
  return Page({ header: Header([Logo(), HelpLink()]), footer: Footer() }, children)

# screens/cart
ShopLayout(CartView())

# screens/checkout
ShopLayout(CheckoutView())
```

### screen-declares-its-language · MUST

Wherever the platform offers a way to declare it, every screen declares the language of its content.

#### Why

A screen reader reads text in the language it is told, so a page in Ukrainian read with English rules is noise — WCAG 2.2, Language of Page.

#### Examples

```pseudo title="Avoid"
Document({ title: messages.cart.title }, CartView())   # read with the reader's default language
```

```pseudo title="Prefer"
Document({ language: locale.language, title: messages.cart.title }, CartView())
```

### passage-declares-its-own-language · MUST

Wherever the platform offers a way to declare it, every passage in a language other than its screen's declares its own. Exempt: what WCAG 2.2 exempts under Language of Parts, such as a proper name, a technical term, a word of indeterminate language or one that has become part of the screen's language.

#### Why

A quotation or a phrase in another language read with the screen's rules is spoken past recognition — WCAG 2.2, Language of Parts.

#### Examples

```pseudo title="Avoid"
function ReviewCard({ review })
  return Card([
    Rating(review.stars),
    Paragraph(review.text)   # a Ukrainian review read with English rules
  ])
```

```pseudo title="Prefer"
function ReviewCard({ review })
  return Card([
    Rating(review.stars),
    Paragraph({ language: review.language }, review.text)
  ])
```

## Proof

### rendered-state-scanned-for-accessibility-once · MUST

Each state the interface renders is scanned for accessibility once, and passes with no violation. The scan runs in the narrowest spec the platform renders the state in: a component's states in the component's spec where the platform renders a component alone, the states a screen adds in the screen's.

#### Why

A state never scanned ships the violations a tool would have caught on every change, before a person meets them, and one scanned in every spec that renders it costs a run for no problem the first scan missed.

#### Examples

```pseudo title="Avoid"
# cart/presentation/components/cart-line/__tests__/cart-line.test
test "should pass the accessibility scan"
  # Act
  render CartLine({ line: createLine() })

  # Assert
  assert scanAccessibility() has no violations

# presentation/screens/cart/__tests__/cart.test
test "should pass the accessibility scan"
  # Act
  render CartScreen({ cart: createCart() })

  # Assert
  assert scanAccessibility() has no violations   # its lines scanned again, the empty cart never
```

```pseudo title="Prefer"
# cart/presentation/components/cart-line/__tests__/cart-line.test
for stock in [InStock, OutOfStock]
  test "should pass the accessibility scan when " + stock
    # Act
    render CartLine({ line: createLine({ stock }) })

    # Assert
    assert scanAccessibility() has no violations

# presentation/screens/cart/__tests__/cart.test
test "should pass the accessibility scan when the cart is empty"
  # Act
  render CartScreen({ cart: createCart({ lines: [] }) })

  # Assert
  assert scanAccessibility() has no violations
```

### unscannable-criterion-proven-where-it-renders · MUST

Every accessibility criterion a spec's environment cannot judge is proven where the platform renders or by a test of its deciding values. Contrast in a simulated document is such a criterion.

#### Why

A scan in an environment that computes no layout or colour passes such a criterion whatever the screen shows, so its violation ships unseen.

#### Examples

```pseudo title="Avoid"
# cart/presentation/components/price-tag/__tests__/price-tag.test
test "should pass the accessibility scan when discounted"
  # Act
  render PriceTag({ price: createMoney(), isDiscounted: true })

  # Assert
  assert scanAccessibility() has no violations   # contrast passes with no colour computed
```

```pseudo title="Prefer"
# cart/presentation/components/price-tag/__tests__/price-tag.test
test "should pass the accessibility scan when discounted"
  # Act
  render PriceTag({ price: createMoney(), isDiscounted: true })

  # Assert
  assert scanAccessibility() has no violations

# libs/ui/theme/__tests__/theme.test
for mode in theme.modes
  test "should give discounted text 4.5:1 on its surface when " + mode.name
    # Act
    let ratio = contrast(mode.textDiscount, mode.surface)

    # Assert
    assert ratio >= 4.5
```

### accessibility-violation-reported-with-its-element · SHOULD

Every violation an automated accessibility check finds is reported with the element it was found on.

#### Why

A check that names no element leaves each violation to be hunted through the screen.

#### Examples

```text title="Avoid"
presentation/screens/cart/__tests__/cart.test
  should pass the accessibility scan
  FAIL  2 violations: control without a name,
        field without a label
```

```text title="Prefer"
presentation/screens/cart/__tests__/cart.test
  should pass the accessibility scan
  FAIL  control without a name
          on IconButton(TrashIcon)
          in CartLine "Blue mug"
        field without a label
          on TextField(kind: Number)
          in CartLine "Blue mug"
```
