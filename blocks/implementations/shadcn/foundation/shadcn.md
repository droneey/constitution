# shadcn

## complex-widgets-on-radix · MUST
A dialog, popover, menu, select, combobox, tabs, tooltip, accordion and their kin are built on Radix, directly or through shadcn source.
**Why:** Radix carries the keyboard, focus and announcement behaviour these patterns need.
**Check:** review
**Tags:** a11y
**Implements:** `complex-patterns-on-accessible-primitives`

## slot-behind-as-child · SHOULD
A polymorphic render is Radix's `Slot` behind `asChild`, the only `as` prop.
**Why:** one mechanism renders the consumer's element with the primitive's behaviour, everywhere the same.
**Check:** review
**Tags:** architecture
