# Design system

> Governs how Tailwind resolves the tokens, modes and styles of text of a design system.

## Modes

### dark-variant-only-where-no-token-reaches → theme-modes-share-one-token-set · MUST

No component writes a `dark:` class where a token can say it.

#### Why

A component that writes its own `dark:` classes holds a second dark palette, which the next change of the theme misses.

#### Examples

```tsx title="Avoid"
<section className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">{children}</section>
```

```tsx title="Prefer"
<section className="bg-surface text-on-surface">{children}</section>
```

## Tokens

### class-names-only-semantic-colors → component-never-reads-a-primitive-token · MUST

Every class names only semantic and common colours, never a primitive colour or a palette Tailwind ships.

#### Why

A class that names a primitive colour or a shipped palette skips the semantic layer and keeps its colour when the theme or the mode remaps the rest; a utility exists only for what `@theme` aliases, so a primitive token left out of it cannot be written in a class.

#### Examples

```tsx title="Avoid"
<p className="text-red-600">{t`This coupon has expired`}</p>
```

```tsx title="Prefer"
<p className="text-danger">{t`This coupon has expired`}</p>
```

### theme-aliases-the-token-properties → custom-property-spells-its-token · MUST

Every alias of Tailwind's theme sits in Tailwind's own namespace and reads its token's custom property, which keeps the token's name.

#### Why

A token renamed for Tailwind has two names, one in its source and one in the browser, and Tailwind reads a token's name in another namespace as its own, as it reads any `--font-*` as a family.

#### Examples

```css title="Avoid"
@theme inline {
  --inset-md: var(--space-inset-md);
  --spacing-stack-sm: 0.5rem;
}
```

```css title="Prefer"
@theme inline {
  --spacing-inset-md: var(--space-inset-md);
  --spacing-stack-sm: var(--space-stack-sm);
}
```

### token-property-declared-on-the-root → tokens-single-source-of-appearance · MUST

Every custom property a theme alias reads is declared on the root.

#### Why

Under `@theme inline` a utility reads the property where it is used, so outside the subtree that declares it the utility resolves to nothing.

#### Examples

```css title="Avoid"
@layer theme {
  .card {
    --space-inset-md: 1rem;
  }
}
```

```css title="Prefer"
@layer theme {
  :root {
    --space-inset-md: 1rem;
  }
}
```

### tailwind-named-token-declared-by-theme-reference → custom-property-spells-its-token · MUST

Every token whose name already is one Tailwind reads is named as itself in an `@theme inline reference` block.

#### Why

An alias of a name Tailwind already reads would read itself, a cycle that voids the value; Tailwind's parser accepts the `reference` option of `@theme` though its documentation lists only `inline` and `static` (tailwindcss, `parseThemeOptions` in `src/index.ts`), so the form is checked again at each major release.

#### Examples

```css title="Avoid"
@theme inline {
  --color-surface: var(--color-surface);
  --color-on-surface: var(--color-on-surface);
}
```

```css title="Prefer"
@theme inline reference {
  --color-surface: var(--color-surface);
  --color-on-surface: var(--color-on-surface);
}
```

### typography-token-aliased-as-a-text-composite → font-token-is-one-typography-composite · MUST

Every typography token reaches Tailwind as its text composite. The composite is `--text-<kind>-<step>` with `--text-<kind>-<step>--line-height`, `--text-<kind>-<step>--letter-spacing` and `--text-<kind>-<step>--font-weight`, each the alias of the part's own property, so one class, `text-<kind>-<step>`, sets the style of text.

#### Why

A style of text set part by part takes several classes that must change together, and one of them is missed when the style changes.

#### Examples

```css title="Avoid"
@theme inline {
  --text-body-md: var(--font-body-md-size);
  --leading-body-md: var(--font-body-md-line-height);
  --tracking-body-md: var(--font-body-md-letter-spacing);
}
```

```css title="Prefer"
@theme inline {
  --text-body-md: var(--font-body-md-size);
  --text-body-md--line-height: var(--font-body-md-line-height);
  --text-body-md--letter-spacing: var(--font-body-md-letter-spacing);
  --text-body-md--font-weight: var(--font-body-md-weight);
}
```

### typography-family-aliased-as-a-font-kind → font-token-is-one-typography-composite · MUST

Every kind of text has one `--font-<kind>` alias of its styles' family, which the text composite lacks. A component writes `text-<kind>-<step> font-<kind>`.

#### Why

Tailwind's text composite holds every part of a style but its family, so a family written as a primitive token's class keeps its font when the style's token changes.

#### Examples

```css title="Avoid"
@theme inline {
  --font-body-sm: var(--font-body-sm-family);
  --font-body-md: var(--font-body-md-family);
  --font-body-lg: var(--font-body-lg-family);
}
```

```css title="Prefer"
@theme inline {
  --font-body: var(--font-body-md-family);
  --font-title: var(--font-title-md-family);
}
```
