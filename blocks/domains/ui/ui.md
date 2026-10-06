---
id: ui
summary: Screens, components and the design system of any user interface.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**/ui/**", "**/components/**", "**/widgets/**"]
---

# User interface

> Screens a person sees and uses: how they are composed, where their state lives, how components are built and named, and how a user interface is proven. Its look — tokens and variants — is in the chapter `design-system`, and what it must let every person do, whatever their sight, hearing, movement or attention, in the chapter `a11y`.

## Screens

### data-states-shown · MUST
Every data view shows loading, error and content, and the empty or not-found state its data can have.

| Why | Tags |
|---|---|
| an empty screen cannot otherwise be told from a slow one, and the user does not know what to do. | [ux, a11y] |

### failure-contained-to-its-screen · MUST
A failure while a screen loads or renders costs that screen alone: the screen shows it in its own place, and the rest of the application stays usable.

| Why | Tags |
|---|---|
| a failure in one screen then costs that screen, not the whole application, and the user is never left with a blank page. | [errors, ux] |

### state-messages-guide-the-user · SHOULD
An empty state names the situation and offers an action; a state with no results repeats the query. A long load names what it is doing and shows progress when it is known.

| Why | Tags |
|---|---|
| each state is a moment the user decides what to do, and a message that does not help them leaves them stuck. | [ux] |

### unknown-address-shows-the-not-found-screen · SHOULD
An address no screen answers shows the application's not-found screen, which is not the not-found state of a view whose data is missing.

| Why | Tags |
|---|---|
| a mistyped or stale link otherwise ends on a blank page or an error, and the user cannot tell a wrong address from a broken application. | [ux] |

### address-parsed-as-untrusted-input → outside-values-untyped-until-parsed
A screen's address — its path and its parameters, in a URL or a deep link — reaches the screen only after a schema parses it; an address that fails the parse opens the screen with its defaults or a fallback screen, never a crash or a half-filled one.

| Why | Tags |
|---|---|
| anyone can write a link and send it to the user, so a malformed one is to be expected, and it must not break the program. | [data] |

### address-write-keeps-the-other-parameters · MUST
A write to a screen's address changes only the parameter it is for and keeps every other one as it was.

| Why | Tags |
|---|---|
| a screen that changes its page must keep the filter another piece set, or the link no longer reproduces the view the user built. | [ux] |

### view-state-homes → one-home-per-datum
View state a link or a restart must reproduce lives in the platform's navigation state, and ephemeral state in the component that shows it.

| Why | Tags |
|---|---|
| state kept in the wrong home is lost on reload, shared by accident, or copied until the copies disagree. | [] |

### button-names-its-result · SHOULD
A button names its result, verb and object — never "Submit" or "OK". "Cancel" and "Close" serve a secondary action; a confirmation of a destructive action names the action; a payment button shows the amount.

| Why | Tags |
|---|---|
| a person reads the button to know what will happen; a vague label makes them guess. | [ux] |

## Components

### compose-before-authoring · SHOULD
A need is met by existing components first, then by extending a primitive, and only then by a new primitive that is composed in.

| Why | Tags |
|---|---|
| an existing component is already proven and known to its users; each new one is more code the team keeps and more for users to learn. | [ux] |

### primitive-markup-never-recreated · MUST
A primitive's markup is never re-created.

| Why | Tags |
|---|---|
| each re-created primitive is a second version that drifts in look and behaviour, and in accessibility first. | [a11y, ux] |

### complex-patterns-on-accessible-primitives · MUST
A dialog, popover, menu, combobox, select, tabs, tooltip, accordion and their kin are built on the active library of accessible primitives; where none is active, on the platform's own element where it carries the whole pattern, and otherwise on such a library; never with roles and keys written by hand.

| Why | Tags |
|---|---|
| these patterns carry keyboard, focus and announcement behaviour that hand-built versions almost always get wrong. | [a11y, ux] |

### compound-over-prop-regions · SHOULD
A component with a second region, an optional part or a slot is a compound: a root with named parts, its content passed as children. A leaf stays a leaf; a recurring arrangement becomes a component of its own. The signs that call for one: a `withX` or `hasX` switch that adds a part, an array prop mapped into children, a child prop named after a position.

| Why | Tags |
|---|---|
| a component with a prop per region grows a prop for every new need; a compound grows by composition. | [ux] |

### compound-root-owns-choreography · SHOULD
The root of a compound owns the choreography of its animated regions and shares it through the compound's context.

| Why | Tags |
|---|---|
| regions that animate on their own drift out of step; one owner keeps them in time. | [ux] |

### boolean-props-prefixed → booleans-read-as-predicates · MUST
A boolean prop starts with `is` for a state, `has` for content, `with` for an opt-in part, or `should` for a policy; never a bare, mixed or negated name, except a name the platform's element or the primitive library already gives the same meaning — `disabled`, `open`, `checked`, `required`.

| Why | Tags |
|---|---|
| the prefix says what kind of switch a prop is, so a reader knows its effect from the call site. | [] |

### event-props-named-on-event → no-empty-verbs · MUST
A callback prop is named `on<Event>`, and the handler inside the component may be `handle<Event>`. A prop is never an action verb, a `handle` name or a bare past tense (`submitted`).

| Why | Tags |
|---|---|
| `on<Event>` says when the callback runs, and leaves what it does to the caller. | [] |

### one-prop-name-per-meaning → one-word-per-concept
Before a prop is added, the existing name for the same meaning is reused; synonyms are converged in the change that finds them.

| Why | Tags |
|---|---|
| one name per meaning across components makes every component's API guessable. | [] |

### unused-props-deleted → no-dead-code
An optional prop no call site uses is deleted, and its default inlined.

| Why | Tags |
|---|---|
| an unused option is a branch nobody tests and an API nobody needs. | [] |

### vendored-components-adapted-on-arrival · SHOULD
A component installed as source is, in the change that installs it, restyled to tokens, stripped of unused props and made to follow the prop rules. The existing primitives are searched first; the component is integrated or rejected, never kept as it came.

| Why | Tags |
|---|---|
| code copied in as it came brings another project's names and looks, and stays foreign until someone changes it. | [ux] |

### props-drilled-at-most-two-levels · SHOULD
A prop passed unchanged through more than two levels calls for composition or a nearer component that loads the data itself.

| Why | Tags |
|---|---|
| a prop threaded through components that do not use it couples them all to it. | [] |

### components-size-to-their-container · SHOULD
A component sizes to its container, not to the screen. A breakpoint restyles and never swaps a tree that holds state; a hidden region keeps its data.

| Why | Tags |
|---|---|
| the same component then works in a sidebar and a page, and turning a device never erases what the user typed. | [ux] |

### drag-shows-its-state · SHOULD
Drag and drop shows that an item can be grabbed, that it is grabbed, where it can land, and a preview of the result.

| Why | Tags |
|---|---|
| a drag without feedback is a guess, and a dropped item lands where the user did not mean. | [ux] |

### fast-source-updates-once-per-frame · SHOULD
A fast source — a resize, a scroll, a stream — updates state at most once per frame, folding its events in batches.

| Why | Tags |
|---|---|
| dozens of updates a second redraw nothing the user can see and starve everything else. | [performance] |

### targets-meet-platform-minimum · MUST
Every target meets the platform's minimum size, counting its padding.

| Why | Tags |
|---|---|
| a target smaller than a finger or a tremor allows is missed, and the wrong action runs. | [a11y, ux] |

### primitives-take-text-by-props · MUST
The primitive library holds no user-facing text; text arrives through props.

| Why | Tags |
|---|---|
| a primitive with its own text cannot be translated or reworded by the application that uses it. | [ux] |

### stateful-component-controllable-or-not · SHOULD
A component that holds a value can be driven from outside or left to itself through one interface — the value, its initial value and a change callback — and never switches between the two.

| Why | Tags |
|---|---|
| one interface serves the screen that owns the value and the one that does not, and a component that switches loses or fights the value. | [ux] |

### primitive-passes-its-element-through · SHOULD
A primitive accepts its element's own props and reference, and merges its own props and handlers with the caller's.

| Why | Tags |
|---|---|
| without it every consumer wraps or forks the primitive for one attribute. | [ux] |

### long-lists-virtualised · SHOULD
A list that can grow renders only the rows in view and those near them, through a virtualised list.

| Why | Tags |
|---|---|
| a list that mounts every row at once grows slower with every item, and a long one freezes the device. | [performance] |

### loading-never-replaces-shown-content · SHOULD
A refetch or a transition keeps the content already shown in place, and a first-load indicator appears only after a short delay, in the content's own space.

| Why | Tags |
|---|---|
| content that blinks to a skeleton on every refresh reads as a failure, and a late indicator that moves the layout makes the user lose their place. | [ux] |

### fields-validated-on-leave-or-submit · MUST
A form validates a field when the field is left or the form is submitted, not on every keystroke.

| Why | Tags |
|---|---|
| a user told off while still typing learns to ignore the message. | [ux] |

### form-validated-by-its-own-schema · SHOULD
A form validates its fields through its schema.

| Why | Tags |
|---|---|
| the form refuses bad input before it is sent, by the same rules that decide what it sends. | [ux] |

### submit-busy-while-submitting · SHOULD
A form never submits twice: while it submits, a repeat submit is ignored, and the button shows it is busy with a busy label, keeping its focus.

| Why | Tags |
|---|---|
| a button taken out of reach drops focus to the page and says nothing; a busy one keeps both. | [ux, a11y] |

## How a user interface is proven

### screen-spec-proves-states-and-interactions → spec-per-boundary
A screen's spec proves each data state, each interaction that changes something, each message the user sees and each navigation.

| Why | Tags |
|---|---|
| that is what a person does with a screen; a spec that proves it fails when their experience changes. | [ux] |

### component-spec-proves-behaviour-and-keyboard → spec-per-boundary
A reusable component's spec proves the variants that change behaviour or meaning, its keyboard use, its focus, and its accessible name, role and state.

| Why | Tags |
|---|---|
| a component used on many screens breaks all of them at once; its spec is where that is caught. | [a11y] |

### elements-found-by-role-label-text → assert-what-a-caller-observes · MUST
A spec finds elements by role, label and text, never by class or internal state.

| Why | Tags |
|---|---|
| a spec that finds elements as a user does changes only when the behaviour does. | [a11y] |

### layout-and-focus-proven-on-the-platform · SHOULD
Behaviour that depends on layout, visibility or real focus is proven where the platform renders it — an end-to-end spec, or a component spec the platform's own engine runs — never only in a simulation of the platform.

| Why | Tags |
|---|---|
| a simulated screen computes no layout and fakes focus, so a spec there passes while the element is hidden, covered or unreachable. | [a11y, testing] |

### screenshots-only-where-look-is-contract → no-unreadable-snapshots
Appearance is compared by screenshot only where the look is the contract: in the design system.

| Why | Tags |
|---|---|
| screenshots elsewhere fail on every harmless change of style and are approved without reading. | [ux] |

## Requirements for implementation

What any library of user-interface primitives must provide.

### ui-primitives-keyboard-and-focus · MUST
Complex patterns follow the platform's keyboard conventions; focus moves into a layer, stays in it and returns from it; Escape dismisses it.

| Why | Tags |
|---|---|
| without it, the rule on accessible primitives cannot be followed through the library. | [a11y] |

### ui-primitives-unstyled · SHOULD
Primitives carry no look of their own.

| Why | Tags |
|---|---|
| the look comes from the design system's tokens, and a primitive's own styles fight them. | [ux] |

### ui-primitives-slot · SHOULD
A slot renders the consumer's element with the primitive's behaviour.

| Why | Tags |
|---|---|
| a link or a custom element can then take a primitive's behaviour without wrapping it in another element. | [] |
