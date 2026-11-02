# Components

> Governs a component: where it comes from, how it is composed, its props, size, actions and appearance.

## Sourcing

### component-built-from-existing-ones-first · SHOULD

A component is built from existing components first. The program's own primitives are searched before any is installed; then a primitive is extended, and only then a new primitive is composed in like the others.

| Why |
|---|
| a component built anew where one existed is more code to keep and prove, and one more way of doing the same thing for its users to learn. |

### primitive-markup-never-recreated · MUST

A primitive's markup is never re-created. A component that needs it composes the primitive.

| Why |
|---|
| each re-created primitive is a second version that drifts in look and behaviour, and in accessibility first — DRY. |

### complex-pattern-built-on-accessible-primitives · MUST

A complex pattern is built on accessible primitives. A dialog, a popover, a menu, a combobox, a select, tabs, a tooltip, an accordion and their kin are built on the active library of accessible primitives; where none is active, on the platform's own element where it carries the whole pattern, and otherwise on such a library — never with roles and keys written by hand.

| Why |
|---|
| these patterns carry keyboard, focus and announcement behaviour that hand-built versions almost always get wrong. |

### vendored-component-adapted-in-the-change-that-installs-it · MUST

A component installed as source is adapted in the change that installs it, or rejected. It is restyled to the tokens, stripped of the props no call site uses and brought under the rules on props; it is rejected when the kit already holds an equivalent, and never kept as it came.

| Why |
|---|
| code copied in as it came brings another project's names and looks, and stays foreign until someone changes it. |

## Composition

### component-with-regions-is-a-compound · SHOULD

A component with regions is a compound. That holds for a component with a second region, an optional part that carries the caller's content, or a slot: it is a root with named parts, and each region takes the caller's content as composition — children, a named part, or a slot parameter that takes content —, never as data the component lays out itself; a leaf with a small, stable content stays a leaf.

| Why |
|---|
| a component that lays out data handed in for each region grows a parameter and a branch for every new need, while a compound takes the need as composition — compound components. |

### stateful-component-controllable-or-not · SHOULD

A component that holds a value can be controlled or left to itself. It offers both through one set of props — the value, its initial value and a change callback — or as a pair of functions, the stateful one wrapping the controlled one, and one use of it never switches between the two.

| Why |
|---|
| a component only one kind of screen can drive is forked for the other, and one that switches between the two loses or fights the value. |

### passing-state-kept-in-its-component · SHOULD

Passing state — an open menu, a hover — lives in the component that shows it.

| Why |
|---|
| state lifted above the component that shows it is shared by accident and copied until the copies disagree. |

## Props

### boolean-props-prefixed → boolean-name-is-a-positive-predicate · MUST

Every boolean prop of the program's own components is prefixed by its kind. The prefix is `is` for a state, `has` for a presence, `can` for a permission, `with` for an opt-in part that carries no content of the caller, or `should` for a policy, never a bare, mixed or negated name, and this holds for a prop the component hands on to a native element or to an outside library too. The component maps it to the name the element or the library takes where it hands it on, and an outside library's own component is used under that library's names.

| Why |
|---|
| a bare or negated boolean leaves the reader of a call site guessing what kind of switch it is and which way it turns, and a prop named the library's way at some call sites splits the program into two namings. |

### event-props-named-on-event · MUST

A callback prop is named **`on<Event>`**{#event-callback} for the event it answers. That form is a default a framework's block respells under its id, and the prop is never named by an action verb, a `handle` name or a bare past tense such as `submitted`.

| Why |
|---|
| a callback named for an action states what its caller will do, which the component cannot know, and names that differ by component turn one event into several words. |

### unused-props-deleted → dead-code-deleted · MUST

An optional prop no call site passes is deleted. Its default is written where it was used, save a prop of a component a package publishes to others.

| Why |
|---|
| an unused option is a branch nobody tests and a prop every reader learns for nothing — you aren't gonna need it. |

### primitives-take-text-by-props · MUST

A primitive holds no user-facing text. Text arrives through props, and only language-neutral glyphs — an ellipsis, a slash — and icons are its own.

| Why |
|---|
| a primitive with its own text cannot be translated or reworded by the program that uses it. |

## Size

### component-sizes-to-its-container · SHOULD

A component sizes to the space its container gives it, never to the screen's.

| Why |
|---|
| a component sized to the screen overflows a narrow container on a wide screen, since the screen's size says nothing about the space it was given. |

### size-change-keeps-the-users-state · SHOULD

A change of size or orientation keeps the user's state. It restyles what is shown and never swaps a tree that holds state, so a region it hides keeps its data and the user's input.

| Why |
|---|
| a tree swapped on a change of size erases what the user typed when they turn a device or resize a window. |

### truncated-text-reachable-in-full · SHOULD

Text cut to fit can be read in full. Text truncated or clamped to a number of lines can be read on its own screen, in a view that expands it, or in a tooltip that keyboard and touch reach as well.

| Why |
|---|
| the part cut off is often the one that tells two items apart, and a user who cannot read it cannot choose between them. |

## Actions

### destructive-action-confirmed-or-undoable · MUST

A destructive action can be undone or is confirmed first. An action is destructive when it deletes the user's data, spends their money or commits them to an agreement, and it is confirmed when the user has reviewed it before it takes effect.

| Why |
|---|
| a slip on such an action costs the user something they cannot get back. |

## Appearance

### tokens-single-source-of-appearance · MUST

A component's appearance comes only from tokens. Its colour, space, size, type, radius, shadow and motion come from the tokens of the design system it uses, never from a literal value, save a value no theme names — `0`, a percentage, a viewport unit, `auto` — and a breakpoint repeated where the platform cannot read a token.

| Why |
|---|
| a literal value is a look no change of token reaches, so a theme changes every component but the ones that wrote it in place — a single source of truth. |

### state-is-not-a-variant · MUST

An element's state is never a variant. Its state — hovered, focused, selected, open, disabled, invalid, busy — is styled from the state the element itself carries, never from a variant prop.

| Why |
|---|
| a look driven by a prop drifts from the state assistive technology announces, so a person sees one thing and hears another. |

### changing-numbers-use-fixed-width-digits · SHOULD

Changing numbers are set in digits of one width. That holds for a number that changes in place — a timer, a counter, a total — and for a column of numbers to compare.

| Why |
|---|
| digits of different widths make a changing number jitter, and a column of them misaligns the places a reader compares. |

### long-text-line-length-bounded · SHOULD

Long-form text is set at no more than 80 characters a line. That holds for an article or a page of help, and the bound is 40 in Chinese, Japanese and Korean.

| Why |
|---|
| the eye loses its place on the way back from the end of a long line to the start of the next, so the reader rereads or skips a line — WCAG 2.2, Visual Presentation, a criterion of level AAA. |

## Requirements for implementation

### ui-primitives-keep-keyboard-and-focus · MUST

The library's complex patterns follow the platform's keyboard conventions. For each pattern, focus moves into a modal layer, stays in it while it is open and returns to what opened it; a layer that is not modal lets focus leave or closes when it does; a tooltip and a combobox's list never take focus; Escape dismisses a layer.

| Why |
|---|
| a library whose patterns break these conventions leaves a keyboard or screen-reader user unable to enter, leave or move through a dialog or a menu built on it, however carefully the program composes it. |

### ui-styling-restricted-to-tokens · MUST

The library lets its default scales be reset, so a check rejects a value outside the tokens.

| Why |
|---|
| a library whose default scales cannot be reset lets a value outside the tokens be written unseen, and that look stays as it was when the theme changes. |
