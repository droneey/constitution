# Components

> Governs the kit's components built from shadcn source: their primitives, polymorphism, parts, adaptation and text.

## General

### complex-widgets-on-base-ui → complex-pattern-built-on-accessible-primitives · MUST

A dialog, popover, menu, select, combobox, tabs, tooltip, accordion and their kin are built on Base UI, through shadcn source made for Base UI, the dialog, the popover and the accordion included: Base UI is the active library of accessible primitives that the browser's `<dialog>`, `popover` and `<details>` give way to, and it places its popovers itself.

| Why |
|---|
| Base UI carries the keyboard, focus and announcement behaviour these patterns need, and more than the browser's elements do: a dialog's scroll lock, its light dismiss in Safari and its controlled state; a popover that opens on hover after a delay and holds focus as a modal; arrow, Home and End keys between an accordion's headers. |

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

### shadcn-source-adapted-on-arrival → vendored-component-adapted-in-the-change-that-installs-it · MUST

Before shadcn source is added, the kit is searched for an equivalent. Added source is, before review, restyled to tokens, stripped of unused props, and made to follow the kit's prop rules.

| Why |
|---|
| code kept as it came carries another project's looks and props; adapted on arrival, it is the kit's own. |

### shadcn-text-passed-by-props → primitives-take-text-by-props · MUST

The text shadcn source ships — a screen reader's "Close" among it — is removed on arrival, and the component takes it by a prop.

| Why |
|---|
| the shipped strings are English and fixed, so a kit that keeps them speaks one language whatever the program's locale. |
