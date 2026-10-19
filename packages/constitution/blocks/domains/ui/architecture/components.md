# Components

> Governs a component's place in the tree, its name, its folder and what it may import.

## Place

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

## Data and imports

### presentational-component-performs-no-io → effects-held-only-by-the-edge · MUST

A component in `components/` takes data and callbacks and performs no input or output.

| Why | Tags |
|---|---|
| a presentational component can then be shown, reused and tested with any data. | [] |

### component-never-imports-a-widget · MUST

A component never imports a widget.

| Why | Tags |
|---|---|
| a component that holds a widget holds its logic too, and stops being presentational. | [] |

### store-never-replaces-a-drilled-prop · SHOULD

A deep component never reads a store to spare a prop its path; the state stays in its home and reaches the component by composition or a nearer widget.

| Why | Tags |
|---|---|
| state moved to a store to save threading becomes global, shared by accident and kept long after the screen that needed it. | [] |
