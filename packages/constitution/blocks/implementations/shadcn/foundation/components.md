# Components

> Governs the kit's components built from shadcn source: their polymorphism, parts and text.

## General

### polymorphism-through-render · SHOULD

The kit's one polymorphism is Base UI's `render` prop. A polymorphic render goes through it, and the kit adds no `as` or `asChild` of its own.

| Why |
|---|
| a second mechanism gives each component its own way to swap its element, which callers learn one by one and which joins the primitive's behaviour to the element differently each time. |

### parts-marked-by-data-slot · SHOULD

A primitive marks itself and each of its parts with `data-slot`, named after the part.

| Why |
|---|
| a part with no slot is reached by a class written for it or by its place in the markup, which breaks when the markup changes. |

### shadcn-text-passed-by-props → primitives-take-text-by-props · MUST

The text shadcn source ships is replaced by a prop when the source arrives. Each string it ships — a screen reader's "Close" among them — is removed on arrival, and the component takes it by a prop.

| Why |
|---|
| the shipped strings are English and fixed, so a kit that keeps them speaks one language whatever the program's locale. |
