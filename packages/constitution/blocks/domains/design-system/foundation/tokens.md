# Tokens

> Governs a token: its tier, its name, its source, the motion it times, the style of text it sets, and the proof that every pair of tokens reads.

## General

### token-sits-in-one-tier · MUST

A token sits in one tier. A primitive holds a raw value, a semantic token names a purpose by the grammar of token names and refers to a primitive, and a common token holds a constant of the program's shell, such as the space below its header.

| Why |
|---|
| a token that mixes tiers is read where a raw value should not be and changed by what should not reach it, so a change of theme reaches into the components. |

### component-reads-only-semantic-and-common-tokens · MUST

A component reads only semantic and common tokens, never a primitive.

| Why |
|---|
| a component that reads a primitive keeps its colour when the theme changes the purpose the colour served. |

### token-name-follows-the-grammar · MUST

Every token is named by the grammar of its tier. A semantic or common token is named `<category>.<concept>.<role>[.<step>]`. The category is its family — `color`, `space`, `size`, `font`, `radius`, `shadow`, `motion`, `layer`; the concept is what it styles — `surface`, `text`, `border`, `action` — never a component such as `card` or `button`, whose own look comes from its variants over semantic tokens; the role is its purpose or tone — `muted`, `danger`, `level-1`; the step is a place on a closed scale declared once — `sm`, `md`, `lg`. A primitive is named by its category, its scale and its step.

| Why |
|---|
| a token named outside the grammar does not say what it styles or what for, a search misses its other spellings in the source and the outputs, and a token named after one component cannot be shared. |

### missing-value-added-as-a-token → tokens-single-source-of-appearance · MUST

A visual value no token holds is added as a token. It takes the tier its meaning gives it, and is never written in place nor borrowed from a token whose name means something else.

| Why |
|---|
| a value borrowed from a token of another meaning changes when that meaning does, and one written in place is missed by every change of theme. |

### token-nothing-reads-deleted → dead-code-deleted · MUST

A token nothing reads is deleted. That is a token no component, theme or other token reads, save one a package publishes to others.

| Why |
|---|
| an unread token offers a choice nobody makes, which every later reader weighs before picking a token, and one picked by mistake ties a component to a purpose it does not serve. |

## Motion

### motion-from-tokens · MUST

Durations and easings are tokens. Motion driven from code reads the same tokens as motion in styles, so one request for reduced motion reaches all of it.

| Why |
|---|
| motion timed outside the tokens drifts from the rest, and a request for reduced motion misses whatever it is not wired to. |

## Typography

### font-token-is-one-typography-composite · MUST

A semantic `font` token is one typography composite. It is named `font.<kind of text>.<step>` and is one composite of the W3C Design Tokens `typography` type whose `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing` and `lineHeight` each refer to a primitive of `font.family`, `font.size`, `font.weight`, `font.tracking` and `font.leading`, the line height a unitless multiple of the size.

| Why |
|---|
| a style of text read from several tokens changes in one and not in the others, and a line height fixed in a unit stays as it was when a theme changes the size, so the lines crowd or gape — the W3C Design Tokens format. |

## Source

### tokens-sourced-from-the-dtcg-file · MUST

The design system's tokens have one source, a file in the W3C Design Tokens format (`.tokens.json`). Every platform's output — a stylesheet, a module of constants — is generated from it.

| Why |
|---|
| tokens kept apart for a design tool and for each platform drift apart, so a screen no longer matches its design or the same screen on another platform — a single source of truth. |

## Proof

### contrast-tested-over-token-pairs → text-and-controls-meet-the-contrast-minimum · MUST

Contrast is proven by a test over the declared token pairs. The test covers each pair of foreground and background tokens the design system declares, in every mode.

| Why |
|---|
| contrast checked screen by screen misses the pair the next screen uses, and a change of token that breaks a pair ships until someone looks at that screen in that mode — WCAG 2.2, Contrast (Minimum) and Non-text Contrast. |
