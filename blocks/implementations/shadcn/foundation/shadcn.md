# shadcn

## complex-widgets-on-base-ui → complex-patterns-on-accessible-primitives
A dialog, popover, menu, select, combobox, tabs, tooltip, accordion and their kin that the platform's element does not carry are built on Base UI, through shadcn source created with Base UI (`shadcn init -b base`).

| Why | Check | Tags |
|---|---|---|
| Base UI carries the keyboard, focus and announcement behaviour these patterns need, and is the library shadcn generates on. | review | [] |

## polymorphism-through-render · SHOULD
A polymorphic render is Base UI's `render` prop, the kit's only polymorphism; no `as` or `asChild` of the kit's own.

| Why | Check | Tags |
|---|---|---|
| one mechanism renders the consumer's element with the primitive's behaviour, everywhere the same. | review | [] |


## shadcn-source-adapted-on-arrival → vendored-components-adapted-on-arrival · MUST
Before shadcn source is added, the kit is searched for an equivalent. Added source is, before review, restyled to tokens — its `outline-none` with a ring replaced by `focusable` — stripped of unused props, and made to follow the kit's prop rules.

| Why | Check | Tags |
|---|---|---|
| code kept as it came carries another project's looks and props; adapted on arrival, it is the kit's own. | review | [] |
