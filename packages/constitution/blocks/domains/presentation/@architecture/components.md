# Components

> Governs a component's place in the tree, its name, its folder and the data it takes.

## Vocabulary

The folder **`ui/`**{#ui-kit} holds the interface's components in a shared layer: its components specific to the program in `shared/ui`, its generic components and component primitives in `libs/ui`.

In a presentation, **`screens/`**{#screen} holds the program's screens, **`components/`**{#component} its presentational components, **`widgets/`**{#widget} its widgets and **`assets/`**{#asset} its icons, images and fonts.

A **presentational component** is a component in `components/`, which takes data and callbacks; a **widget** is a component in `widgets/`, which loads its own data through binding units.

A widget's role word is **`Widget`**{#widget-role-word}: `-widget` ends its folder's name, as in `order-summary-widget/`, and `Widget` its type's, as in `OrderSummaryWidget`. It is a default a language's block respells where a module's name takes no hyphen.

## Place

### component-lives-where-its-knowledge-lives → code-placed-by-its-reason-to-change · SHOULD

Every component lives where its knowledge lives, one installed as source included. A generic component primitive lives in `libs/ui`; a screen piece, beside its screen; a component that one feature alone knows or uses, in that feature's presentation; one that knows the features a composition module composes, in that module's presentation; one that assembles several features no composition module composes, such as the program's shell or a widget of several features, in the program's presentation; and one specific to the program that knows no feature and serves two or more, in `shared/ui`.

| Why |
|---|
| a component placed apart from its knowledge is not where a reader looks for it, and changes with code it does not sit beside — the common closure principle. |

### component-named-by-location · SHOULD

Every component's folder name carries its location. It takes no prefix in `libs/ui`, `shared/ui` and the program's presentation, the feature's name in a feature, the composition module's name in a composition module, and on a sub-component the name of the component that holds it.

| Why |
|---|
| a component named without its location must be opened to learn where it comes from, and two components of one name in different homes are taken for one. |

### widget-named-with-its-role-word → role-word-ends-the-name · MUST

Every widget's name ends in its role word, its folder's in `-widget` and its type's in `Widget`.

| Why |
|---|
| a widget named like a presentational component must be opened to learn that it loads data, and the check that keeps widgets out of presentational components cannot find it. |

### component-in-its-own-folder → module-has-the-one-form · SHOULD

Every component is a folder module of its own. It holds its files and its sub-components, these in its own `components/`.

| Why |
|---|
| a component spread over shared folders is changed in several places, and internals reachable past a surface become what its callers depend on — information hiding. |

## Data

### prop-never-threaded-through-components-that-ignore-it · MUST

No prop travels through components that ignore it. A component ignores a prop when it neither reads it nor hands it to an element or a component that reads it. A prop that would travel further is replaced by composition, the part that needs it taken as a slot prop, or by a nearer widget that loads the data itself, never by a state store the deep component reads to spare the prop its path. Exempt: what a screen's registration gives it, which the screen hands to the screen pieces of its layout, and a look that restyles a whole subtree, which reaches it through the platform's inheritance of styles or the theme's own scope.

| Why |
|---|
| a prop threaded through components that ignore it couples them all to it, and a state store made to avoid the threading makes the state global, shared by accident and kept after the screen that needed it. |
