---
id: shadcn
summary: UI kit from shadcn source on Base UI primitives, adapted on arrival.
requires: [react-dom, tailwind, json]
extends: null
abstract: false
languages: []
governs: ["components.json", "**/libs/ui/components/**"]
---

# shadcn

> The UI kit's components, added as **`shadcn`** source on **Base UI** primitives and made the project's own; **`components.json`** names the kit's folders.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `ui-primitives-keep-keyboard-and-focus` | Base UI implements the WAI-ARIA patterns: keyboard, focus, roles | yes |
| `ui-primitives-unstyled` | Base UI primitives carry no look; shadcn's classes are rewritten to tokens on arrival | yes |
