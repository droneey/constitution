# Components

> Governs a component: where it comes from, how it is composed, its props, size, interaction and appearance.

## Sourcing

### component-built-from-existing-ones-first · SHOULD

A component is built from existing components first — the program's own primitives searched before any is installed — then by extending a primitive, and only then on a new primitive, composed in like the others.

| Why |
|---|
| an existing component is already proven and known to its users; each new one is more code to keep and more for users to learn. |

### primitive-markup-never-recreated · MUST

A primitive's markup is never re-created; a component that needs it composes the primitive.

| Why |
|---|
| each re-created primitive is a second version that drifts in look and behaviour, and in accessibility first. |

### complex-pattern-built-on-accessible-primitives · MUST

A dialog, a popover, a menu, a combobox, a select, tabs, a tooltip, an accordion and their kin are built on the active library of accessible primitives; where none is active, on the platform's own element where it carries the whole pattern, and otherwise on such a library — never with roles and keys written by hand.

| Why |
|---|
| these patterns carry keyboard, focus and announcement behaviour that hand-built versions almost always get wrong. |

### vendored-component-adapted-in-the-change-that-installs-it · MUST

A component installed as source is adapted in the change that installs it — restyled to the tokens, stripped of the props no call site uses, and brought under the rules on props — or rejected; it is never kept as it came.

| Why |
|---|
| code copied in as it came brings another project's names and looks, and stays foreign until someone changes it. |

## Composition

### component-with-regions-is-a-compound · SHOULD

A component with a second region, an optional part that carries the caller's content, or a slot is a compound — a root with named parts, its content passed as children — never a prop per region; a leaf with a small, stable content stays a leaf.

| Why |
|---|
| a component with a prop per region grows a prop for every new need; a compound grows by composition. |

### props-drilled-at-most-two-levels · SHOULD

A prop passed unchanged through more than two levels calls for composition or a nearer widget that loads the data itself.

| Why |
|---|
| a prop threaded through components that do not use it couples them all to it. |

### stateful-component-controllable-or-not · SHOULD

A component that holds a value can be driven from outside or left to itself through one interface — the value, its initial value and a change callback — and never switches between the two.

| Why |
|---|
| one interface serves the screen that owns the value and the one that does not, and a component that switches loses or fights the value. |

## Props

### boolean-props-prefixed → boolean-name-is-a-positive-predicate · MUST

Every boolean prop of a component of the program's own — one it hands on to a native element or to an outside library included — starts with `is` for a state, `has` for a presence, `can` for a permission, `with` for an opt-in part that carries no content of the caller — `withDivider` — or `should` for a policy, never a bare, mixed or negated name; the component maps it to the name the element or the library takes where it hands it on — `isDisabled` handed on as `disabled` — and an outside library's own component is used under that library's names.

| Why |
|---|
| the prefix says what kind of switch a prop is, so a reader knows its effect from the call site, and mapping it at the one place it meets an element or a library keeps every call site of the program in one naming. |

### event-props-named-on-event → concept-has-one-word · MUST

A callback prop is named `on<Event>` for the event it answers, never an action verb, a `handle` name or a bare past tense such as `submitted`.

| Why |
|---|
| `on<Event>` says when the callback runs and leaves what it does to the caller, and one name per event holds across every component. |

### unused-props-deleted → dead-code-deleted · MUST

An optional prop no call site passes is deleted, and its default is written where it was used, save a prop of a component a package publishes to others.

| Why |
|---|
| an unused option is a branch nobody tests and an interface nobody needs. |

### primitives-take-text-by-props · MUST

A primitive holds no user-facing text; text arrives through props, and only language-neutral glyphs — an ellipsis, a slash — and icons are its own.

| Why |
|---|
| a primitive with its own text cannot be translated or reworded by the application that uses it. |

## Size

### component-sizes-to-its-container · SHOULD

A component sizes to the space its container gives it, never to the screen's.

| Why |
|---|
| the same component then fits a sidebar and a page, while the screen's size says nothing about the space it was given. |

### size-change-keeps-the-users-state · SHOULD

A change of size or orientation restyles what is shown and never swaps a tree that holds state, so a region it hides keeps its data and the user's input.

| Why |
|---|
| turning a device or resizing a window must never erase what the user typed. |

### truncated-text-reachable-in-full · SHOULD

Text cut to fit — truncated or clamped to a number of lines — can be read in full: on its own screen, in a view that expands it, or in a tooltip that keyboard and touch reach as well.

| Why |
|---|
| the part cut off is often the one that tells two items apart, and a user who cannot read it cannot choose between them. |

## Interaction

### button-names-its-result · SHOULD

A button names its result, verb and object — never "Submit" or "OK". "Cancel" and "Close" serve a secondary action, and one label such as "Continue" moves a flow to its next step; a confirmation of a destructive action names the action; a payment button shows the amount.

| Why |
|---|
| a person reads the button to know what will happen; a vague label makes them guess. |

### same-action-same-label · MUST

A control that does the same thing on several screens or steps carries the same label on each.

| Why |
|---|
| a user knows a control by its name, so a new name for the same action reads as a new action. |

### switch-labelled-by-its-on-state · SHOULD

A switch or a checkbox is labelled by what it does when it is on, never by a negation: "Send notifications", never "Disable notifications" or "Don't send notifications".

| Why |
|---|
| a negated label turned off is a double negative, which the user must work out before they dare touch it. |

### long-lists-virtualised · SHOULD

A list whose length the product does not bound renders only the rows in view and those near them, or is paged.

| Why |
|---|
| a list that mounts every row at once grows slower with every item, and a long one freezes the device. |

### drag-shows-grab-hold-and-targets · SHOULD

An item that can be dragged shows that it can be grabbed; while it is held, it shows that it is held, and every place that accepts it is marked.

| Why |
|---|
| without these marks a user cannot tell what moves, that it is moving, or where it may land. |

## Appearance

### tokens-single-source-of-appearance · MUST

A component's appearance — colour, space, size, type, radius, shadow, motion — comes only from the tokens of the design system it uses, never from a literal value — save a value no theme names — `0`, a percentage, a viewport unit, `auto` — and a breakpoint repeated where the platform cannot read a token.

| Why |
|---|
| one change of a token then reaches every component, and a literal value is a look nobody can change in one place. |

### state-is-not-a-variant · MUST

An element's state — hovered, focused, selected, open, disabled, invalid, busy — is styled from the state the element itself carries, never from a variant prop.

| Why |
|---|
| a look driven by a prop drifts from the state assistive technology announces, so a person sees one thing and hears another. |

### changing-numbers-use-fixed-width-digits · SHOULD

A number that changes in place — a timer, a counter, a total — and a column of numbers to compare are set in digits of one width.

| Why |
|---|
| digits of different widths make a changing number jitter, and a column of them misaligns the places a reader compares. |

### long-text-line-length-bounded · SHOULD

Long-form text — an article, a page of help — is set at no more than 80 characters a line, 40 in Chinese, Japanese and Korean.

| Why |
|---|
| the eye loses its place on the way back from the end of a long line to the start of the next. |

### space-between-groups-twice-the-space-within · SHOULD

The space between two groups is at least twice the space between the items inside a group.

| Why |
|---|
| a reader sees what belongs together by how close it sits, and groups spaced like their items read as one list. |

### nested-radius-concentric · SHOULD

A rounded element nested in another takes the outer radius less the space between them, so both curves share a centre, and is square where that leaves nothing.

| Why |
|---|
| an inner curve as round as the outer one leaves the gap thicker at the corners than along the sides, and the nesting looks misaligned. |

### icon-stroke-matches-its-text · SHOULD

An icon beside text draws its strokes as heavy as that text's.

| Why |
|---|
| an icon heavier than its label pulls the eye from it, and a lighter one fades beside it, so the pair stops reading as one control. |

### content-image-edged-by-a-hairline · SHOULD

A content image carries a hairline inside its edge, in the text's colour at a low opacity, which darkens its edge in a light mode and lightens it in a dark one.

| Why |
|---|
| an image whose edge matches the surface around it bleeds into it, and the hairline drawn inside keeps its shape without changing its size. |

## Requirements for implementation

### ui-primitives-keep-keyboard-and-focus · MUST

The library's complex patterns follow the platform's keyboard conventions for each pattern: focus moves into a modal layer, stays in it while it is open and returns to what opened it; a layer that is not modal lets focus leave or closes when it does; a tooltip and a combobox's list never take focus; Escape dismisses a layer.

| Why |
|---|
| without it, the rule on accessible primitives cannot be kept through the library. |
