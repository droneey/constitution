# Tokens

> Governs a token: its tier, its name, its source, the motion it times, the style of text it sets, and the proof that every pair of tokens reads.

## General

### token-sits-in-one-tier · MUST

A token sits in one tier: a primitive holds a raw value, a semantic token names a purpose by the grammar of token names and refers to a primitive, and a common token holds a constant of the application's shell, such as the space below its header.

| Why |
|---|
| the tier says where a token may be read and what may change it, so a theme changes primitives without touching a component. |

### component-reads-only-semantic-and-common-tokens · MUST

A component reads only semantic and common tokens, never a primitive.

| Why |
|---|
| a component that reads a primitive keeps its colour when the theme changes the purpose the colour served. |

### token-name-follows-the-grammar · MUST

A semantic or common token is named `<category>.<concept>.<role>[.<step>]`. The category is its family — `color`, `space`, `size`, `font`, `radius`, `shadow`, `motion`, `layer`; the concept is what it styles — `surface`, `text`, `border`, `action`; the role is its purpose or tone — `muted`, `danger`, `level-1`; the step is a place on a closed scale declared once — `sm`, `md`, `lg`. A primitive is named by its category, its scale and its step. Examples: `color.surface.level-1`, `color.text.muted`; a primitive, `color.blue.500`.

| Why |
|---|
| the name alone then says what a token styles and what for, and one search finds it in the source and in every output. |

### token-never-named-after-a-component · MUST

No token is named after a component — `card.background`, `button.padding-x`; a component's own look comes from its variants over semantic tokens.

| Why |
|---|
| a token named after one component cannot be shared, and turns the design system into a list of exceptions. |

### missing-value-added-as-a-token → tokens-single-source-of-appearance · MUST

A visual value no token holds is added as a token of the tier its meaning gives it, never written in place and never borrowed from a token whose name means something else.

| Why |
|---|
| a value borrowed from a token of another meaning changes when that meaning does, and one written in place is missed by every change of theme. |

### token-nothing-reads-deleted → dead-code-deleted · MUST

A token that no component, theme or other token reads is deleted, save a token a package publishes to others.

| Why |
|---|
| an unread token is a choice nobody makes, which every later reader weighs before picking a token. |

## Motion

### motion-from-tokens · MUST

Durations and easings are tokens, and motion driven from code reads the same tokens as motion in styles, so one request for reduced motion reaches all of it.

| Why |
|---|
| motion defined in one place feels consistent and is turned down in one place. |

## Typography

### font-token-is-one-typography-composite · MUST

A semantic `font` token always styles text, so its name leaves the concept out and takes the kind of text as its role — `font.body.md`, `font.heading.lg` — and it is one composite of the W3C Design Tokens format's `typography` type, whose `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing` and `lineHeight` each refer to a primitive of the matching scale — `font.family`, `font.size`, `font.weight`, `font.tracking`, `font.leading`, such as `font.weight.bold` — and whose line height is a unitless multiple of its font size, as the format's `lineHeight` takes it; a property of text is a primitive's scale, never a role.

| Why |
|---|
| a component reads one token for a style of text, never several that must change together; a segment every font token would repeat says nothing, and a property where the purpose belongs names a raw value as if it were a purpose; a line height that scales with the font size stays right when a theme changes the size. |

## Source

### tokens-sourced-from-the-dtcg-file · MUST

The design system's tokens have one source, a file in the W3C Design Tokens format (`.tokens.json`), and every platform's output — a stylesheet, a module of constants — is generated from it.

| Why |
|---|
| one source in an open format is read by design tools and by every platform alike, so they never drift apart. |

## Proof

### contrast-tested-over-token-pairs → text-and-controls-meet-the-contrast-minimum · MUST

Contrast is proven by a test over each pair of foreground and background tokens the design system declares, in every mode.

| Why |
|---|
| a test over the declared pairs proves every screen at once and fails the change that breaks a pair, without checking combinations no screen uses. |
