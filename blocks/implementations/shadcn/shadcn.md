---
id: shadcn
kind: implementation
summary: UI kit from shadcn source on Radix primitives, adapted on arrival.
chapters: []
requires: [react-dom, tailwind]
extends: null
abstract: false
checks: []
owns: [shadcn, Radix, components.json]
governs: ["components.json", "**/libs/ui/components/**"]
status: stable
---

# shadcn

> The UI kit's components, added as source on Radix primitives and made the project's own.

## complex-widgets-on-radix · MUST
A dialog, popover, menu, select, combobox, tabs, tooltip, accordion and their kin are built on Radix, directly or through shadcn source.
**Why:** Radix carries the keyboard, focus and announcement behaviour these patterns need.
**Check:** review
**Tags:** a11y
**Implements:** `complex-patterns-on-accessible-primitives`

## shadcn-source-adapted-on-arrival · MUST
shadcn source is added with its CLI into the UI kit, after the kit is searched for an equivalent — never imported from a package — and adapted before review: placed and named, restyled to tokens, stripped of unused props, its props conformed, its imports rewritten to the project's alias. `components.json` points the CLI at the kit's folders.
**Why:** code kept as it came carries another project's names and looks; adapted on arrival, it is the kit's own.
**Check:** review
**Tags:** ux, architecture
**Implements:** `vendored-components-adapted-on-arrival`

## slot-behind-as-child · SHOULD
A polymorphic render is Radix's `Slot` behind `asChild`, the only `as` prop.
**Why:** one mechanism renders the consumer's element with the primitive's behaviour, everywhere the same.
**Check:** review
**Tags:** architecture

## Requirements

| Requirement | How in shadcn | Status |
|---|---|---|
| `ui-primitives-keyboard-and-focus` | Radix implements the WAI-ARIA patterns: keyboard, focus, roles | met |
| `ui-primitives-unstyled` | Radix primitives carry no look; shadcn's classes are rewritten to tokens on arrival | met |
| `ui-primitives-text-by-props` | the source ships English strings, such as a screen reader's "Close" | partial: removed on arrival, the text passed by props |
| `ui-primitives-slot` | Radix `Slot` | met |
