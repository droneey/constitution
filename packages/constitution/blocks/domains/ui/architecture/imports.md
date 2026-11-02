# Imports

> Governs what each piece of the interface imports, and the libraries whose home is in it.

## Binding units

### binding-unit-imports-nothing-of-the-ui · MUST

A binding unit imports nothing of the interface. It imports no screen, widget or component, which import it.

| Why |
|---|
| a binding unit that imports the interface forms a cycle with it — the acyclic dependencies principle. |

### binding-units-consumed-by-screens-and-widgets · MUST

Within the interface, only screens and self-sufficient widgets consume binding units. A component never does, and a widget works wherever it is placed.

| Why |
|---|
| a component that reaches a binding unit renders only the data that unit gives, never what its caller hands it, and a widget that needs a screen's data breaks wherever else it is placed. |

## Widgets and components

### feature-widgets-and-components-import-nothing-of-its-workings → import-points-inward · MUST

A feature's widgets and components import nothing of how the feature works. They import only `libs/ui`; `shared/ui`; the feature's own binding units; its aggregates with their inner entities and its value objects, enumerations among them, each with its type, predicates and derived values; the read models its queries return, as types from the surface of its use cases; its errors' codes; and the kernel, save its ports. They never import an adapter, a port — the kernel's included —, a use case or an aggregate's transitions, its rebuild from storage among them.

| Why |
|---|
| an interface that imports how a feature works changes whenever that does, and a change of adapter reaches a screen — the dependency rule. |

### component-never-imports-a-widget · MUST

A component never imports a widget.

| Why |
|---|
| a component that holds a widget holds its logic too, and stops being presentational. |

## Libraries

### rendering-library-imported-by-the-presentation → layer-imports-dependencies-by-its-role · MUST

The library that renders the interface has its home in the presentation and the interface's shared pieces. Outside the edge, that is the presentation of features, of composition modules and of the program — its screens, widgets and components, and the binding units built on the library's state API — and the shared pieces of `shared/ui`; at the edge, the generic pieces of `libs/ui`.

| Why |
|---|
| the view library is what a component is written in and what a binding unit is built on, and one imported anywhere else outside the edge ties a layer that renders nothing to it. |

### form-library-imported-by-the-ui → layer-imports-dependencies-by-its-role · MUST

The form library has its home in the interface's presentation. Outside the edge, that is the components and widgets of a presentation, where a form is built.

| Why |
|---|
| a form is presentation that holds its own state, and a form library imported anywhere else ties to it a binding unit or a layer below that needs nothing of it. |
