# Imports

> Governs what each part of the interface imports, and the libraries whose home is in it.

## Binding units

### binding-unit-imports-nothing-of-the-ui · MUST

No binding unit imports anything of the interface: no screen, widget or component, which import it.

| Why |
|---|
| a binding unit that imports the interface forms a cycle with it — the acyclic dependencies principle. |

### binding-unit-consumed-only-by-screens-or-widgets · MUST

Within the interface, only screens and widgets consume binding units, and no presentational component does.

| Why |
|---|
| a component that reaches a binding unit renders only the data that unit gives, never what its caller hands it. |

### widget-works-wherever-it-is-placed · MUST

Every widget works wherever it is placed, needing nothing of the screen that holds it.

| Why |
|---|
| a widget that needs a screen's data breaks wherever else it is placed. |

## Widgets and components

### feature-ui-imports-nothing-of-its-workings → presentation-reaches-only-what-it-serves · MUST

Every widget and component of a feature imports of its feature only the members its surface offers. It imports no port and no use case of it. Exempt: a use case's read models, which they import as types alone.

| Why |
|---|
| an interface that imports how a feature works changes whenever that does, and a change of adapter reaches a screen — the dependency rule. |

### feature-ui-imports-only-ui-shared-layers · MUST

Of the program's code beyond its feature, every widget and component of a feature imports only `libs/ui`, `shared/ui` and the kernel. Of the kernel, it imports no port.

| Why |
|---|
| a widget or a component that imports another shared layer or a port reaches what renders nothing, and a change below the interface reaches the screen. |

### component-never-imports-a-widget · MUST

No presentational component imports a widget.

| Why |
|---|
| a component that holds a widget holds its logic too, and stops being presentational. |

## Libraries

### rendering-library-imported-by-the-presentation → layer-imports-dependencies-by-its-role · MUST

The library that renders the interface has its home in the presentation and the interface's shared components. Outside the edge, that is the presentation of features, of composition modules and of the program, its screens, widgets and components, and the binding units built on the library's state API, and the shared components of `shared/ui`; at the edge, the generic components and component primitives of `libs/ui`.

| Why |
|---|
| the view library is what a component is written in and what a binding unit is built on, and one imported anywhere else outside the edge ties a layer that renders nothing to it. |

### form-library-imported-by-the-ui → layer-imports-dependencies-by-its-role · MUST

The form library has its home in the interface's presentation. Outside the edge, that is the components and widgets of a presentation, where a form is built.

| Why |
|---|
| a form is presentation that holds its own state, and a form library imported anywhere else ties to it a binding unit or a layer below that needs nothing of it. |
