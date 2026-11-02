# Components

> Governs a component's place in the tree, its name, its folder and the data it takes.

The folder **`ui/`**{#ui-kit} holds the interface's shared pieces in `shared/` and its generic ones in `libs/`, as `shared/ui` and `libs/ui`. In a presentation, **`screens/`**{#screen} holds the program's screens, **`components/`**{#component} the presentational components, **`widgets/`**{#widget} the smart ones and **`assets/`**{#asset} the icons, images and fonts: a feature and a composition module add `components/` and `widgets/`, the program's presentation `screens/`, `components/` and `widgets/`. A widget's folder name ends in **`-widget`**{#widget-suffix}, a default a language's block respells where a module's name takes no hyphen. A component's map of variants lives in a file ending in **`.variants`**{#style-variants}.

## Place

### component-lives-where-its-knowledge-lives → code-placed-by-its-reason-to-change · MUST

A component lives where its knowledge lives. Used by one screen, it lives beside it; knowing one feature, in that feature's presentation; assembling several features — the program's shell, a widget of several features — in the program's presentation; a generic primitive, in `libs/ui`; specific to the program and used by two or more features, in `shared/ui`.

| Why |
|---|
| a component placed apart from its knowledge is not where a reader looks for it, and changes with code it does not sit beside — the common closure principle. |

### component-named-by-location → name-reveals-intent · MUST

A component's folder name carries its location and role. It takes no prefix in `libs/ui` and `shared/ui`, the feature's name in a feature, the module's name in a composition module, and `-widget` on every widget.

| Why |
|---|
| a component named without its location and role must be opened to learn where it comes from and whether it holds logic. |

### component-in-its-own-folder → module-reached-only-through-its-surface · MUST

A component has its own folder. The folder holds the files named after it, its sub-components prefixed with its name in `components/`, its folder of specs and a surface offering only what its callers use; `components/` and `widgets/` hold only component folders and a surface.

| Why |
|---|
| a component spread over shared folders is changed in several places, and internals reachable past a surface become what its callers depend on — information hiding. |

### vendored-component-placed-by-its-home · MUST

A component installed as source is moved to its home before review. It moves to the home its knowledge gives it and is named by that home, never left where its installer put it.

| Why |
|---|
| an installer's folder follows another project's layout, and a component left there is not where any reader looks for it. |

## Data

### presentational-component-performs-no-io → effects-held-only-by-the-edge · MUST

A presentational component performs no input or output. A component in `components/` takes data and callbacks.

| Why |
|---|
| a component that performs input or output cannot be shown, reused or tested without the system it reaches — Humble Object. |

### prop-never-threaded-through-components-that-ignore-it · MUST

A prop never travels through components that ignore it. A component ignores a prop when it neither reads it nor hands it to an element or a component that reads it; a screen that hands what its registration gives it to the pieces of its page ignores none of it. A prop that would travel further is replaced by composition — the part that needs it taken as children or a slot — or by a nearer widget that loads the data itself, never by a state store the deep component reads to spare the prop its path.

| Why |
|---|
| a prop threaded through components that ignore it couples them all to it, and a state store made to avoid the threading makes the state global, shared by accident and kept after the screen that needed it. |
