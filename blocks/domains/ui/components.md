# Components

> Governs a component: where it comes from, how it is composed, its props, size and interaction.

## Sourcing

### component-built-from-existing-ones-first · SHOULD
A component is built from existing components first — the program's own primitives searched before any is installed — then by extending a primitive, and only then on a new primitive, composed in like the others.

| Why | Tags |
|---|---|
| an existing component is already proven and known to its users; each new one is more code to keep and more for users to learn. | [ux] |

### primitive-markup-never-recreated · MUST
A primitive's markup is never re-created; a component that needs it composes the primitive.

| Why | Tags |
|---|---|
| each re-created primitive is a second version that drifts in look and behaviour, and in accessibility first. | [a11y, ux] |

### complex-pattern-built-on-accessible-primitives · MUST
A dialog, a popover, a menu, a combobox, a select, tabs, a tooltip, an accordion and their kin are built on the active library of accessible primitives; where none is active, on the platform's own element where it carries the whole pattern, and otherwise on such a library — never with roles and keys written by hand.

| Why | Tags |
|---|---|
| these patterns carry keyboard, focus and announcement behaviour that hand-built versions almost always get wrong. | [a11y, ux] |

### vendored-component-adapted-in-the-change-that-installs-it · MUST
A component installed as source is adapted in the change that installs it — restyled to the tokens, stripped of the props no call site uses, and brought under the rules on props — or rejected; it is never kept as it came.

| Why | Tags |
|---|---|
| code copied in as it came brings another project's names and looks, and stays foreign until someone changes it. | [ux] |

## Composition

### component-with-regions-is-a-compound · SHOULD
A component with a second region, an optional part that carries the caller's content, or a slot is a compound — a root with named parts, its content passed as children — never a prop per region; a leaf with a small, stable content stays a leaf.

| Why | Tags |
|---|---|
| a component with a prop per region grows a prop for every new need; a compound grows by composition. | [ux] |

### props-drilled-at-most-two-levels · SHOULD
A prop passed unchanged through more than two levels calls for composition or a nearer component that loads the data itself.

| Why | Tags |
|---|---|
| a prop threaded through components that do not use it couples them all to it. | [] |

### stateful-component-controllable-or-not · SHOULD
A component that holds a value can be driven from outside or left to itself through one interface — the value, its initial value and a change callback — and never switches between the two.

| Why | Tags |
|---|---|
| one interface serves the screen that owns the value and the one that does not, and a component that switches loses or fights the value. | [ux] |

## Props

### boolean-props-prefixed → boolean-name-is-a-positive-predicate · MUST
Every boolean prop of a component of the program's own — one it hands on to a native element or to an outside library included — starts with `is` for a state, `has` for a presence, `can` for a permission, `with` for an opt-in part that carries no content of the caller — `withDivider` — or `should` for a policy, never a bare, mixed or negated name; the component maps it to the name the element or the library takes where it hands it on — `isDisabled` handed on as `disabled` — and an outside library's own component is used under that library's names.

| Why | Tags |
|---|---|
| the prefix says what kind of switch a prop is, so a reader knows its effect from the call site, and mapping it at the one place it meets an element or a library keeps every call site of the program in one naming. | [] |

### event-props-named-on-event → concept-has-one-word · MUST
A callback prop is named `on<Event>` for the event it answers, never an action verb, a `handle` name or a bare past tense such as `submitted`.

| Why | Tags |
|---|---|
| `on<Event>` says when the callback runs and leaves what it does to the caller, and one name per event holds across every component. | [] |

### unused-props-deleted → dead-code-deleted · MUST
An optional prop no call site passes is deleted, and its default is written where it was used, save a prop of a component a package publishes to others.

| Why | Tags |
|---|---|
| an unused option is a branch nobody tests and an interface nobody needs. | [] |

### primitives-take-text-by-props · MUST
A primitive holds no user-facing text; text arrives through props, and only language-neutral glyphs — an ellipsis, a slash — and icons are its own.

| Why | Tags |
|---|---|
| a primitive with its own text cannot be translated or reworded by the application that uses it. | [ux] |

## Size

### component-sizes-to-its-container · SHOULD
A component sizes to the space its container gives it, never to the screen's.

| Why | Tags |
|---|---|
| the same component then fits a sidebar and a page, while the screen's size says nothing about the space it was given. | [ux] |

### size-change-keeps-the-users-state · SHOULD
A change of size or orientation restyles what is shown and never swaps a tree that holds state, so a region it hides keeps its data and the user's input.

| Why | Tags |
|---|---|
| turning a device or resizing a window must never erase what the user typed. | [ux, data] |

## Interaction

### button-names-its-result · SHOULD
A button names its result, verb and object — never "Submit" or "OK". "Cancel" and "Close" serve a secondary action; a confirmation of a destructive action names the action; a payment button shows the amount.

| Why | Tags |
|---|---|
| a person reads the button to know what will happen; a vague label makes them guess. | [ux] |

### long-lists-virtualised · SHOULD
A list whose length the product does not bound renders only the rows in view and those near them, or is paged.

| Why | Tags |
|---|---|
| a list that mounts every row at once grows slower with every item, and a long one freezes the device. | [performance] |

### drag-shows-grab-hold-and-targets · SHOULD
An item that can be dragged shows that it can be grabbed; while it is held, it shows that it is held, and every place that accepts it is marked.

| Why | Tags |
|---|---|
| without these marks a user cannot tell what moves, that it is moving, or where it may land. | [ux] |

## Appearance

### tokens-single-source-of-appearance · MUST
A component's appearance — colour, space, size, type, radius, shadow, motion — comes only from the tokens of the design system it uses, never from a literal value — save a value no theme names — `0`, a percentage, a viewport unit, `auto` — and a breakpoint repeated where the platform cannot read a token.

| Why | Tags |
|---|---|
| one change of a token then reaches every component, and a literal value is a look nobody can change in one place. | [ux] |

### state-is-not-a-variant · MUST
An element's state — hovered, focused, selected, open, disabled, invalid, busy — is styled from the state the element itself carries, never from a variant prop.

| Why | Tags |
|---|---|
| a look driven by a prop drifts from the state assistive technology announces, so a person sees one thing and hears another. | [a11y, ux] |

## Requirements for implementation

### ui-primitives-keep-keyboard-and-focus · MUST
The library's complex patterns follow the platform's keyboard conventions for each pattern: focus moves into a modal layer, stays in it while it is open and returns to what opened it; a layer that is not modal lets focus leave or closes when it does; a tooltip and a combobox's list never take focus; Escape dismisses a layer.

| Why | Tags |
|---|---|
| without it, the rule on accessible primitives cannot be kept through the library. | [a11y] |
