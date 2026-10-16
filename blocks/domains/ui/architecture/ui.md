# User interface

> Governs the interface's place in the tree: screens, components, theme and binding units.

**Vocabulary.** Folders: `ui` — the presentation layer of a feature or of a composition module, and `shared/ui`, `libs/ui`; `screens` — a composition module's screens; `components` — presentational; `widgets` — smart; `assets` — icons, images and fonts. Suffix: `.variants`. A feature adds `ui/{components,widgets}/`, a composition module `ui/{screens,components,widgets}/`. Screens live in composition, and the root registers them.

## Screens

### screen-loads-its-data-and-composes-the-page → delivery-unit-stays-thin · SHOULD

A screen receives its parsed address from its registration, loads the data its pieces render, and composes the page from widgets and from pieces private to it.

| Why | Tags |
|---|---|
| the screen is the one place that knows its data, and one loading point shows one loading state and one error instead of a page that fills in piece by piece. | [ux, performance] |

### screen-lives-in-composition → delivery-unit-beside-what-it-serves · SHOULD

Every screen lives in a composition module's `ui/screens/`, whatever features it uses today; a feature offers its widgets, components and binding units, never a screen.

| Why | Tags |
|---|---|
| a screen is a place in the product, not an operation of a feature, and it does not move when it starts showing a second feature. | [] |

### screen-piece-receives-data-and-callbacks · SHOULD

A screen's piece receives data and `on<Event>` callbacks and never knows which screen it sits on; where one loading point hurts its screen it becomes a widget with a binding unit of its own.

| Why | Tags |
|---|---|
| a piece that knows only its data is reused and tested alone. | [] |

### ui-never-touches-navigation · MUST

No screen, widget or component imports a navigation or route-parameter primitive or knows an address.

| Why | Tags |
|---|---|
| addresses are then known in the root alone, so a change of the navigation library or of a path never reaches a screen, and a piece that navigates by itself cannot hide its behaviour from what composes it. | [] |

### navigation-passed-by-slot · SHOULD

Navigation reaches a screen, a widget or a component as props: its parameters as values, its links as slots that render them, its transitions and any other action as `on<Event>` callbacks; the screen's registration hands them to the screen, which passes them on.

| Why | Tags |
|---|---|
| the interface stays free of navigation, and the link stays a real link the platform can open, share and announce. | [ux] |

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

The few global concerns the client owns — the theme, the notices — live in small stores the root builds, one store per concern.

| Why | Tags |
|---|---|
| a concern every screen shares has one home, which the root hands to the screens and a spec replaces; a store built anywhere else is a second copy of it. | [] |

### form-reuses-domain-predicates → business-value-lives-in-the-domain · MUST

A form's schema composes the checks of the domain's value objects and sits with the form; it never restates an invariant.

| Why | Tags |
|---|---|
| a rule checked in two places drifts, and the form then accepts what the domain rejects. | [data] |

## Components

### component-lives-where-its-knowledge-lives → code-placed-by-its-reason-to-change · MUST

A component lives where its knowledge lives: used by one screen, beside it; knows one feature, in that feature's `ui/`; assembles several features — the application's shell, a widget of several features — in a composition module's `ui/`; a generic primitive, in `libs/ui`; specific to the application and used by two or more features, in `shared/ui`.

| Why | Tags |
|---|---|
| a component placed by what it knows can be found, and it moves only when its knowledge does. | [] |

### component-named-by-location → folder-takes-its-layer-or-role-name · MUST

A component's folder name carries its location and role: no prefix in `libs/ui` and `shared/ui`, the feature's name in a feature, the module's name in a composition module, and `-widget` on every widget.

| Why | Tags |
|---|---|
| the name alone tells where a component comes from and whether it holds logic. | [] |

### presentational-component-performs-no-io → effects-held-only-by-the-edge · MUST

A component in `components/` takes data and callbacks and performs no input or output.

| Why | Tags |
|---|---|
| a presentational component can then be shown, reused and tested with any data. | [] |

### binding-units-consumed-by-screens-and-widgets · MUST

Within the interface, binding units are consumed by screens and widgets only, never by a component, and a widget works wherever it is placed.

| Why | Tags |
|---|---|
| a component that reaches no binding unit renders anything its caller hands it, and a widget that needs no screen's data goes anywhere. | [] |

### component-never-imports-a-widget · MUST

A component never imports a widget.

| Why | Tags |
|---|---|
| a component that holds a widget holds its logic too, and stops being presentational. | [] |

### ui-layer-imports-only-what-its-feature-offers → import-points-inward · MUST

A feature's `ui/` imports `libs/ui`, `shared/ui`, its own binding units, its entities and value objects — their types, enumerations, checks and functions — its errors' codes and the kernel save its contracts, never an adapter, a contract — the kernel's included — or a use case of the domain.

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

### store-never-replaces-a-drilled-prop · SHOULD

A deep component never reads a store to spare a prop its path; the state stays in its home and reaches the component by composition or a nearer widget.

| Why | Tags |
|---|---|
| state moved to a store to save threading becomes global, shared by accident and kept long after the screen that needed it. | [] |

## Binding units

### providers-compose-the-ui-application → composition-root-wires-everything · MUST

The providers are the application's composition root: they build the configuration, each adapter from its dependencies, each use case from its ports and each stateful client — a cache, a store — and hand the use cases and the clients to the binding units. No adapter imports a provider or a shared instance.

| Why | Tags |
|---|---|
| every concrete choice is made in one place, and a test hands the same binding unit a different use case or cache without touching it. | [] |

### binding-unit-composes-its-operation → binding-unit-calls-only-use-cases · MUST

A binding unit binds one operation: it takes the operation's use case from the providers and calls it.

| Why | Tags |
|---|---|
| each operation is bound once, and the screen never learns which adapter serves it. | [] |

### binding-unit-imports-nothing-of-the-ui · MUST

A binding unit imports nothing of `ui/`, which imports it.

| Why | Tags |
|---|---|
| a binding unit that imports the interface forms a cycle with it. | [] |
