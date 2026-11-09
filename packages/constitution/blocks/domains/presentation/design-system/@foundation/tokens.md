# Tokens

> Governs a token: its token tier, its name, its source, the motion it times, the style of text it sets, and the proof that every pair of tokens meant to sit together reads.

## Vocabulary

The **design system** is the product's own source of its look: its design tokens, the scales they are named on, its theme and the component primitives built on them.

Each design token of the design system sits in a **token tier**: a **primitive token** holds a raw value; a **semantic token** names a purpose and refers to a primitive token, or to a value a declared rule derives from primitive tokens; a **common token** holds a constant of the program's shell, such as the space below its header.

The **token grammar**{#token-grammar} names a semantic or a common token `<category>.<concept>.<role>[.<step>]`. Its category is its family, one of `color`, `space`, `size`, `font`, `radius`, `shadow`, `motion` and `layer`, a stacking order, one for each kind of appearance `tokens-single-source-of-appearance` names; its concept is what it styles, such as `surface`, `text`, `border` or `action` for a colour, `inset` or `gap` for a space, `icon` or `target` for a size and `control` for a radius; its role is its purpose or tone, such as `muted`, `danger` or `level-1`; and its step is a place on a closed scale the design system declares once, such as `sm`, `md` and `lg`. A concept whose tokens differ only by a step takes the step in place of its role, such as `space.inset.md`, `radius.control.sm` or `size.icon.lg`. A semantic `font` token takes the kind of text it sets as its concept and a step in place of its role, `font.<kind of text>.<step>`, such as `font.heading.lg`, and a semantic `motion` token takes the kind of motion it times, `motion.<kind of motion>.<step>`, such as `motion.enter.standard` or `motion.exit.quick`. The grammar names a primitive token by its category, its scale and its step.

The **token source** is the design system's one file of tokens in the W3C Design Tokens format, its name ending in **`.tokens.json`**{#token-source}.

## General

### token-sits-in-one-tier · SHOULD

Every design token sits in one token tier and holds only what that token tier holds.

#### Why

A token that mixes token tiers is read where a raw value should not be and changed by what should not reach it, so a change of theme reaches into the components.

#### Examples

```pseudo title="Avoid"
color.blue.600 = "#2457f5"
color.action.primary = "#2457f5"
color.red.danger = "#d92d20"
```

```pseudo title="Prefer"
color.blue.600 = "#2457f5"
color.red.600 = "#d92d20"
color.action.primary = {color.blue.600}
color.text.danger = {color.red.600}
```

### component-never-reads-a-primitive-token · MUST

No component reads a primitive token. It reads only semantic and common tokens.

#### Why

A component that reads a primitive token keeps its colour when the theme changes the purpose the colour served.

#### Examples

```pseudo title="Avoid"
# libs/ui/button
let buttonStyle = {
  background: tokens.color.blue.600,
  text: tokens.color.gray.50
}
```

```pseudo title="Prefer"
# libs/ui/button
let buttonStyle = {
  background: tokens.color.action.primary,
  text: tokens.color.text.inverse
}
```

### token-name-follows-the-grammar · SHOULD

Every token is named by the token grammar for its token tier.

#### Why

A token named outside the grammar does not say what it styles or what for, and a search misses its other spellings in the source and the outputs.

#### Examples

```pseudo title="Avoid"
primaryBlue = {color.blue.600}
muted-bg = {color.gray.100}
text-red = {color.red.600}
elevation1 = {shadow.soft.100}
```

```pseudo title="Prefer"
color.action.primary = {color.blue.600}
color.surface.muted = {color.gray.100}
color.text.danger = {color.red.600}
shadow.surface.level-1 = {shadow.soft.100}
```

### token-concept-never-a-component · SHOULD

No token's concept names a component, such as `card` or `button`. A component's own look comes from its component variants over semantic tokens.

#### Why

A token named after one component cannot be shared, and every new component then adds tokens of its own that drift from its neighbours.

#### Examples

```pseudo title="Avoid"
color.card.background = {color.gray.50}
radius.button.default = {radius.base.200}

# libs/ui/card
let cardStyle = { background: tokens.color.card.background }
```

```pseudo title="Prefer"
color.surface.raised = {color.gray.50}
radius.control.default = {radius.base.200}

# libs/ui/card
let cardStyle = { background: tokens.color.surface.raised }
```

### token-never-borrowed-for-another-meaning → tokens-single-source-of-appearance · MUST

No component takes a value from a token whose name means something other than the purpose it serves there.

#### Why

A value borrowed from a token of another meaning changes when that meaning does, and the component changes with it unasked.

#### Examples

```pseudo title="Avoid"
# libs/ui/divider
let dividerStyle = {
  color: tokens.color.text.muted  # the same grey, for now
}
```

```pseudo title="Prefer"
# libs/ui/divider
let dividerStyle = {
  color: tokens.color.border.muted
}
```

### token-nothing-reads-deleted → dead-code-deleted · MUST

Every token nothing reads, no component, theme or other token, is deleted. Exempt: a token a package publishes to others.

#### Why

An unread token offers a choice nobody makes, which every later reader weighs before picking a token, and one picked by mistake ties a component to a purpose it does not serve.

#### Examples

```pseudo title="Avoid"
color.surface.default = {color.gray.50}
color.surface.muted = {color.gray.100}
color.surface.sunken = {color.gray.200}  # nothing reads it
```

```pseudo title="Prefer"
color.surface.default = {color.gray.50}
color.surface.muted = {color.gray.100}
```

## Motion

### motion-from-tokens → tokens-single-source-of-appearance · MUST

Every motion driven from code reads the same motion tokens as motion in styles.

#### Why

Motion timed outside the tokens drifts from the rest, and a request for reduced motion misses whatever it is not wired to.

#### Examples

```pseudo title="Avoid"
# libs/ui/drawer
function openDrawer(drawer)
  call animate(drawer, { offset: 0 }, { duration: 240, easing: "ease-out" })
```

```pseudo title="Prefer"
# libs/ui/drawer
function openDrawer(drawer)
  call animate(drawer, { offset: 0 }, { transition: tokens.motion.enter.standard })
```

### motion-token-is-one-transition-composite · MUST

Every semantic `motion` token is one composite of the W3C Design Tokens `transition` type. Its `duration` and `delay` each refer to a primitive token of `motion.duration`, and its `timingFunction` to one of `motion.easing`.

#### Why

A motion read from several tokens changes in one and not in the others, so an entrance takes a new duration with its old curve — the W3C Design Tokens format.

#### Examples

```pseudo title="Avoid"
motion.enter.standard.duration = {motion.duration.200}
motion.enter.standard.easing = {motion.easing.out}
```

```pseudo title="Prefer"
motion.enter.standard = transition {
  duration: {motion.duration.200},
  timingFunction: {motion.easing.out},
  delay: {motion.duration.0}
}
```

## Typography

### font-token-is-one-typography-composite · MUST

Every semantic `font` token is one composite of the W3C Design Tokens `typography` type. Its `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing` and `lineHeight` each refer to a primitive token of `font.family`, `font.size`, `font.weight`, `font.tracking` and `font.leading`.

#### Why

A style of text read from several tokens changes in one and not in the others, so a heading takes a new size with its old weight — the W3C Design Tokens format.

#### Examples

```pseudo title="Avoid"
font.heading.lg.size = {font.size.700}
font.heading.lg.weight = {font.weight.bold}
font.heading.lg.leading = {font.leading.snug}
```

```pseudo title="Prefer"
font.heading.lg = typography {
  fontFamily: {font.family.sans},
  fontSize: {font.size.700},
  fontWeight: {font.weight.bold},
  letterSpacing: {font.tracking.tight},
  lineHeight: {font.leading.snug}
}
```

### line-height-a-unitless-multiple · MUST

Every line height a token holds is a unitless multiple of the size of its text.

#### Why

A line height fixed in a unit stays as it was when a theme changes the size, so the lines crowd or gape.

#### Examples

```pseudo title="Avoid"
font.leading.snug = "28px"
font.leading.relaxed = "1.75rem"
```

```pseudo title="Prefer"
font.leading.snug = 1.25
font.leading.relaxed = 1.6
```

## Source

### tokens-declared-in-the-token-source → fact-has-one-source · MUST

Every token of the design system is declared in its token source.

#### Why

Tokens kept apart for a design tool and for each platform drift apart, so a screen no longer matches its design or the same screen on another platform — a single source of truth.

#### Examples

```text title="Avoid"
libs/ui/theme/
├── web-colors               the web's values, kept by hand
├── mobile-colors            the mobile app's, copied from them
└── design-tool-library      the design tool's, exported apart
```

```text title="Prefer"
libs/ui/theme/
├── theme.tokens.json        every token
└── generated/               built from it for each platform and the design tool
```

## Proof

### contrast-tested-over-token-pairs → content-meets-the-contrast-minimum · MUST

Every text token's contrast is tested over each background token it is meant to sit on, in every theme mode. Those pairs are declared beside the tokens.

#### Why

Contrast checked screen by screen misses the pair the next screen uses, and a change of token that breaks a pair ships until someone looks at that screen in that theme mode — WCAG 2.2, Contrast (Minimum).

#### Examples

```pseudo title="Avoid"
test "should keep the checkout screen readable"
  # Arrange
  let screen = render(CheckoutScreen, { mode: "light" })
  # Act
  let violations = contrastViolations(screen)

  # Assert
  assert violations is []
```

```pseudo title="Prefer"
# libs/ui/theme/contrast-pairs
let textPairs = [
  { text: "color.text.default", on: ["color.surface.default", "color.surface.muted"] },
  { text: "color.text.muted", on: ["color.surface.default"] }
]

# libs/ui/theme/__tests__/contrast-pairs.test
for each mode in themeModes, { text, on } in textPairs, background in on
  test "should read {text} on {background} when in {mode}"
    # Act
    let ratio = contrastRatio(resolve(text, mode), resolve(background, mode))

    # Assert
    assert ratio >= 4.5
```

### non-text-contrast-tested-over-token-pairs → control-meets-the-non-text-contrast-minimum · MUST

Every non-text token's contrast is tested over each background token it is meant to sit on, in every theme mode. A non-text token draws a control or a graphic, such as a border, a focus ring or an icon, and its pairs are declared beside the tokens.

#### Why

A border or a focus ring checked screen by screen misses the pair the next screen uses, and a change of token that fades it ships until someone looks at that screen in that theme mode — WCAG 2.2, Non-text Contrast.

#### Examples

```pseudo title="Avoid"
# libs/ui/theme/contrast-pairs
let textPairs = [
  { text: "color.text.default", on: ["color.surface.default"] }
]
# no pair for color.border.focus or color.border.control
```

```pseudo title="Prefer"
# libs/ui/theme/contrast-pairs
let nonTextPairs = [
  { mark: "color.border.focus", on: ["color.surface.default", "color.surface.muted"] },
  { mark: "color.border.control", on: ["color.surface.default"] }
]

# libs/ui/theme/__tests__/contrast-pairs.test
for each mode in themeModes, { mark, on } in nonTextPairs, background in on
  test "should show {mark} on {background} when in {mode}"
    # Act
    let ratio = contrastRatio(resolve(mark, mode), resolve(background, mode))

    # Assert
    assert ratio >= 3
```
