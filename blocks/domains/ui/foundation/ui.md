# User interface

## Screens

## four-data-states · MUST
Every data view shows loading, error and content, and the empty or not-found state its data can have.

| Why | Check | Tags |
|---|---|---|
| an empty screen cannot otherwise be told from a slow one, and the user does not know what to do. | test | [ux, a11y] |

## state-messages-guide-the-user · SHOULD
An error says what happened and what to do next. An empty state names the situation and offers an action; a state with no results repeats the query. A long load names what it is doing and shows progress when it is known.

| Why | Check | Tags |
|---|---|---|
| each state is a moment the user decides what to do, and a message that does not help them leaves them stuck. | review | [ux] |

## button-names-its-result · SHOULD
A button names its result, verb and object — never "Submit" or "OK". "Cancel" and "Close" serve a secondary action; a confirmation of a destructive action names the action; a payment button shows the amount.

| Why | Check | Tags |
|---|---|---|
| a person reads the button to know what will happen; a vague label makes them guess. | review | [ux] |

## Components

## compose-before-authoring · SHOULD
A need is met by existing components first, then by extending a primitive, and only then by a new primitive that is composed in.

| Why | Check | Tags |
|---|---|---|
| each re-created primitive is a second version that drifts in look and behaviour, and in accessibility first. | review | [ux] |

## primitive-markup-never-recreated → compose-before-authoring · MUST
A primitive's markup is never re-created: a need it does not meet extends it, or a new primitive is composed beside it.

| Why | Check | Tags |
|---|---|---|
| each re-created primitive is a second version that drifts in look and behaviour, and in accessibility first. | review | [ux, a11y] |

## complex-patterns-on-accessible-primitives · MUST
A dialog, popover, menu, combobox, select, tabs, tooltip, accordion and their kin are built on the platform's own element where it carries the whole pattern — `<dialog>`, `popover`, `<details>` — and otherwise on the accessible primitive library; never with roles and keys written by hand.

| Why | Check | Tags |
|---|---|---|
| these patterns carry keyboard, focus and announcement behaviour that hand-built versions almost always get wrong. | review | [a11y, ux] |

## compound-over-prop-regions · SHOULD
A component with a second region, an optional part or a slot is a compound: a root with named parts, its content passed as children. A leaf stays a leaf; a recurring arrangement becomes a component of its own. The signs that call for one: a `withX` or `hasX` switch that adds a part, an array prop mapped into children, a child prop named after a position.

| Why | Check | Tags |
|---|---|---|
| a component with a prop per region grows a prop for every new need; a compound grows by composition. | review | [ux] |

## compound-root-owns-choreography · SHOULD
The root of a compound owns the choreography of its animated regions and shares it through the compound's context.

| Why | Check | Tags |
|---|---|---|
| regions that animate on their own drift out of step; one owner keeps them in time. | review | [ux] |

## boolean-props-prefixed → booleans-read-as-predicates · MUST
A boolean prop starts with `is` for a state, `has` for content, `with` for an opt-in part, `should` for a policy, or `as` for a polymorphic render; never a bare, mixed or negated name, except a name the platform's element or the primitive library already gives the same meaning — `disabled`, `open`, `checked`, `required`.

| Why | Check | Tags |
|---|---|---|
| the prefix says what kind of switch a prop is, so a reader knows its effect from the call site. | review | [] |

## event-props-named-on-event → no-empty-verbs · MUST
A callback prop is named `on<Event>`, and the handler inside the component may be `handle<Event>`. A prop is never an action verb, a `handle` name or a past tense.

| Why | Check | Tags |
|---|---|---|
| `on<Event>` says when the callback runs, and leaves what it does to the caller. | review | [] |

## one-prop-name-per-meaning → one-word-per-concept
Before a prop is added, the existing name for the same meaning is reused; synonyms are converged in the change that finds them.

| Why | Check | Tags |
|---|---|---|
| one name per meaning across components makes every component's API guessable. | review | [] |

## unused-props-deleted → no-dead-code
An optional prop no call site uses is deleted, and its default inlined.

| Why | Check | Tags |
|---|---|---|
| an unused option is a branch nobody tests and an API nobody needs. | review | [] |

## vendored-components-adapted-on-arrival · SHOULD
A component installed as source is, in the change that installs it, restyled to tokens, stripped of unused props and made to follow the prop rules. The existing primitives are searched first; the component is integrated or rejected, never kept as it came.

| Why | Check | Tags |
|---|---|---|
| code copied in as it came brings another project's names and looks, and stays foreign until someone changes it. | review | [ux] |

## props-drilled-at-most-two-levels → talk-only-to-neighbours
A prop passed unchanged through more than two levels calls for composition or a nearer component that loads the data itself.

| Why | Check | Tags |
|---|---|---|
| a prop threaded through components that do not use it couples them all to it. | review | [] |

## components-size-to-their-container · SHOULD
A component sizes to its container, not to the screen. A breakpoint restyles and never swaps a tree that holds state; a hidden region keeps its data.

| Why | Check | Tags |
|---|---|---|
| the same component then works in a sidebar and a page, and turning a device never erases what the user typed. | review | [ux] |

## drag-shows-its-state · SHOULD
Drag and drop shows that an item can be grabbed, that it is grabbed, where it can land, and a preview of the result.

| Why | Check | Tags |
|---|---|---|
| a drag without feedback is a guess, and a dropped item lands where the user did not mean. | review | [ux] |

## fast-source-updates-once-per-frame · SHOULD
A fast source — a resize, a scroll, a stream — updates state at most once per frame, folding its events in batches.

| Why | Check | Tags |
|---|---|---|
| dozens of updates a second redraw nothing the user can see and starve everything else. | review | [performance] |

## targets-meet-platform-minimum · MUST
Every target meets the platform's minimum size, counting its padding.

| Why | Check | Tags |
|---|---|---|
| a target smaller than a finger or a tremor allows is missed, and the wrong action runs. | review | [a11y, ux] |

## stateful-component-controllable-or-not · SHOULD
A component that holds a value can be driven from outside or left to itself through one interface — the value, its initial value and a change callback — and never switches between the two.

| Why | Check | Tags |
|---|---|---|
| one interface serves the screen that owns the value and the one that does not, and a component that switches loses or fights the value. | review | [ux] |

## primitive-passes-its-element-through · SHOULD
A primitive accepts its element's own props and reference, and merges its own props and handlers with the caller's.

| Why | Check | Tags |
|---|---|---|
| without it every consumer wraps or forks the primitive for one attribute. | review | [ux] |

## loading-never-replaces-shown-content · SHOULD
A refetch or a transition keeps the content already shown in place, and a first-load indicator appears only after a short delay, in the content's own space.

| Why | Check | Tags |
|---|---|---|
| content that blinks to a skeleton on every refresh reads as a failure, and a late indicator that moves the layout makes the user lose their place. | review | [ux] |
## submit-busy-while-submitting · SHOULD
A form never submits twice: while it submits, a repeat submit is ignored, and the button shows it is busy with `aria-disabled` and a busy label, keeping its focus.

| Why | Check | Tags |
|---|---|---|
| a disabled button drops focus to the page and says nothing; a busy one keeps both. | review | [ux, a11y] |

## How a user interface is proven

## screen-spec-proves-states-and-interactions → spec-per-boundary
A screen's spec proves each data state, each interaction that changes something, each message the user sees and each navigation.

| Why | Check | Tags |
|---|---|---|
| that is what a person does with a screen; a spec that proves it fails when their experience changes. | test | [ux] |

## component-spec-proves-behaviour-and-keyboard → spec-per-boundary
A reusable component's spec proves the variants that change behaviour or meaning, its keyboard use, its focus, and its accessible name, role and state.

| Why | Check | Tags |
|---|---|---|
| a component used on many screens breaks all of them at once; its spec is where that is caught. | test | [a11y] |

## elements-found-by-role-label-text → assert-what-a-caller-observes
A spec finds elements by role, label and text, never by class or internal state.

| Why | Check | Tags |
|---|---|---|
| a spec that finds elements as a user does changes only when the behaviour does. | review | [a11y] |

## layout-and-focus-proven-on-the-platform · SHOULD
Behaviour that depends on layout, visibility or real focus is proven where the platform renders it — an end-to-end spec, or a component spec the platform's own engine runs — never only in a simulation of the platform.

| Why | Check | Tags |
|---|---|---|
| a simulated screen computes no layout and fakes focus, so a spec there passes while the element is hidden, covered or unreachable. | review | [a11y, testing] |

## screenshots-only-where-look-is-contract → no-unreadable-snapshots
Appearance is compared by screenshot only where the look is the contract: in the design system.

| Why | Check | Tags |
|---|---|---|
| screenshots elsewhere fail on every harmless change of style and are approved without reading. | review | [ux] |

## Requirements for implementation

What any library of user-interface primitives must provide.

## ui-primitives-keyboard-and-focus · MUST
Complex patterns follow the platform's keyboard conventions; focus moves into a layer, stays in it and returns from it; Escape dismisses it.

| Why | Check | Tags |
|---|---|---|
| without it, the rule on accessible primitives cannot be followed through the library. | review | [a11y] |

## ui-primitives-unstyled · SHOULD
Primitives carry no look of their own.

| Why | Check | Tags |
|---|---|---|
| the look comes from the design system's tokens, and a primitive's own styles fight them. | review | [ux] |

## ui-primitives-slot · SHOULD
A slot renders the consumer's element with the primitive's behaviour.

| Why | Check | Tags |
|---|---|---|
| a link or a custom element can then take a primitive's behaviour without wrapping it in another element. | review | [] |
