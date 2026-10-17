---
id: tailwind
summary: Styling with Tailwind — tokens, variant maps and class merging.
requires: [ui, browser, typescript, css]
extends: null
abstract: false
languages: []
dictionary: [Tailwind, cva, tailwind-merge, clsx, "@utility", "@theme"]
governs: ["**/*.css", "**/*.variants.ts"]
---

# Tailwind

> Styling through utilities generated from the design system's tokens, with `cva` for variant maps and `cn()` for merging classes.

### utilities-only-from-tokens → tokens-single-source-of-appearance · MUST

The theme's tokens are one `@theme` block that holds `--*: initial`, which resets every default scale at once, and defines only the design system's tokens; any other `@theme` block is `inline`, so a utility exists only for a token. No arbitrary value of any kind — a colour, a size or any other — is written in a class, save one that assigns a token's variable, with a suppression that says why.

| Why | Tags |
|---|---|
| with the default scales gone, a value outside the tokens cannot be written by accident. | [] |

### important-modifier-never-in-a-class-list → declaration-never-important · MUST

No class list uses the important modifier, `px-0!` or `!px-0`.

| Why | Tags |
|---|---|
| the modifier writes an `!important` declaration the stylesheet rule never sees. | [] |

### bare-utility-only-without-a-token · SHOULD

A utility with no token behind it — `flex`, `items-center`, `truncate` — is used only where a token would make no sense.

| Why | Tags |
|---|---|
| every visual value stays a token, and layout plumbing stays plain. | [ux] |

### mobile-first-breakpoints → breakpoints-add-to-the-smallest-screen · MUST

No class opens with a `max-*:` variant: base classes serve small screens and are widened by `md:`, `lg:` and `xl:`, and a range is bounded after its minimum, as in `md:max-lg:`.

| Why | Tags |
|---|---|
| styles that only widen never undo each other, and the smallest screen is always the base. | [] |

### screen-sized-classes-never-used → viewport-size-in-small-viewport-units · MUST

No class sizes with `h-screen` or `w-screen`.

| Why | Tags |
|---|---|
| `h-screen` is `100vh`, which ignores the browser's own toolbars on phones, and `w-screen` is `100vw`, which overflows beside a scrollbar. | [] |

### class-merger-knows-the-theme · MUST

The class merger is configured with every scale the theme defines — `extendTailwindMerge` given the theme's namespaces — and a spec proves that two classes of different groups both survive a merge.

| Why | Tags |
|---|---|
| with the default scales reset, the merger cannot tell a size from a colour of the theme and silently drops one of them. | [ux] |

### tailwind-layers-are-the-order → layer-order-declared-once · SHOULD

The order of the layers is Tailwind's — `theme, base, components, utilities` — with the project's layers named among them. Tailwind is imported layer by layer (`@import "tailwindcss/theme.css" layer(theme)` and the rest), and any other stylesheet from outside into a layer of its own.

| Why | Tags |
|---|---|
| Tailwind declares its layers itself; a second order would fight it. | [] |

## Accessibility

### focus-shown-by-focusable-utility → focus-always-visible · MUST

Focus is shown by the design system's `focusable` utility, which draws an outline, or by a ring beside `outline-hidden`; no other class removes an outline.

| Why | Tags |
|---|---|
| one utility draws the same visible ring everywhere, and no component removes focus without it. | [] |

### motion-tokens-honour-reduced-motion → reduced-motion-honoured · MUST

The motion tokens collapse under reduced motion, in the theme.

| Why | Tags |
|---|---|
| every animation reads the tokens, so one rule in the theme stops them all. | [] |

### type-tokens-in-rem → type-sized-in-rem · MUST

Font-size tokens are in `rem`, and line-height tokens are unitless ratios.

| Why | Tags |
|---|---|
| the user's text size then scales every text of the user interface. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `ui-styling-restricted-to-tokens` | `@theme` holds the tokens and resets the default scales | yes |
