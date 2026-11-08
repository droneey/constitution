# Tokens

> Governs a token: its token tier, its name, its source, the motion it times, the style of text it sets, and the proof that every pair of tokens meant to sit together reads.

## Vocabulary

The **design system** is the product's own source of its look: its design tokens, the scales they are named on, its theme and the component primitives built on them.

Each design token of the design system sits in a **token tier**: a **primitive token** holds a raw value; a **semantic token** names a purpose and refers to a primitive token, or to a value a declared rule derives from primitive tokens; a **common token** holds a constant of the program's shell, such as the space below its header.

The **token grammar**{#token-grammar} names a semantic or a common token `<category>.<concept>.<role>[.<step>]`. Its category is its family, one of `color`, `space`, `size`, `font`, `radius`, `shadow`, `motion` and `layer`, a stacking order, one for each kind of appearance `tokens-single-source-of-appearance` names; its concept is what it styles, such as `surface`, `text`, `border` or `action`; its role is its purpose or tone, such as `muted`, `danger` or `level-1`; and its step is a place on a closed scale the design system declares once, such as `sm`, `md` and `lg`. A semantic `font` token takes the kind of text it sets as its concept and a step in place of its role, `font.<kind of text>.<step>`, such as `font.heading.lg`. The grammar names a primitive token by its category, its scale and its step.

The **token source** is the design system's one file of tokens in the W3C Design Tokens format, **`.tokens.json`**{#token-source}.

## General

### token-sits-in-one-tier · SHOULD

Every design token sits in one token tier and holds only what that token tier holds.

| Why |
|---|
| a token that mixes token tiers is read where a raw value should not be and changed by what should not reach it, so a change of theme reaches into the components. |

### component-never-reads-a-primitive-token · MUST

No component reads a primitive token. It reads only semantic and common tokens.

| Why |
|---|
| a component that reads a primitive token keeps its colour when the theme changes the purpose the colour served. |

### token-name-follows-the-grammar · SHOULD

Every token is named by the token grammar for its token tier.

| Why |
|---|
| a token named outside the grammar does not say what it styles or what for, and a search misses its other spellings in the source and the outputs. |

### token-concept-never-a-component · SHOULD

No token's concept names a component, such as `card` or `button`. A component's own look comes from its component variants over semantic tokens.

| Why |
|---|
| a token named after one component cannot be shared, and every new component then adds tokens of its own that drift from its neighbours. |

### token-never-borrowed-for-another-meaning → tokens-single-source-of-appearance · MUST

No component takes a value from a token whose name means something other than the purpose it serves there.

| Why |
|---|
| a value borrowed from a token of another meaning changes when that meaning does, and the component changes with it unasked. |

### token-nothing-reads-deleted → dead-code-deleted · MUST

Every token nothing reads, no component, theme or other token, is deleted. Exempt: a token a package publishes to others.

| Why |
|---|
| an unread token offers a choice nobody makes, which every later reader weighs before picking a token, and one picked by mistake ties a component to a purpose it does not serve. |

## Motion

### motion-from-tokens → tokens-single-source-of-appearance · MUST

Every motion driven from code reads the same duration and easing tokens as motion in styles.

| Why |
|---|
| motion timed outside the tokens drifts from the rest, and a request for reduced motion misses whatever it is not wired to. |

## Typography

### font-token-is-one-typography-composite · MUST

Every semantic `font` token is one composite of the W3C Design Tokens `typography` type. Its `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing` and `lineHeight` each refer to a primitive token of `font.family`, `font.size`, `font.weight`, `font.tracking` and `font.leading`.

| Why |
|---|
| a style of text read from several tokens changes in one and not in the others, so a heading takes a new size with its old weight — the W3C Design Tokens format. |

### line-height-a-unitless-multiple · MUST

Every line height a token holds is a unitless multiple of the size of its text.

| Why |
|---|
| a line height fixed in a unit stays as it was when a theme changes the size, so the lines crowd or gape. |

## Source

### tokens-declared-in-the-token-source → fact-has-one-source · MUST

Every token of the design system is declared in its token source.

| Why |
|---|
| tokens kept apart for a design tool and for each platform drift apart, so a screen no longer matches its design or the same screen on another platform — a single source of truth. |

## Proof

### contrast-tested-over-token-pairs → content-meets-the-contrast-minimum · MUST

Every text token's contrast is tested over each background token it is meant to sit on, in every theme mode. Those pairs are declared beside the tokens.

| Why |
|---|
| contrast checked screen by screen misses the pair the next screen uses, and a change of token that breaks a pair ships until someone looks at that screen in that theme mode — WCAG 2.2, Contrast (Minimum). |

### non-text-contrast-tested-over-token-pairs → control-meets-the-non-text-contrast-minimum · MUST

Every non-text token's contrast is tested over each background token it is meant to sit on, in every theme mode. A non-text token draws a control or a graphic, such as a border, a focus ring or an icon, and its pairs are declared beside the tokens.

| Why |
|---|
| a border or a focus ring checked screen by screen misses the pair the next screen uses, and a change of token that fades it ships until someone looks at that screen in that theme mode — WCAG 2.2, Non-text Contrast. |
