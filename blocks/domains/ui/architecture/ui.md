# User interface

**Vocabulary.** Folders: `ui` — a feature's presentation layer, and also `root/ui`, `shared/ui`, `libs/ui`; `components` — presentational; `widgets` — smart; `assets` — icons, images and fonts. Suffix: `.variants`. A feature adds `ui/{components,widgets}/`. The screens are the delivery layer; the router's block names their folder.

## Screens

## screen-composes-the-page → delivery-units-stay-thin
A screen owns its navigation state: it reads and validates it, loads the data its pieces render, and composes the page from widgets and pieces private to it. A piece receives data and `on<Event>` callbacks and never knows which screen it sits on; it takes a binding unit of its own only when a single loading point hurts, decided per screen.

| Why | Check | Tags |
|---|---|---|
| the screen is the one place that knows its address and its data, so every piece stays reusable and testable alone, and one loading point shows one loading state and one error instead of a page that fills in piece by piece. | review | [ux, performance] |

## screens-imported-by-nothing-inside → screen-composes-the-page
Nothing inside the application — a feature, `shared/`, `libs/`, `kernel/` — imports a screen or anything under the screens' folder; only the router does.

| Why | Check | Tags |
|---|---|---|
| a screen is the outermost delivery unit, and a feature that imports one depends on the layer that depends on it. | review | [] |

## pieces-never-touch-navigation · MUST
A presentational component or a screen's piece imports no navigation or route-parameter primitive.

| Why | Check | Tags |
|---|---|---|
| a piece that navigates by itself works on one screen only, and its behaviour hides from the screen that composes it. | tool/imports | [] |

## navigation-passed-by-slot · SHOULD
Navigation reaches a presentational component through a slot that renders the link — its children first, then the data; any other action reaches it through a callback.

| Why | Check | Tags |
|---|---|---|
| the component stays free of the router, and the link stays a real link the platform can open, share and announce. | review | [ux] |

## screen-private-pieces-beside-screen → delivery-unit-beside-what-it-serves
Pieces and binding units private to one screen live beside it, private to it. A layout composes the state its screens share in binding units of its own.

| Why | Check | Tags |
|---|---|---|
| what one screen uses changes with that screen, and nothing else can reach it by accident. | review | [] |

## screen-guards-through-auth-surface → access-denied-unless-granted
Guards and redirects of a screen live in the screens layer and use the surface of the feature that owns sessions; a feature's screens adapt to permissions passed down by composition.

| Why | Check | Tags |
|---|---|---|
| access is decided before the screen renders, in one layer, and no feature reaches into the session's internals. | review | [] |

## error-boundary-per-screen → one-error-handler-per-transport · MUST
Every screen sits inside an error boundary of its own, and one boundary in `root/` catches what the screens do not.

| Why | Check | Tags |
|---|---|---|
| a failure in one screen then costs that screen, not the whole application, and the user is never left with a blank page. | review | [] |

## view-state-homes → one-home-per-datum
Each kind of state has one home: remote data in its cache; view state a link or a restart must reproduce in the platform's navigation state; ephemeral state in its component; the few global concerns — theme, session, notices — in one small store.

| Why | Check | Tags |
|---|---|---|
| state kept in the wrong home is lost on reload, shared by accident, or copied until the copies disagree. | review | [] |

## form-reuses-domain-predicates → invariant-checked-at-construction
A form's schema composes the predicates of the value objects and sits with the form; it never restates an invariant.

| Why | Check | Tags |
|---|---|---|
| a rule checked in two places drifts, and the form then accepts what the domain rejects. | review | [data] |

## Components

## component-home-by-knowledge → code-lives-with-its-reason-to-change
A component lives where its knowledge lives: used by one screen, beside it; knows a feature, in that feature's `ui/`; a generic primitive, in `libs/ui`; specific to the application and used by two or more features, in `shared/ui`; the application's shell, in `root/ui`.

| Why | Check | Tags |
|---|---|---|
| a component placed by what it knows can be found, and it moves only when its knowledge does. | review | [] |

## component-named-by-location → folder-named-for-purpose-or-role
A component's folder name carries its location and role: no prefix in `libs/ui` and `shared/ui`, `root-` in `root/ui`, the feature's name in a feature, and `-widget` on every widget.

| Why | Check | Tags |
|---|---|---|
| the name alone tells where a component comes from and whether it holds logic. | review | [] |

## widget-folder-ends-in-widget → component-named-by-location
A widget's folder name ends in `-widget`.

| Why | Check | Tags |
|---|---|---|
| the name alone tells that it holds logic. | tool/names | [] |

## components-dumb-widgets-smart → side-effects-at-the-edges
A component in `components/` takes data and callbacks, performs no input or output, and imports no binding unit. Only a widget consumes binding units, and it works wherever it is placed.

| Why | Check | Tags |
|---|---|---|
| a presentational component can then be shown, reused and tested with any data; the logic lives in widgets, where it is expected. | review | [] |

## components-never-import-widgets → components-dumb-widgets-smart
A component never imports a widget; a widget composes components.

| Why | Check | Tags |
|---|---|---|
| a component that holds a widget holds its logic too, and stops being dumb. | tool/imports | [] |

## components-import-no-adapter → components-dumb-widgets-smart
A component in `components/` imports no adapter, no shared contract of `contracts/` and no application layer.

| Why | Check | Tags |
|---|---|---|
| a component that reaches a mechanism can no longer be shown or tested with plain data. | tool/imports | [] |

## ui-layer-imports → dependencies-point-inward
A feature's `ui/` imports `libs/ui`, `shared/ui`, its own binding units, its entities — their types, enums and functions — and `kernel/`; never adapters, contracts or domain use-cases. Screens and `root/` may import `kernel/`.

| Why | Check | Tags |
|---|---|---|
| the user interface then depends on what the feature offers, not on how it works, and a change of adapter never reaches a screen. | review | [] |

## ui-reaches-no-mechanism-of-its-feature → ui-layer-imports
A feature's `ui/` never imports its adapters, contracts or domain use-cases, nor `contracts/` or `adapters/`.

| Why | Check | Tags |
|---|---|---|
| these are the mechanisms the UI reaches only through its binding units. | tool/imports | [] |

## component-in-its-own-folder → file-carries-its-role-suffix
A component has its own folder: the component file, its `.types`, `.variants` and `.constants` when it needs them, its sub-components prefixed with its name in `components/`, and a surface offering only its public API.

| Why | Check | Tags |
|---|---|---|
| everything about one component is in one place, and its internals stay private. | review | [] |

## component-folders-hold-their-files → component-in-its-own-folder
`components/` and `widgets/` hold only component folders and a surface, and a component folder holds only files named after it, its `__tests__/` and its surface.

| Why | Check | Tags |
|---|---|---|
| a component's files are then found by its name. | tool/names | [] |

## vendored-component-placed-by-its-home → vendored-components-adapted-on-arrival
A component installed as source is, before review, moved to the home its knowledge gives it and named by that home, never left where its installer put it.

| Why | Check | Tags |
|---|---|---|
| an installer's folder follows another project's layout, and a component left there is not where any reader looks for it. | review | [] |

## store-never-replaces-a-drilled-prop → props-drilled-at-most-two-levels
A deep component never reads a store to spare a prop its path; the state stays in its home and reaches the component by composition or a nearer widget.

| Why | Check | Tags |
|---|---|---|
| state moved to a store to save threading becomes global, shared by accident and kept long after the screen that needed it. | review | [] |

## primitives-take-text-by-props → libs-import-no-application-code
The primitive library holds no user-facing text and no message catalog; text arrives through props.

| Why | Check | Tags |
|---|---|---|
| a primitive with its own text cannot be translated or reworded by the application that uses it. | review | [ux] |
