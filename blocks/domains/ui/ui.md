---
id: ui
kind: domain
summary: Screens, components and the design system of any user interface.
chapters: [design-system.md]
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: ["**/ui/**", "**/components/**", "**/widgets/**"]
status: stable
---

# User interface

> Screens a person sees and uses: how they are composed, where their state lives, how components are built and named, and how an interface is proven. Its look — tokens and variants — is in the chapter `design-system`.

**Vocabulary.** Folders: `ui` — a feature's presentation layer, and also `root/ui`, `shared/ui`, `libs/ui`; `components` — presentational; `widgets` — smart; `assets` — icons, images and fonts. Suffix: `.variants`. A feature adds `ui/{components,widgets}/`. The screens are the delivery layer; the router's block names their folder.

## Screens

## screen-composes-the-page · SHOULD
A screen owns its navigation state: it reads and validates it, loads its data or delegates the loading, and composes the page from widgets and pieces private to it. A piece receives data and `on<Event>` callbacks and never knows which screen it sits on.
**Why:** the screen is the one place that knows its address and its data, so every piece stays reusable and testable alone.
**Check:** review
**Tags:** architecture, ux
**Implements:** `delivery-units-stay-thin`

## pieces-never-touch-navigation · MUST
A presentational component or a screen's piece imports no navigation or route-parameter primitive.
**Why:** a piece that navigates by itself works on one screen only, and its behaviour hides from the screen that composes it.
**Check:** tool — architecture
**Tags:** architecture

## navigation-passed-by-slot · SHOULD
Navigation reaches a presentational component through a slot that renders the link — its children first, then the data; any other action reaches it through a callback.
**Why:** the component stays free of the router, and the link stays a real link the platform can open, share and announce.
**Check:** review
**Tags:** architecture, ux

## screen-private-pieces-beside-screen · SHOULD
Pieces and binding units private to one screen live beside it, private to it. A layout composes the state its screens share in binding units of its own.
**Why:** what one screen uses changes with that screen, and nothing else can reach it by accident.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `delivery-unit-beside-what-it-serves`

## screen-loads-pieces-render · SHOULD
By default the screen loads the data and its pieces render it. A piece takes a binding unit of its own only when a single loading point hurts, decided per screen.
**Why:** one loading point shows one loading state and one error, instead of a page that fills in piece by piece.
**Check:** review
**Tags:** architecture, performance

## screen-guards-through-auth-surface · SHOULD
Guards and redirects of a screen live in the screens layer and use the surface of the feature that owns sessions; feature interfaces adapt to permissions passed down by composition.
**Why:** access is decided before the screen renders, in one layer, and no feature reaches into the session's internals.
**Check:** review
**Tags:** security, architecture
**Implements:** `access-denied-unless-granted`

## error-boundary-per-screen · MUST
Every screen sits inside an error boundary that says what happened and what to do next, and one boundary in `root/` catches what the screens do not.
**Why:** a failure in one screen then costs that screen, not the whole application, and the user is never left with a blank page.
**Check:** review
**Tags:** errors, ux
**Implements:** `one-error-handler-per-transport`

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

## view-state-homes · SHOULD
Each kind of state has one home: remote data in its cache; view state a link or a restart must reproduce in the platform's navigation state; ephemeral state in its component; the few global concerns — theme, session, notices — in one small store.
**Why:** state kept in the wrong home is lost on reload, shared by accident, or copied until the copies disagree.
**Check:** review
**Tags:** data, architecture
**Implements:** `one-home-per-datum`

## form-reuses-domain-predicates · SHOULD
A form's schema composes the predicates of the value objects and sits with the form; it never restates an invariant.
**Why:** a rule checked in two places drifts, and the form then accepts what the domain rejects.
**Check:** review
**Tags:** data, types
**Implements:** `value-objects-guard-their-invariant`

## Components

## component-home-by-knowledge · SHOULD
A component lives where its knowledge lives: used by one screen, beside it; knows a feature, in that feature's `ui/`; a generic primitive, in `libs/ui`; specific to the application and used by two or more features, in `shared/ui`; the application's shell, in `root/ui`.
**Why:** a component placed by what it knows can be found, and it moves only when its knowledge does.
**Check:** review
**Tags:** architecture
**Implements:** `code-lives-with-its-reason-to-change`

## component-named-by-location · SHOULD
A component's folder name carries its location and role: no prefix in `libs/ui` and `shared/ui`, `root-` in `root/ui`, the feature's name in a feature, and `-widget` on every widget.
**Why:** the name alone tells where a component comes from and whether it holds logic.
**Check:** tool — names
**Tags:** naming
**Implements:** `folder-named-for-purpose-or-role`

## components-dumb-widgets-smart · MUST
A component in `components/` takes data and callbacks, performs no input or output, and imports no binding unit. Only a widget consumes binding units, and it works wherever it is placed.
**Why:** a presentational component can then be shown, reused and tested with any data; the logic lives in widgets, where it is expected.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `side-effects-at-the-edges`

## ui-layer-imports · MUST
A feature's `ui/` imports `libs/ui`, `shared/ui`, its own binding units, its entities as types, and `kernel/`; never adapters, contracts or domain use-cases. Screens and `root/` may import `kernel/`.
**Why:** the interface then depends on what the feature offers, not on how it works, and a change of adapter never reaches a screen.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `dependencies-point-inward-without-cycles`

## component-in-its-own-folder · SHOULD
A component has its own folder: the component file, its `.types`, `.variants` and `.constants` when it needs them, its sub-components prefixed with its name in `components/`, and a surface offering only its public API.
**Why:** everything about one component is in one place, and its internals stay private.
**Check:** tool — names
**Tags:** naming, architecture
**Implements:** `file-carries-its-role-suffix`

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

## vendored-components-adapted-on-arrival · SHOULD
A component installed as source is, before review, placed and named by the homes above, restyled to tokens, stripped of unused props and made to follow the prop rules. The existing primitives are searched first; the component is integrated or rejected, never kept as it came.
**Why:** code copied in as it came brings another project's names and looks, and stays foreign until someone changes it.
**Check:** review
**Tags:** architecture, ux

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

## props-drilled-at-most-two-levels · SHOULD
A prop passed unchanged through more than two levels calls for composition or a nearer widget, never for a store read in a deep component.
**Why:** a prop threaded through components that do not use it couples them all to it.
**Check:** review
**Tags:** architecture
**Implements:** `talk-only-to-neighbours`

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

## primitives-take-text-by-props · MUST
The primitive library holds no user-facing text and no message catalog; text arrives through props.
**Why:** a primitive with its own text cannot be translated or reworded by the application that uses it.
**Check:** tool — architecture
**Tags:** architecture, ux
**Implements:** `libs-import-no-application-code`

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

## ui-primitives-text-by-props · MUST
Primitives have no built-in user-facing text.
**Why:** without it, the application cannot translate or reword what its primitives say.
**Check:** review
**Tags:** ux

## ui-primitives-slot · SHOULD
A slot renders the consumer's element with the primitive's behaviour.
**Why:** a link or a custom element can then take a primitive's behaviour without wrapping it in another element.
**Check:** review
**Tags:** architecture
