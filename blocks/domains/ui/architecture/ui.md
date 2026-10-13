# User interface

> Governs the interface's place in the tree: screens, components, theme and binding units.

**Vocabulary.** Folders: `ui` — a feature's presentation layer, and also `root/ui`, `shared/ui`, `libs/ui`; `components` — presentational; `widgets` — smart; `assets` — icons, images and fonts. Suffix: `.variants`. A feature adds `ui/{components,widgets}/`. The screens are the delivery layer; the router's block names their folder.

## Screens

### screen-loads-its-data-and-composes-the-page → delivery-unit-stays-thin · SHOULD
A screen reads and validates its address, loads the data its pieces render, and composes the page from widgets and from pieces private to it.

| Why | Tags |
|---|---|
| the screen is the one place that knows its address and its data, and one loading point shows one loading state and one error instead of a page that fills in piece by piece. | [ux, performance] |

### screen-piece-receives-data-and-callbacks · SHOULD
A screen's piece receives data and `on<Event>` callbacks and never knows which screen it sits on; where one loading point hurts its screen it becomes a widget with a binding unit of its own.

| Why | Tags |
|---|---|
| a piece that knows only its data is reused and tested alone. | [] |

### pieces-never-touch-navigation · MUST
A presentational component or a screen's piece imports no navigation or route-parameter primitive.

| Why | Tags |
|---|---|
| a piece that navigates by itself works on one screen only, and its behaviour hides from the screen that composes it. | [] |

### navigation-passed-by-slot · SHOULD
Navigation reaches a presentational component through a slot that renders the link; any other action reaches it through a callback.

| Why | Tags |
|---|---|
| the component stays free of navigation, and the link stays a real link the platform can open, share and announce. | [ux] |

### screen-private-pieces-beside-screen → delivery-unit-beside-what-it-serves · SHOULD
Pieces and binding units private to one screen live beside it, private to it.

| Why | Tags |
|---|---|
| what one screen uses changes with that screen, and nothing else can reach it by accident. | [] |

### root-boundary-catches-the-rest → last-resort-handler-one-per-entry · MUST
One handler in `root/` catches every failure that no screen contains itself.

| Why | Tags |
|---|---|
| a failure no screen contained still reaches a handler that shows it, and the user is never left with a blank page. | [errors] |

### client-concerns-in-root-built-stores → fact-has-one-source · MUST
The few global concerns the client owns — the theme, the notices, whether a session exists — live in small stores the root builds, one store per concern; what a session carries — the user, their rights — keeps the home of the data it is.

| Why | Tags |
|---|---|
| a concern every screen shares has one home, which the root hands to the screens and a spec replaces; a store built anywhere else, or a user's details copied into one, is a second copy of it. | [data] |

### form-reuses-domain-predicates → business-value-lives-in-the-domain · MUST
A form's schema composes the checks of the domain's value objects and sits with the form; it never restates an invariant.

| Why | Tags |
|---|---|
| a rule checked in two places drifts, and the form then accepts what the domain rejects. | [data] |

## Components

### component-lives-where-its-knowledge-lives → code-placed-by-its-reason-to-change · MUST
A component lives where its knowledge lives: used by one screen, beside it; knows a feature, in that feature's `ui/`; a generic primitive, in `libs/ui`; specific to the application and used by two or more features, in `shared/ui`; the application's shell, in `root/ui`.

| Why | Tags |
|---|---|
| a component placed by what it knows can be found, and it moves only when its knowledge does. | [] |

### component-named-by-location → folder-takes-its-layer-or-role-name · MUST
A component's folder name carries its location and role: no prefix in `libs/ui` and `shared/ui`, `root-` in `root/ui`, the feature's name in a feature, and `-widget` on every widget.

| Why | Tags |
|---|---|
| the name alone tells where a component comes from and whether it holds logic. | [] |

### presentational-component-performs-no-io → effects-held-only-by-the-edge · MUST
A component in `components/` takes data and callbacks and performs no input or output: it consumes no binding unit, which screens and widgets alone consume, and a widget works wherever it is placed.

| Why | Tags |
|---|---|
| a presentational component can then be shown, reused and tested with any data, and a widget that needs no screen's data goes anywhere. | [] |

### component-never-imports-a-widget · MUST
A component never imports a widget.

| Why | Tags |
|---|---|
| a component that holds a widget holds its logic too, and stops being presentational. | [] |

### ui-layer-imports-only-what-its-feature-offers → import-points-inward · MUST
A feature's `ui/` imports `libs/ui`, `shared/ui`, its own binding units, its entities and value objects — their types, enumerations, checks and functions — its errors' codes and the kernel, never an adapter, a contract or a use case of the domain.

| Why | Tags |
|---|---|
| the interface then depends on what the feature offers, not on how it works, and a change of adapter never reaches a screen. | [] |

### component-in-its-own-folder → module-reached-only-through-its-surface · MUST
A component has its own folder holding the files named after it, its sub-components prefixed with its name in `components/`, its folder of specs and a surface offering only its public interface; `components/` and `widgets/` hold only component folders and a surface.

| Why | Tags |
|---|---|
| everything about one component is in one place, and its internals stay private. | [] |

### vendored-component-placed-by-its-home · MUST
A component installed as source is moved, before review, to the home its knowledge gives it and named by that home, never left where its installer put it.

| Why | Tags |
|---|---|
| an installer's folder follows another project's layout, and a component left there is not where any reader looks for it. | [ux] |

## Binding units

### providers-compose-the-ui-application → composition-root-wires-everything · MUST
The providers are the application's composition root: they build the configuration, each adapter from its dependencies and each stateful client — a cache, a store — and hand them to the binding units. No adapter imports a provider or a shared instance.

| Why | Tags |
|---|---|
| every concrete choice is made in one place, and a test hands the same binding unit a different adapter or cache without touching it. | [] |

### binding-unit-composes-its-operation · SHOULD
A binding unit binds one operation: it takes its adapter from the providers and calls the use case, or the port where there is none.

| Why | Tags |
|---|---|
| each operation is bound once, and the screen never learns which adapter serves it. | [] |

### binding-unit-imports-nothing-of-the-ui · MUST
A binding unit imports nothing of `ui/`, which imports it.

| Why | Tags |
|---|---|
| a binding unit that imports the interface forms a cycle with it. | [] |
