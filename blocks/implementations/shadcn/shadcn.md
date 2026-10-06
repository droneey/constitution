---
id: shadcn
summary: UI kit from shadcn source on Base UI primitives, adapted on arrival.
requires: [react-dom, tailwind]
extends: null
abstract: false
languages: []
dictionary: [shadcn, Base UI, components.json]
governs: ["components.json", "**/libs/ui/components/**"]
---

# shadcn

> The UI kit's components, added as source on Base UI primitives and made the project's own.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `ui-primitives-keyboard-and-focus` | Base UI implements the WAI-ARIA patterns: keyboard, focus, roles | yes |
| `ui-primitives-unstyled` | Base UI primitives carry no look; shadcn's classes are rewritten to tokens on arrival | yes |
| `ui-primitives-slot` | Base UI's `render` prop | yes |
