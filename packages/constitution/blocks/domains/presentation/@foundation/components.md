# Components

> Governs a component: where it comes from, how it is composed, its props, size, actions and appearance.

## Vocabulary

A **prop** is an input a component takes, a parameter where the framework calls it so.

A **component primitive** is a generic component others compose, such as a button, a text field or a dialog.

A **slot prop** is a prop that takes content to render, such as children or a named part.

A **component variant** is a value of a prop that selects one of a component's looks, such as its size or its tone.

A component's **own variants** are the component variants that only its root needs.

An **event callback** is a prop a component calls to tell its caller that something happened; **`on<Event>`**{#event-callback} is the name it takes for that event, a default a framework's block respells under its id.

A **complex pattern** is a control of several parts with a keyboard and focus behaviour of its own: a dialog, a popover, a menu, a combobox, a select, tabs, a tooltip, an accordion and their kin.

A **destructive action** is one that deletes the person's data, spends their money or commits them to an agreement.

A **design token**, called a token in this block and in the blocks that build on it, is a named visual value that a component reads in place of a literal one, such as a colour, a space or a duration.

A **theme** gives the design tokens their values, and its **theme modes**, such as light, dark and increased contrast, are the sets of those values it offers, one shown at a time.

## Sourcing

### component-built-from-existing-ones-first · SHOULD

Every component is built from existing components first: an existing component primitive is extended before a new one is composed from the others.

#### Why

A component built anew where one existed is more code to keep and prove, and one more way of doing the same thing for its users to learn.

#### Examples

```pseudo title="Avoid"
# ui/icon-button
component IconButton({ icon, label, onPress })
  return Pressable(onPress: onPress, accessibleName: label, Icon(name: icon))

# cart/cart-line
IconButton(icon: TrashIcon, label: "Remove from cart", onPress: onRemove)
```

```pseudo title="Prefer"
# ui/button
component Button({ label, icon, isLabelHidden = false, onPress })
  return Pressable(
    onPress: onPress,
    accessibleName: label,
    if icon is not <absent> then Icon(name: icon),
    if not isLabelHidden then Text(label)
  )

# cart/cart-line
Button(label: "Remove from cart", icon: TrashIcon, isLabelHidden: true, onPress: onRemove)
```

### primitive-markup-never-recreated → fact-has-one-source · MUST

No component re-creates a component primitive's markup; one that needs it composes the component primitive.

#### Why

Each re-created component primitive is a second version that drifts in look and behaviour, and in accessibility first — DRY.

#### Examples

```pseudo title="Avoid"
component CouponForm({ onApply })
  return Row(
    TextField(label: "Coupon code", name: "coupon"),
    Pressable(
      onPress: onApply,
      style: { background: tokens.color.action, padding: tokens.space.md },
      Text("Apply coupon")
    )
  )
```

```pseudo title="Prefer"
component CouponForm({ onApply })
  return Row(
    TextField(label: "Coupon code", name: "coupon"),
    Button(label: "Apply coupon", onPress: onApply)
  )
```

### complex-pattern-built-on-accessible-primitives · MUST

Every complex pattern is built on accessible component primitives, never with roles and keys written by hand. It is built on the active library of accessible component primitives or, where none is active, on the platform's own element where that element carries the whole pattern, and otherwise on such a library.

#### Why

These patterns carry keyboard, focus and announcement behaviour that hand-built versions almost always get wrong.

#### Examples

```pseudo title="Avoid"
component SortMenu({ onSortChange })
  let [isOpen, setIsOpen] = state(false)

  return Box(
    Box(role: "button", onPress: function() setIsOpen(not isOpen), Text("Sort by")),
    if isOpen then Box(
      role: "menu",
      onKey: moveFocusBetweenItems,
      Box(role: "menuitem", onPress: function() onSortChange(Price), Text("Price")),
      Box(role: "menuitem", onPress: function() onSortChange(Newest), Text("Newest"))
    )
  )
```

```pseudo title="Prefer"
import { Menu } from "ui/primitives"

component SortMenu({ onSortChange })
  return Menu.Root(
    Menu.Trigger(Text("Sort by")),
    Menu.Content(
      Menu.Item(onSelect: function() onSortChange(Price), Text("Price")),
      Menu.Item(onSelect: function() onSortChange(Newest), Text("Newest"))
    )
  )
```

### vendored-component-never-duplicates-the-kit · SHOULD

No component is installed as source where the program's own components already hold an equivalent.

#### Why

A second component for the same need splits the program's look and behaviour in two, and the code that came in stays foreign until someone changes it.

#### Examples

```text title="Avoid"
ui/
├── date-picker/
│   └── date-picker
└── vendored/
    └── calendar-picker/   # a second date picker, copied in
        └── calendar-picker
```

```text title="Prefer"
ui/
└── date-picker/
    └── date-picker
```

## Composition

### component-with-regions-is-a-compound · SHOULD

Every component with regions is a compound: a root with named parts, each taking the caller's content as composition, never as data the component lays out itself. A component has regions when more than one of its parts carries the caller's content, when such a part is optional, or when it takes a slot prop, and composition is children, a named part or a slot prop. Exempt: a leaf with a small, stable content, which stays a leaf.

#### Why

A component that lays out data handed in for each region grows a parameter and a branch for every new need, while a compound takes the need as composition — compound components.

#### Examples

```pseudo title="Avoid"
OrderCard(
  title: order.number,
  subtitle: formatDate(order.placedOn),
  actions: [
    { label: "Track parcel", onPress: trackParcel },
    { label: "Order again", onPress: orderAgain }
  ]
)
```

```pseudo title="Prefer"
OrderCard.Root(
  OrderCard.Header(
    Heading(order.number),
    Text(formatDate(order.placedOn))
  ),
  OrderCard.Footer(
    Button(label: "Track parcel", onPress: trackParcel),
    Button(label: "Order again", onPress: orderAgain)
  )
)
```

### stateful-component-controllable-or-not · SHOULD

Every component that holds a value can be controlled or left to itself. It offers both through one set of props, the value, its initial value and a change callback, or as a pair of components, the stateful one wrapping the controlled one.

#### Why

A component only one kind of screen can drive is forked for the other.

#### Examples

```pseudo title="Avoid"
component QuantityStepper({ value, onChange })
  return Row(
    Button(label: "Remove one", onPress: function() onChange(value - 1)),
    Text(value),
    Button(label: "Add one", onPress: function() onChange(value + 1))
  )
```

```pseudo title="Prefer"
component QuantityStepper({ value, initialValue = 1, onChange })
  let [quantity, setQuantity] = controllableState(value, initialValue, onChange)

  return Row(
    Button(label: "Remove one", onPress: function() setQuantity(quantity - 1)),
    Text(quantity),
    Button(label: "Add one", onPress: function() setQuantity(quantity + 1))
  )
```

### component-use-never-switches-control · MUST

No use of a component that holds a value switches between controlling the value and leaving it to the component.

#### Why

A component switched between the two loses the value or fights its caller for it.

#### Examples

```pseudo title="Avoid"
component CartLineEditor({ line, onQuantityChange })
  return QuantityStepper(
    value: line.quantity or <absent>,  # left to itself until the line loads
    onChange: onQuantityChange
  )
```

```pseudo title="Prefer"
component CartLineEditor({ line, onQuantityChange })
  if line is <absent> then
    return QuantitySkeleton()

  return QuantityStepper(value: line.quantity, onChange: onQuantityChange)
```

### passing-state-kept-in-its-component · SHOULD

All passing state, such as an open menu or a hover, lives in the component that shows it.

#### Why

State lifted above the component that shows it is shared by accident and copied until the copies disagree.

#### Examples

```pseudo title="Avoid"
component ProductScreen({ product })
  let [isShareMenuOpen, setIsShareMenuOpen] = state(false)

  return Stack(
    ProductDetails(product: product),
    ShareMenu(url: product.url, isOpen: isShareMenuOpen, onOpenChange: setIsShareMenuOpen)
  )
```

```pseudo title="Prefer"
component ProductScreen({ product })
  return Stack(
    ProductDetails(product: product),
    ShareMenu(url: product.url)
  )

component ShareMenu({ url })
  let [isOpen, setIsOpen] = state(false)
  ...
```

## Props

### boolean-props-prefixed → boolean-name-opens-with-a-boolean-prefix · MUST

Every boolean prop of the program's own components opens with the prefix of its kind: `is` for a state, `has` for a presence, `can` for a permission, `with` for an opt-in part that carries no content of the caller, or `should` for a policy. A prop the component hands on to a native element or to an outside library takes the prefix too, and the component maps it to the name the element or the library takes. Exempt: an outside library's own component, used under that library's names.

#### Why

A bare boolean leaves the reader of a call site guessing what kind of switch it is, and a prop named the library's way at some call sites splits the program into two namings.

#### Examples

```pseudo title="Avoid"
component Dialog({ open, closeButton, onClose, children })
  return DialogPrimitive(open: open, onClose: onClose, children)

Dialog(open: isConfirming, closeButton: true, onClose: stopConfirming, ...)
```

```pseudo title="Prefer"
component Dialog({ isOpen, withCloseButton, onClose, children })
  return DialogPrimitive(
    open: isOpen,
    onClose: onClose,
    children,
    if withCloseButton then CloseButton(onPress: onClose)
  )

Dialog(isOpen: isConfirming, withCloseButton: true, onClose: stopConfirming, ...)
```

### event-props-named-on-event · SHOULD

Every event callback is named `on<Event>` for the event it answers. It is never named by an action verb, a `handle` name or a bare past tense such as `submitted`.

#### Why

A callback named for an action states what its caller will do, which the component cannot know, and names that differ by component turn one event into several words.

#### Examples

```pseudo title="Avoid"
component CartLine({ line, deleteFromCart, handleQuantity, saved })

CartLine(line: line, deleteFromCart: removeLine, handleQuantity: changeQuantity, saved: showSaved)
```

```pseudo title="Prefer"
component CartLine({ line, onRemove, onQuantityChange, onSave })

CartLine(line: line, onRemove: removeLine, onQuantityChange: changeQuantity, onSave: showSaved)
```

### unused-props-deleted → dead-code-deleted · MUST

Every optional prop no call site passes is deleted, its default written where it was read. Exempt: a prop of a component a package publishes to others.

#### Why

An unused option is a branch nobody tests and a prop every reader learns for nothing — you aren't gonna need it.

#### Examples

```pseudo title="Avoid"
component PriceTag({ price, size = Medium })
  return Text(formatMoney(price), size: size)

PriceTag(price: line.price)
PriceTag(price: cart.total)  # no call site passes size
```

```pseudo title="Prefer"
component PriceTag({ price })
  return Text(formatMoney(price), size: Medium)

PriceTag(price: line.price)
PriceTag(price: cart.total)
```

### primitive-passes-its-element-through · SHOULD

Every component primitive accepts what its caller passes to its element and merges its own attributes and handlers with the caller's. What the caller passes includes its attributes, its handlers and its reference, or the platform's modifier.

#### Why

Without it every caller wraps or forks the component primitive for one attribute — the open–closed principle.

#### Examples

```pseudo title="Avoid"
# ui/button
component Button({ label, onPress })
  return NativeButton(style: buttonStyle, onPress: onPress, Text(label))
```

```pseudo title="Prefer"
# ui/button
component Button({ label, ref, ...elementProps })
  return NativeButton(
    ...elementProps,
    ref: ref,
    style: mergeStyles(buttonStyle, elementProps.style),
    Text(label)
  )
```

### primitives-take-text-by-props · MUST

No component primitive holds text a person reads; such text arrives through its props. Exempt: language-neutral glyphs, such as an ellipsis or a slash, and icons.

#### Why

A component primitive with its own text cannot be translated or reworded by the program that uses it.

#### Examples

```pseudo title="Avoid"
# ui/search-field
component SearchField({ value, onChange })
  return TextField(
    label: "Search",
    kind: Search,
    value: value,
    onChange: onChange
  )
```

```pseudo title="Prefer"
# ui/search-field
component SearchField({ label, value, onChange })
  return TextField(
    label: label,
    kind: Search,
    value: value,
    onChange: onChange
  )
```

## Size

### component-sizes-to-its-container · SHOULD

Every component sizes to the space its container gives it, never to the screen's.

#### Why

A component sized to the screen overflows a narrow container on a wide screen, since the screen's size says nothing about the space it was given.

#### Examples

```pseudo title="Avoid"
component ProductCard({ product })
  let layout = if screenSize().width >= tokens.breakpoint.md then Side else Stacked

  return ProductCardLayout(layout: layout, product: product)
```

```pseudo title="Prefer"
component ProductCard({ product })
  let layout = if containerSize().width >= tokens.breakpoint.md then Side else Stacked

  return ProductCardLayout(layout: layout, product: product)
```

### size-change-keeps-the-users-state · MUST

Every change of size or orientation keeps the user's state. It restyles what is shown and never swaps a tree that holds state, so a region it hides keeps its data and the user's input.

#### Why

A tree swapped on a change of size erases what the user typed when they turn a device or resize a window.

#### Examples

```pseudo title="Avoid"
component CheckoutScreen()
  if containerSize().width >= tokens.breakpoint.lg then
    return Columns(AddressForm(), OrderSummary())

  return Stack(AddressForm(), OrderSummary())  # a turn remounts the form
```

```pseudo title="Prefer"
component CheckoutScreen()
  let layout = if containerSize().width >= tokens.breakpoint.lg then Side else Stacked

  return SplitLayout(
    layout: layout,
    AddressForm(),
    OrderSummary()
  )
```

### truncated-text-reachable-in-full · SHOULD

All text cut to fit can be read in full. Text truncated or clamped to a number of lines can be read on its own screen, in a view that expands it, or in a tooltip that keyboard and touch reach as well.

#### Why

The part cut off is often the one that tells two items apart, and a user who cannot read it cannot choose between them.

#### Examples

```pseudo title="Avoid"
let COLLAPSED_LINES = 3

component ProductDescription({ text })
  return Text(text, maxLines: COLLAPSED_LINES)
```

```pseudo title="Prefer"
let COLLAPSED_LINES = 3

component ProductDescription({ text })
  let [isExpanded, setIsExpanded] = state(false)

  return Stack(
    Text(text, maxLines: if isExpanded then <absent> else COLLAPSED_LINES),
    Button(
      label: if isExpanded then "Show less" else "Show the full description",
      onPress: function() setIsExpanded(not isExpanded)
    )
  )
```

## Actions

### destructive-action-confirmed-or-undoable · MUST

Every destructive action can be undone, or is confirmed by the person after they have reviewed what it will do.

#### Why

A slip on such an action costs the person something they cannot get back.

#### Examples

```pseudo title="Avoid"
Button(
  label: "Delete address",
  onPress: function() deleteAddress(address.id)
)
```

```pseudo title="Prefer"
ConfirmDialog(
  trigger: Button(label: "Delete address"),
  title: "Delete " + address.line1 + "?",
  description: "You cannot undo this.",
  confirmLabel: "Delete address",
  onConfirm: function() deleteAddress(address.id)
)
```

## Appearance

### tokens-single-source-of-appearance → literal-with-a-meaning-is-named · MUST

Every component's appearance comes only from tokens: its colour, space, size, font, radius, shadow, motion and stacking order come from tokens, never from a literal value. Exempt: a value no theme names, such as `0`, a percentage, a viewport unit or `auto`, and a breakpoint repeated where the platform cannot read a token.

#### Why

A literal value is a look no change of token reaches, so a theme changes every component but the ones that wrote it in place — a single source of truth.

#### Examples

```pseudo title="Avoid"
component PromoCard({ promo })
  return Box(
    padding: 12,
    radius: 8,
    background: "#F4F4F5",
    Text(promo.text, size: 14)
  )
```

```pseudo title="Prefer"
component PromoCard({ promo })
  return Box(
    padding: tokens.space.md,
    radius: tokens.radius.md,
    background: tokens.color.surfaceMuted,
    Text(promo.text, font: tokens.font.body)
  )
```

### state-is-not-a-variant · MUST

No element's state is a component variant: its state, such as hovered, focused, selected, open, disabled, invalid or busy, is styled from the state the element itself carries, never from a component variant.

#### Why

A look driven by a prop drifts from the state assistive technology announces, so a person sees one thing and hears another.

#### Examples

```pseudo title="Avoid"
let tabStyles = {
  Default: { color: tokens.color.textMuted },
  Selected: { color: tokens.color.text }
}

component OrderTab({ label, variant })
  return Tab(label: label, style: tabStyles[variant])

OrderTab(label: "Shipped", variant: if filter is Shipped then Selected else Default)
```

```pseudo title="Prefer"
let tabStyle = {
  color: tokens.color.textMuted,
  whenSelected: { color: tokens.color.text }
}

component OrderTab({ label, isSelected })
  return Tab(label: label, isSelected: isSelected, style: tabStyle)

OrderTab(label: "Shipped", isSelected: filter is Shipped)
```

### own-variants-one-typed-map · SHOULD

Every component's own variants are declared in one place. That place is a typed map from component variant to style, or a function whose exhaustive branch gives each component variant's style, and no condition outside it decides a style.

#### Why

A style decided by a condition outside the declaration is missed by the next change to that component variant — a single source of truth.

#### Examples

```pseudo title="Avoid"
let badgeTones = {
  Neutral: { background: tokens.color.surfaceMuted },
  Danger: { background: tokens.color.dangerSurface }
}

component Badge({ tone, label })
  return Box(
    style: badgeTones[tone],
    Text(label, weight: if tone is Danger then tokens.font.weightStrong else tokens.font.weightRegular)
  )
```

```pseudo title="Prefer"
let badgeTones: Map<BadgeTone, Style> = {
  Neutral: { background: tokens.color.surfaceMuted, weight: tokens.font.weightRegular },
  Danger: { background: tokens.color.dangerSurface, weight: tokens.font.weightStrong }
}

component Badge({ tone, label })
  return Box(style: badgeTones[tone], Text(label))
```

### cascading-variant-set-once-on-ancestor · SHOULD

Every component variant that restyles descendants is set once on their ancestor, never passed down as a prop. Such a component variant is, for instance, a themed subtree or a look a parent sets, and it is resolved by the platform's inheritance of styles or, where the platform has none, by the theme's own scope.

#### Why

A prop drilled for looks couples every component in between to a decision only the ancestor and the leaves care about.

#### Examples

```pseudo title="Avoid"
component PromoBanner({ promo })
  return Box(
    background: tokens.color.surfaceInverse,
    Heading(promo.title, tone: Inverse),
    Text(promo.text, tone: Inverse),
    Button(label: promo.actionLabel, tone: Inverse, onPress: promo.open)
  )
```

```pseudo title="Prefer"
component PromoBanner({ promo })
  return ThemeScope(
    mode: Inverse,
    Box(
      background: tokens.color.surface,
      Heading(promo.title),
      Text(promo.text),
      Button(label: promo.actionLabel, onPress: promo.open)
    )
  )
```

### nested-radius-concentric · SHOULD

Every rounded element nested in another takes its container's radius less the space between them, so both curves share a centre. It is square where that leaves nothing.

#### Why

A nested curve as round as its container's leaves the gap thicker at the corners than along the sides, and the nesting looks misaligned.

#### Examples

```pseudo title="Avoid"
Card(
  radius: tokens.radius.lg,
  padding: tokens.space.sm,
  Image(product.photo, radius: tokens.radius.lg)
)
```

```pseudo title="Prefer"
Card(
  radius: tokens.radius.lg,
  padding: tokens.space.sm,
  Image(product.photo, radius: max(tokens.radius.lg - tokens.space.sm, 0))
)
```

### changing-numbers-use-fixed-width-digits · SHOULD

Every changing number is set in digits of one width. That holds for a number that changes in place, such as a timer, a counter or a total, and for a column of numbers to compare.

#### Why

Digits of different widths make a changing number jitter, and a column of them misaligns the places a reader compares.

#### Examples

```pseudo title="Avoid"
component CartTotal({ cart })
  return Text(formatMoney(total(cart)), font: tokens.font.heading)
```

```pseudo title="Prefer"
component CartTotal({ cart })
  return Text(formatMoney(total(cart)), font: tokens.font.heading, digits: Tabular)
```

### long-text-line-length-bounded · SHOULD

Every line of long-form text holds at most 80 characters, and at most 40 in Chinese, Japanese and Korean. Long-form text includes an article and a page of help.

#### Why

The eye loses its place on the way back from the end of a long line to the start of the next, so the reader rereads or skips a line — WCAG 2.2, Visual Presentation, a criterion of level AAA.

#### Examples

```pseudo title="Avoid"
component HelpArticle({ article })
  return Box(width: Full, RichText(article.body))
```

```pseudo title="Prefer"
# tokens
size.prose.latin: 80 characters
size.prose.cjk: 40 characters

# help/help-article
component HelpArticle({ article })
  return Box(
    width: Full,
    maxLineLength: if article.isInCjk then tokens.size.prose.cjk else tokens.size.prose.latin,
    RichText(article.body)
  )
```
