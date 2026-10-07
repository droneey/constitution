---
id: design-system
summary: The tokens, variants, modes and primitives of an interface's look.
requires: [ui]
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Design system

> A product that owns the look of its interface: tokens in tiers and from one source, the variants and modes drawn from them, the kit of primitives built on them, and the proof that every pair of them reads. A product that uses another's design system lists `ui` alone.

## Primitives

### primitive-passes-its-element-through · SHOULD
A primitive accepts its element's own props and reference, except a boolean it names with its own prefix, and merges its own props and handlers with the caller's.

| Why | Tags |
|---|---|
| without it every consumer wraps or forks the primitive for one attribute. | [ux] |

## Tokens

### token-sits-in-one-tier · MUST
A token sits in one tier: a primitive holds a raw value, a semantic token names a purpose by the grammar of token names and refers to a primitive, and a common token holds a constant of the application's shell, such as the space below its header.

| Why | Tags |
|---|---|
| the tier says where a token may be read and what may change it, so a theme changes primitives without touching a component. | [ux] |

### component-reads-only-semantic-and-common-tokens · MUST
A component reads only semantic and common tokens, never a primitive.

| Why | Tags |
|---|---|
| a component that reads a primitive keeps its colour when the theme changes the purpose the colour served. | [] |

### token-name-follows-the-grammar · MUST
A semantic or common token is named `<category>.<concept>.<role>[.<step>]`. The category is its family — `color`, `space`, `size`, `font`, `radius`, `shadow`, `motion`, `layer`; the concept is what it styles — `surface`, `text`, `border`, `action`; the role is its purpose or tone — `muted`, `danger`, `level-1`; the step is a place on a closed scale declared once — `sm`, `md`, `lg`. A primitive takes its category, its scale and its step. Examples: `color.surface.level-1`, `color.text.muted`, `font.text.body.sm`; a primitive, `color.blue.500`.

| Why | Tags |
|---|---|
| the name alone then says what a token styles and what for, and one search finds it in the source and in every output. | [ux] |

### token-never-named-after-a-component · MUST
No token is named after a component — `card.background`, `button.padding-x`; a component's own look comes from its variants over semantic tokens.

| Why | Tags |
|---|---|
| a token named after one component cannot be shared, and turns the design system into a list of exceptions. | [] |

### missing-value-added-as-a-token → tokens-single-source-of-appearance · MUST
A visual value no token holds is added as a token of the tier its meaning gives it, never written in place and never borrowed from a token whose name means something else.

| Why | Tags |
|---|---|
| a value borrowed from a token of another meaning changes when that meaning does, and one written in place is missed by every change of theme. | [ux] |

## Variants

### own-variants-one-typed-map · MUST
A component's own variants — the look only its root needs, such as its `size` or `tone` — are one declarative map from variant to style, which also types the variant props; no condition outside the map decides a style, and no second declaration repeats an axis.

| Why | Tags |
|---|---|
| the map is the one place a variant is defined, so adding one cannot miss a copy and the props cannot disagree with it. | [ux] |

### cascading-variant-set-once-on-ancestor · MUST
A variant that restyles descendants — a themed subtree, a look set by a parent — is set once on their ancestor and resolved by the platform's inheritance of styles, or where it has none by the theme's own scope, never passed down as a prop.

| Why | Tags |
|---|---|
| a prop drilled for looks couples every component in between to a decision only the ancestor and the leaves care about. | [ux] |

### variant-values-from-shared-scales · SHOULD
Variant values come from scales the design system declares once for every component — a size such as `sm`, `md`, `lg`, a tone such as `neutral`, `brand`, `danger` — and a component takes the subset it needs.

| Why | Tags |
|---|---|
| a size or a tone then means the same on every component, and a caller never learns a new word for it. | [ux] |

## Modes

### theme-modes-share-one-token-set · MUST
The modes a design system offers — light, dark, increased contrast — are modes of one set of semantic tokens: every mode resolves the same names, and a component is written once for all of them.

| Why | Tags |
|---|---|
| a component written per mode doubles every style, and the mode a change forgets ships broken. | [ux, a11y] |

### mode-values-derived-by-rule · SHOULD
The values of each mode are derived from the primitives by a declared rule and recomputed when a primitive changes, never picked by eye.

| Why | Tags |
|---|---|
| derived values keep contrast right when a colour changes, and a value picked by eye is the first to break it. | [ux, a11y] |

### theme-follows-system-until-chosen · SHOULD
The theme follows the system's preference until the user chooses one; the choice persists and is applied before the first paint.

| Why | Tags |
|---|---|
| a theme applied after the first paint flashes the wrong one, and a choice lost on reload is a choice the user makes every visit. | [ux] |

## Motion

### motion-from-tokens · MUST
Durations and easings are tokens, and motion driven from code reads the same tokens as motion in styles, so one request for reduced motion reaches all of it.

| Why | Tags |
|---|---|
| motion defined in one place feels consistent and is turned down in one place. | [ux, a11y] |

## Source

### tokens-sourced-from-the-dtcg-file · MUST
The design system's tokens have one source, a file in the W3C Design Tokens format (`.tokens.json`), and every platform's output — a stylesheet, a module of constants — is generated from it.

| Why | Tags |
|---|---|
| one source in an open format is read by design tools and by every platform alike, so they never drift apart. | [ux] |

### retired-token-marked-deprecated → retired-code-marked-deprecated · SHOULD
A token to be removed is first marked deprecated in the source, naming its replacement, and removed only once nothing reads it.

| Why | Tags |
|---|---|
| a token removed at once breaks every reader the change did not see, and the mark shows each of them the way off. | [ux] |

## Proof

### contrast-tested-over-token-pairs → text-and-controls-meet-the-contrast-minimum · MUST
Contrast is proven by a test over each pair of foreground and background tokens the design system declares, in every mode.

| Why | Tags |
|---|---|
| a test over the declared pairs proves every screen at once and fails the change that breaks a pair, without checking combinations no screen uses. | [a11y, testing] |

### primitive-shown-in-every-variant-and-state · SHOULD
Each primitive of the design system is shown in each of its variants and states, in every mode, in one place that people and screenshot specs both see.

| Why | Tags |
|---|---|
| a variant nobody renders breaks unseen, and one showcase is what a review and a screenshot compare. | [ux, testing] |

## Requirements for implementation

### ui-styling-restricted-to-tokens · MUST
The library lets its default scales be reset, so a check rejects a value outside the tokens.

| Why | Tags |
|---|---|
| without it, the rule that tokens are the only source of appearance cannot be held by a tool. | [ux] |

### ui-styling-resolves-every-mode-from-one-set · SHOULD
The library resolves every mode from one set of token names.

| Why | Tags |
|---|---|
| a library that needs a second set per mode doubles every style. | [ux] |
