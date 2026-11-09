# Design system

> Governs how stylesheets spell the tokens of a design system and write its theme modes' colours.

## Modes

### theme-colour-written-in-oklch → mode-values-derived-by-rule · MUST

Every colour the theme writes is an `oklch()` value.

#### Why

In sRGB or HSL one lightness reads lighter in one hue than in another, so a theme mode's values derived by rule differ in contrast from hue to hue, while OKLCH keeps one lightness equally light in every hue.

#### Examples

```css title="Avoid"
@layer theme {
  :root {
    color-scheme: light dark;
    --color-action: light-dark(#2563eb, #60a5fa);
    --color-danger: light-dark(hsl(0 72% 51%), hsl(0 91% 71%));
  }
}
```

```css title="Prefer"
@layer theme {
  :root {
    color-scheme: light dark;
    --color-action: light-dark(oklch(55% 0.2 260), oklch(72% 0.14 260));
    --color-danger: light-dark(oklch(58% 0.21 27), oklch(72% 0.16 27));
  }
}
```

## Tokens

### custom-property-spells-its-token → token-name-follows-the-grammar · SHOULD

Every custom property that holds a token spells the token's name with dashes for its dots, as `--color-surface-muted` spells `color.surface.muted`.

#### Why

A property named otherwise than its token is a second name for it, which a search for the token misses in the theme and in every stylesheet.

#### Examples

```css title="Avoid"
@layer theme {
  :root {
    color-scheme: light dark;
    --surfaceMuted: light-dark(oklch(96% 0.01 260), oklch(26% 0.01 260));
    --muted-bg: var(--surfaceMuted);
  }
}
```

```css title="Prefer"
@layer theme {
  :root {
    color-scheme: light dark;
    --color-surface-muted: light-dark(oklch(96% 0.01 260), oklch(26% 0.01 260));
  }
}
```
