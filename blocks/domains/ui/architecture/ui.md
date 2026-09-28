# User interface

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

## vendored-components-adapted-on-arrival · SHOULD
A component installed as source is, before review, placed and named by the homes above, restyled to tokens, stripped of unused props and made to follow the prop rules. The existing primitives are searched first; the component is integrated or rejected, never kept as it came.
**Why:** code copied in as it came brings another project's names and looks, and stays foreign until someone changes it.
**Check:** review
**Tags:** architecture, ux

## props-drilled-at-most-two-levels · SHOULD
A prop passed unchanged through more than two levels calls for composition or a nearer widget, never for a store read in a deep component.
**Why:** a prop threaded through components that do not use it couples them all to it.
**Check:** review
**Tags:** architecture
**Implements:** `talk-only-to-neighbours`

## primitives-take-text-by-props · MUST
The primitive library holds no user-facing text and no message catalog; text arrives through props.
**Why:** a primitive with its own text cannot be translated or reworded by the application that uses it.
**Check:** tool — architecture
**Tags:** architecture, ux
**Implements:** `libs-import-no-application-code`

## Requirements for implementation

What any library of interface primitives must provide.

## ui-primitives-text-by-props · MUST
Primitives have no built-in user-facing text.
**Why:** without it, the application cannot translate or reword what its primitives say.
**Check:** review
**Tags:** ux
