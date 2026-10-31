# Components

> Governs the kit's components built from shadcn source: their polymorphism, parts and text.

## General

### polymorphism-through-render · SHOULD

A polymorphic render is Base UI's `render` prop, the kit's only polymorphism; no `as` or `asChild` of the kit's own.

| Why |
|---|
| one mechanism renders the consumer's element with the primitive's behaviour, everywhere the same. |

### parts-marked-by-data-slot · SHOULD

A primitive marks itself and each of its parts with `data-slot`, named after the part.

| Why |
|---|
| a caller and a spec then reach a part by its slot, as shadcn source does, with no class written for it. |

### shadcn-text-passed-by-props → primitives-take-text-by-props · MUST

The text shadcn source ships — a screen reader's "Close" among it — is removed on arrival, and the component takes it by a prop.

| Why |
|---|
| the shipped strings are English and fixed, so a kit that keeps them speaks one language whatever the program's locale. |
