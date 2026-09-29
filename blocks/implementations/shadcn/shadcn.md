---
id: shadcn
summary: UI kit from shadcn source on Radix primitives, adapted on arrival.
requires: [react-dom, tailwind]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [shadcn, Radix, components.json]
governs: ["components.json", "**/libs/ui/components/**"]
---

# shadcn

> The UI kit's components, added as source on Radix primitives and made the project's own.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `ui-primitives-keyboard-and-focus` | Radix implements the WAI-ARIA patterns: keyboard, focus, roles | yes |
| `ui-primitives-unstyled` | Radix primitives carry no look; shadcn's classes are rewritten to tokens on arrival | yes |
| `primitives-take-text-by-props` | the source ships English strings, such as a screen reader's "Close"; removed on arrival, the text passed by props | partly |
| `ui-primitives-slot` | Radix `Slot` | yes |
