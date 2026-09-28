# shadcn

## complex-widgets-on-radix → complex-patterns-on-accessible-primitives
A dialog, popover, menu, select, combobox, tabs, tooltip, accordion and their kin are built on Radix, directly or through shadcn source.

| Why | Check | Tags |
|---|---|---|
| Radix carries the keyboard, focus and announcement behaviour these patterns need. | review | [] |

## slot-behind-as-child · SHOULD
A polymorphic render is Radix's `Slot` behind `asChild`, the only `as` prop.

| Why | Check | Tags |
|---|---|---|
| one mechanism renders the consumer's element with the primitive's behaviour, everywhere the same. | review | [] |

## shadcn-source-adapted-on-arrival → vendored-components-adapted-on-arrival · MUST
Before shadcn source is added, the kit is searched for an equivalent. Added source is, before review, restyled to tokens, stripped of unused props, and made to follow the kit's prop rules.

| Why | Check | Tags |
|---|---|---|
| code kept as it came carries another project's looks and props; adapted on arrival, it is the kit's own. | review | [] |
