# shadcn

## complex-widgets-on-base-ui → complex-patterns-on-accessible-primitives
A dialog, popover, menu, select, combobox, tabs, tooltip, accordion and their kin are built on Base UI, through shadcn source created with Base UI (`shadcn init -b base`), the dialog, the popover and the accordion included: Base UI is the active block whose primitives the browser's `<dialog>`, `popover` and `<details>` give way to, and positions its popovers itself.

| Why | Check | Tags |
|---|---|---|
| Base UI carries the keyboard, focus and announcement behaviour these patterns need, and more than the browser's elements do: a dialog's scroll lock, its light dismiss in Safari and its controlled state; a popover that opens on hover after a delay and holds focus as a modal; arrow, Home and End keys between an accordion's headers. | review | [] |

## polymorphism-through-render · SHOULD
A polymorphic render is Base UI's `render` prop, the kit's only polymorphism; no `as` or `asChild` of the kit's own.

| Why | Check | Tags |
|---|---|---|
| one mechanism renders the consumer's element with the primitive's behaviour, everywhere the same. | review | [] |

## parts-marked-by-data-slot · SHOULD
A primitive marks itself and each of its parts with `data-slot`, named after the part.

| Why | Check | Tags |
|---|---|---|
| a caller and a spec then reach a part by its slot, as shadcn source does, with no class written for it. | review | [ux] |

## shadcn-source-adapted-on-arrival → vendored-components-adapted-on-arrival · MUST
Before shadcn source is added, the kit is searched for an equivalent. Added source is, before review, restyled to tokens, stripped of unused props, and made to follow the kit's prop rules.

| Why | Check | Tags |
|---|---|---|
| code kept as it came carries another project's looks and props; adapted on arrival, it is the kit's own. | review | [] |
