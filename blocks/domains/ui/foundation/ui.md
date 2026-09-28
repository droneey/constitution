# User interface

## Screens

## four-data-states · MUST
Every data view shows four states: loading, empty, error and content.
**Why:** an empty screen cannot otherwise be told from a slow one, and the user does not know what to do.
**Check:** test
**Tags:** ux, a11y

## state-messages-guide-the-user · SHOULD
An error says what happened and what to do next. An empty state names the situation and offers an action; a state with no results repeats the query. A long load names what it is doing and shows progress when it is known.
**Why:** each state is a moment the user decides what to do, and a message that does not help them leaves them stuck.
**Check:** review
**Tags:** ux

## button-names-its-result · SHOULD
A button names its result, verb and object — never "Submit" or "OK". "Cancel" and "Close" serve a secondary action; a confirmation of a destructive action names the action; a payment button shows the amount.
**Why:** a person reads the button to know what will happen; a vague label makes them guess.
**Check:** review
**Tags:** ux

## Components

## compose-before-authoring · SHOULD
A need is met by existing components first, then by extending a primitive, and only then by a new primitive that is composed in. A primitive's markup is never re-created.
**Why:** each re-created primitive is a second version that drifts in look and behaviour, and in accessibility first.
**Check:** review
**Tags:** architecture, ux

## complex-patterns-on-accessible-primitives · MUST
A dialog, popover, menu, combobox, select, tabs, tooltip, accordion and their kin are built on the accessible primitive library, never by hand.
**Why:** these patterns carry keyboard, focus and announcement behaviour that hand-built versions almost always get wrong.
**Check:** review
**Tags:** a11y, ux

## compound-over-prop-regions · SHOULD
A component with a second region, an optional part or a slot is a compound: a root with named parts, its content passed as children. A leaf stays a leaf; a recurring arrangement becomes a widget.
**Why:** a component with a prop per region grows a prop for every new need; a compound grows by composition.
**Check:** review
**Tags:** architecture, ux

## compound-root-owns-choreography · SHOULD
The root of a compound owns the choreography of its animated regions and shares it through the compound's context.
**Why:** regions that animate on their own drift out of step; one owner keeps them in time.
**Check:** review
**Tags:** architecture, ux

## boolean-props-prefixed · MUST
A boolean prop starts with `is` for a state, `has` for content, `with` for an opt-in part, `should` for a policy, or `as` for a polymorphic render; never a bare, mixed or negated name.
**Why:** the prefix says what kind of switch a prop is, so a reader knows its effect from the call site.
**Check:** review
**Tags:** naming
**Implements:** `booleans-read-as-predicates`

## event-props-named-on-event · MUST
A callback prop is named `on<Event>`, and the handler inside the component may be `handle<Event>`. A prop is never an action verb, a `handle` name or a past tense.
**Why:** `on<Event>` says when the callback runs, and leaves what it does to the caller.
**Check:** review
**Tags:** naming
**Implements:** `no-empty-verbs`

## one-prop-name-per-meaning · SHOULD
Before a prop is added, the existing name for the same meaning is reused; synonyms are converged in the change that finds them.
**Why:** one name per meaning across components makes every component's API guessable.
**Check:** review
**Tags:** naming
**Implements:** `one-word-per-concept`

## unused-props-deleted · SHOULD
An optional prop no call site uses is deleted, and its default inlined.
**Why:** an unused option is a branch nobody tests and an API nobody needs.
**Check:** review
**Tags:** architecture
**Implements:** `no-dead-code`

## components-size-to-their-container · SHOULD
A component sizes to its container, not to the screen. A breakpoint restyles and never swaps a tree that holds state; a hidden region keeps its data.
**Why:** the same component then works in a sidebar and a page, and turning a device never erases what the user typed.
**Check:** review
**Tags:** ux

## drag-shows-its-state · SHOULD
Drag and drop shows that an item can be grabbed, that it is grabbed, where it can land, and a preview of the result.
**Why:** a drag without feedback is a guess, and a dropped item lands where the user did not mean.
**Check:** review
**Tags:** ux

## targets-meet-platform-minimum · MUST
Every target meets the platform's minimum size, counting its padding.
**Why:** a target smaller than a finger or a tremor allows is missed, and the wrong action runs.
**Check:** review
**Tags:** a11y, ux

## How an interface is proven

## screen-spec-proves-states-and-interactions · SHOULD
A screen's spec proves each data state, each interaction that changes something, each message the user sees and each navigation.
**Why:** that is what a person does with a screen; a spec that proves it fails when their experience changes.
**Check:** test
**Tags:** testing, ux
**Implements:** `spec-per-boundary`

## component-spec-proves-behaviour-and-keyboard · SHOULD
A reusable component's spec proves the variants that change behaviour or meaning, its keyboard use, its focus, and its accessible name, role and state.
**Why:** a component used on many screens breaks all of them at once; its spec is where that is caught.
**Check:** test
**Tags:** testing, a11y
**Implements:** `spec-per-boundary`

## elements-found-by-role-label-text · SHOULD
A spec finds elements by role, label and text, never by class or internal state.
**Why:** a spec that finds elements as a user does changes only when the behaviour does.
**Check:** review
**Tags:** testing, a11y
**Implements:** `assert-what-a-caller-observes`

## screenshots-only-where-look-is-contract · SHOULD
Appearance is compared by screenshot only where the look is the contract: in the design system.
**Why:** screenshots elsewhere fail on every harmless change of style and are approved without reading.
**Check:** review
**Tags:** testing, ux
**Implements:** `no-unreadable-snapshots`

## Requirements for implementation

What any library of interface primitives must provide.

## ui-primitives-keyboard-and-focus · MUST
Complex patterns follow the platform's keyboard conventions; focus moves into a layer, stays in it and returns from it; Escape dismisses it.
**Why:** without it, the rule on accessible primitives cannot be followed through the library.
**Check:** review
**Tags:** a11y

## ui-primitives-unstyled · SHOULD
Primitives carry no look of their own.
**Why:** the look comes from the design system's tokens, and a primitive's own styles fight them.
**Check:** review
**Tags:** ux

## ui-primitives-slot · SHOULD
A slot renders the consumer's element with the primitive's behaviour.
**Why:** a link or a custom element can then take a primitive's behaviour without wrapping it in another element.
**Check:** review
**Tags:** architecture
