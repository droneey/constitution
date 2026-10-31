# Components

> Governs a component's place in the tree, its name, its folder and what it may import.

An interface lives in the presentation of a feature and of a composition module, beside its binding units; `shared/ui` and `libs/ui` hold the application's shared and generic pieces. In a presentation, **`screens/`**{#screen} holds a composition module's screens, **`components/`**{#component} the presentational components, **`widgets/`**{#widget} the smart ones and `assets/` the icons, images and fonts: a feature adds `components/` and `widgets/`, a composition module `screens/`, `components/` and `widgets/`. A component's map of variants lives in a file ending in **`.variants`**{#style-variants}.

## Place

### component-lives-where-its-knowledge-lives → code-placed-by-its-reason-to-change · MUST

A component lives where its knowledge lives: used by one screen, beside it and private to it, with the binding units only that screen uses; knows one feature, in that feature's presentation; assembles several features — the application's shell, a widget of several features — in a composition module's presentation; a generic primitive, in `libs/ui`; specific to the application and used by two or more features, in `shared/ui`.

| Why |
|---|
| a component placed by what it knows can be found, it moves only when its knowledge does, and what one screen uses is reached by nothing else by accident. |

### component-named-by-location → folder-takes-its-layer-or-role-name · MUST

A component's folder name carries its location and role: no prefix in `libs/ui` and `shared/ui`, the feature's name in a feature, the module's name in a composition module, and `-widget` on every widget.

| Why |
|---|
| the name alone tells where a component comes from and whether it holds logic. |

### component-in-its-own-folder → module-reached-only-through-its-surface · MUST

A component has its own folder holding the files named after it, its sub-components prefixed with its name in `components/`, its folder of specs and a surface offering only its public interface; `components/` and `widgets/` hold only component folders and a surface.

| Why |
|---|
| everything about one component is in one place, and its internals stay private. |

### vendored-component-placed-by-its-home · MUST

A component installed as source is moved, before review, to the home its knowledge gives it and named by that home, never left where its installer put it.

| Why |
|---|
| an installer's folder follows another project's layout, and a component left there is not where any reader looks for it. |

## Data and imports

### presentational-component-performs-no-io → effects-held-only-by-the-edge · MUST

A component in `components/` takes data and callbacks and performs no input or output.

| Why |
|---|
| a presentational component can then be shown, reused and tested with any data. |

### component-never-imports-a-widget · MUST

A component never imports a widget.

| Why |
|---|
| a component that holds a widget holds its logic too, and stops being presentational. |

### props-drilled-at-most-two-levels · SHOULD

A prop passed unchanged through more than two levels calls for composition or a nearer widget that loads the data itself, never for a store the deep component reads to spare the prop its path.

| Why |
|---|
| a prop threaded through components that do not use it couples them all to it, and state moved to a store to save threading becomes global, shared by accident and kept long after the screen that needed it. |
