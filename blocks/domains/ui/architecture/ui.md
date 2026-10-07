# User interface

**Vocabulary.** Folders: `ui` — a feature's presentation layer, and also `root/ui`, `shared/ui`, `libs/ui`; `components` — presentational; `widgets` — smart; `assets` — icons, images and fonts. Suffix: `.variants`. A feature adds `ui/{components,widgets}/`. The screens are the delivery layer; the router's block names their folder.

## Screens

### screen-composes-the-page → delivery-unit-stays-thin · SHOULD
A screen owns its navigation state: it reads and validates it, loads the data its pieces render, and composes the page from widgets and pieces private to it. A piece receives data and `on<Event>` callbacks and never knows which screen it sits on; it takes a binding unit of its own only when a single loading point hurts, decided per screen.

| Why | Tags |
|---|---|
| the screen is the one place that knows its address and its data, so every piece stays reusable and testable alone, and one loading point shows one loading state and one error instead of a page that fills in piece by piece. | [ux, performance] |

### pieces-never-touch-navigation · MUST
A presentational component or a screen's piece imports no navigation or route-parameter primitive.

| Why | Tags |
|---|---|
| a piece that navigates by itself works on one screen only, and its behaviour hides from the screen that composes it. | [] |

### navigation-passed-by-slot · SHOULD
Navigation reaches a presentational component through a slot that renders the link — its children first, then the data; any other action reaches it through a callback.

| Why | Tags |
|---|---|
| the component stays free of the router, and the link stays a real link the platform can open, share and announce. | [ux] |

### screen-private-pieces-beside-screen → delivery-unit-beside-what-it-serves · SHOULD
Pieces and binding units private to one screen live beside it, private to it. A layout composes the state its screens share in binding units of its own.

| Why | Tags |
|---|---|
| what one screen uses changes with that screen, and nothing else can reach it by accident. | [] |

### root-boundary-catches-the-rest → last-resort-handler-one-per-entry · MUST
One error boundary in `root/` catches what no screen's own boundary does.

| Why | Tags |
|---|---|
| a failure no screen contained still reaches a handler that shows it, and the user is never left with a blank page. | [] |

### client-concerns-in-root-built-stores → fact-has-one-source · MUST
The few global concerns the client owns — theme, notices — live in small stores the root builds, one store per concern.

| Why | Tags |
|---|---|
| a concern every screen shares has one home, which the root hands to the screens and a spec replaces; a store built anywhere else is a second copy of it. | [] |

### form-reuses-domain-predicates → value-object-built-only-by-its-check · MUST
A form's schema composes the predicates of the value objects and sits with the form; it never restates an invariant.

| Why | Tags |
|---|---|
| a rule checked in two places drifts, and the form then accepts what the domain rejects. | [data] |

## Components

### primitives-are-a-set-of-components → behaviour-lives-in-a-feature · SHOULD
A set of interface primitives is a set of components, each a module of its own in `components/<name>/`, and grows `features/` only when it gains behaviour of the product.

| Why | Tags |
|---|---|
| a primitive offers mechanism, not behaviour, so it needs no feature's layers, and a component found in its own folder is found the same way in every kit. | [] |

### component-home-by-knowledge → code-placed-by-its-reason-to-change · MUST
A component lives where its knowledge lives: used by one screen, beside it; knows a feature, in that feature's `ui/`; a generic primitive, in `libs/ui`; specific to the application and used by two or more features, in `shared/ui`; the application's shell, in `root/ui`.

| Why | Tags |
|---|---|
| a component placed by what it knows can be found, and it moves only when its knowledge does. | [] |

### component-named-by-location → folder-takes-its-layer-or-role-name · SHOULD
A component's folder name carries its location and role: no prefix in `libs/ui` and `shared/ui`, `root-` in `root/ui`, the feature's name in a feature, and `-widget` on every widget.

| Why | Tags |
|---|---|
| the name alone tells where a component comes from and whether it holds logic. | [] |

### components-dumb-widgets-smart → effects-held-only-by-the-edge · MUST
A component in `components/` takes data and callbacks, performs no input or output, and imports no binding unit. Only a widget consumes binding units, and it works wherever it is placed. A component never imports a widget. A component in `components/` imports no adapter, no shared contract of `contracts/` and no application layer.

| Why | Tags |
|---|---|
| a presentational component can then be shown, reused and tested with any data; the logic lives in widgets, where it is expected. | [] |

### ui-layer-imports → import-points-inward · MUST
A feature's `ui/` imports `libs/ui`, `shared/ui`, its own binding units, its entities — their types, enums and functions — and `kernel/`; never adapters, contracts or domain use-cases. Screens and `root/` may import `kernel/`. A feature's `ui/` never imports `contracts/` or `adapters/` either.

| Why | Tags |
|---|---|
| the user interface then depends on what the feature offers, not on how it works, and a change of adapter never reaches a screen. | [] |

### component-in-its-own-folder → module-reached-only-through-its-surface · MUST
A component has its own folder: the component file, its `.types`, `.variants` and `.constants` when it needs them, its sub-components prefixed with its name in `components/`, and a surface offering only its public API. `components/` and `widgets/` hold only component folders and a surface, and a component folder holds only files named after it, its `components/` folder of sub-components, its `__tests__/` and its surface.

| Why | Tags |
|---|---|
| everything about one component is in one place, and its internals stay private. | [] |

### vendored-component-placed-by-its-home · SHOULD
A component installed as source is, before review, moved to the home its knowledge gives it and named by that home, never left where its installer put it.

| Why | Tags |
|---|---|
| an installer's folder follows another project's layout, and a component left there is not where any reader looks for it. | [ux] |

### store-never-replaces-a-drilled-prop · SHOULD
A deep component never reads a store to spare a prop its path; the state stays in its home and reaches the component by composition or a nearer widget.

| Why | Tags |
|---|---|
| state moved to a store to save threading becomes global, shared by accident and kept long after the screen that needed it. | [] |

### theme-in-the-design-system-library · MUST
The theme module lives in `libs/ui/theme/`: its tokens, its constants and the code that applies them.

| Why | Tags |
|---|---|
| the theme knows nothing of the application, and one home lets a tool and a reviewer find every token. | [ux] |

### configuration-provider-reads-environment → root-alone-reads-the-environment · MUST
The configuration provider reads the environment for the screens and components, which never read it themselves.

| Why | Tags |
|---|---|
| a screen or component then depends on typed configuration it receives, and a missing setting fails before any of them renders. | [] |

## Binding units

### providers-compose-the-ui-application → composition-root-wires-everything · MUST
The providers are the application's composition root: they build the configuration, build each adapter from its dependencies, and hand the adapters to the binding units. No adapter imports a provider or a shared instance.

| Why | Tags |
|---|---|
| every concrete choice is made in one place, and a test hands the same binding unit a different adapter without touching it. | [] |

### binding-unit-composes-its-operation · SHOULD
A binding unit binds one operation: it takes its adapter from the providers and calls the use-case, or the port when there is none. A plain function form of it is added only when a caller that is not reactive appears. A binding unit imports neither an adapter, which the providers hand it, nor anything of `ui/`, which imports it.

| Why | Tags |
|---|---|
| each operation is bound once, and the screen never learns which adapter serves it. | [] |
