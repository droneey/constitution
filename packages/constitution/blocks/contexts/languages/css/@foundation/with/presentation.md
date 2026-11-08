# Presentation

> Governs how a stylesheet serves screens and components: their scope, focus, boundaries, text size, reflow, overlays, content revealed on hover, motion, the component variants and theme modes of their theme, and the direction of the reader's language.

## Components

### component-adapts-by-container-query → component-sizes-to-its-container · SHOULD

Every component adapts to its container's space by a container query, never by a media query on the viewport's width.

#### Why

A component sized by the viewport's width overflows a narrow container on a wide screen, since the viewport says nothing about the space the component was given.

#### Examples

```css title="Avoid"
@layer components {
  @scope (.order-card) {
    .body {
      display: grid;
      gap: var(--space-2);
    }

    @media (width >= 48rem) {
      .body {
        grid-template-columns: 8rem 1fr;
      }
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.order-card) {
    :scope {
      container-type: inline-size;
    }

    .body {
      display: grid;
      gap: var(--space-2);
    }

    @container (width >= 30rem) {
      .body {
        grid-template-columns: 8rem 1fr;
      }
    }
  }
}
```

### component-styles-scoped-to-its-root · MUST

Every component's stylesheet styles only the component's own elements. Its rules sit in `@scope (<its root>) to (<its slots>)`, or under its root's class where `@scope` is not available.

#### Why

A rule that leaks reaches every screen that loads the component, and the lower boundary keeps it out of the content other components render in its slots.

#### Examples

```css title="Avoid"
/* src/features/orders/presentation/components/order-card/order-card.css */
@layer components {
  .title {
    font-size: 1.125rem;
  }
}
```

```css title="Prefer"
/* src/features/orders/presentation/components/order-card/order-card.css */
@layer components {
  @scope (.order-card) to (.order-card-slot) {
    .title {
      font-size: 1.125rem;
    }
  }
}
```

### global-style-only-in-the-entry-stylesheet · MUST

Every global style sits in the entry stylesheet or in a stylesheet it imports for the whole program. Such stylesheets include those of the reset layer, a base cascade layer and the theme, and a global style is one that styles elements by their type outside a component's scope, or the document as a whole.

#### Why

A global style in a component's stylesheet reaches every screen, and changes whenever that component is or is not loaded.

#### Examples

```css title="Avoid"
/* src/features/invoices/presentation/components/invoice-list/invoice-list.css */
@layer components {
  h2 {
    margin-block: 0;
  }

  .invoice-list {
    display: grid;
  }
}
```

```css title="Prefer"
/* src/styles/base.css */
@layer base {
  :where(h2) {
    margin-block: 0;
  }
}

/* src/features/invoices/presentation/components/invoice-list/invoice-list.css */
@layer components {
  .invoice-list {
    display: grid;
  }
}
```

## Accessibility

### focus-ring-drawn-as-an-outline → focus-always-visible · MUST

Every focus ring is an outline, shown on `:focus-visible`. It is an outline of its own, or a transparent one beside a shadow, never an outline set to `none` or `0`.

#### Why

Forced-colors mode drops shadows and repaints outlines in the system's colour, so only a ring drawn as an outline survives it — WCAG 2.2, Focus Visible.

#### Examples

```css title="Avoid"
@layer components {
  .checkout-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--color-focus);
  }
}
```

```css title="Prefer"
@layer components {
  .checkout-button:focus-visible {
    outline: 2px solid transparent;
    box-shadow: 0 0 0 3px var(--color-focus);
  }
}
```

### control-boundary-drawn-as-a-border → control-meets-the-non-text-contrast-minimum · MUST

Every control whose boundary a shadow or a background alone draws also carries a transparent border.

#### Why

Forced-colors mode drops shadows and backgrounds and paints borders in the system's colour, so only a border keeps a control apart from the text around it — WCAG 2.2, Non-text Contrast.

#### Examples

```css title="Avoid"
@layer components {
  .quantity-input {
    border: none;
    background-color: var(--color-surface-muted);
  }
}
```

```css title="Prefer"
@layer components {
  .quantity-input {
    border: 1px solid transparent;
    background-color: var(--color-surface-muted);
  }
}
```

### sticky-content-reserves-scroll-padding → focus-never-obscured · MUST

Every element that stays in view while its scroll container scrolls reserves its size as that container's `scroll-padding`. Such an element is sticky or fixed, such as a header, a footer or a banner.

#### Why

Focus moved under a sticky header is focus the user cannot see, while a reserved padding makes the browser scroll a focused element clear of it — WCAG 2.2, Focus Not Obscured (Minimum).

#### Examples

```css title="Avoid"
@layer components {
  .store-header {
    position: sticky;
    inset-block-start: 0;
    block-size: 4rem;
  }
}
```

```css title="Prefer"
@layer base {
  :where(:root) {
    --store-header-height: 4rem;
    scroll-padding-block-start: var(--store-header-height);
  }
}

@layer components {
  .store-header {
    position: sticky;
    inset-block-start: 0;
    block-size: var(--store-header-height);
  }
}
```

### type-sized-in-rem → wcag-aa-conformance · MUST

Every font size is set relative to the root font size, never in `px` alone. That holds in a declaration and in a custom property that holds a font size alike, and the size is set in `rem`, in `em` or `%` that resolves from the root font size or from a size set in `rem`, by `inherit`, or by a math function, such as `clamp()`, `calc()`, `min()` or `max()`, each of whose arguments is set in one of these forms or adds a `rem` term. Exempt: the root's own font size, set as a percentage of the browser's default.

#### Why

A size in pixels ignores the text size the user set in the browser, so text stays too small for the people who set it larger — WCAG 2.2, Resize Text.

#### Examples

```css title="Avoid"
@layer theme {
  :root {
    --font-size-caption: 12px;
  }
}

@layer components {
  .order-total {
    font-size: 20px;
  }
}
```

```css title="Prefer"
@layer theme {
  :root {
    --font-size-caption: 0.75rem;
  }
}

@layer components {
  .order-total {
    font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  }
}
```

### text-spacing-overridable-without-clipping → wcag-aa-conformance · MUST

No box that shows text clips it when the user widens its spacing. No such box fixes its height while hiding its overflow, so text stays whole when the user sets line height to 1.5 times the font size, paragraph spacing to 2 times, letter spacing to 0.12 times and word spacing to 0.16 times. Exempt: a box visually hidden for assistive technology, and text cut to fit whose whole text can be reached.

#### Why

People with low vision or dyslexia widen the spacing to read at all, and a box of fixed height cuts off what no longer fits — WCAG 2.2, Text Spacing.

#### Examples

```css title="Avoid"
@layer components {
  .order-note {
    block-size: 3rem;
    overflow: hidden;
  }
}
```

```css title="Prefer"
@layer components {
  .order-note {
    min-block-size: 3rem;
  }
}
```

### content-reflows-at-320-css-pixels → wcag-aa-conformance · MUST

At a width of 320 CSS pixels, every screen's content reflows with no sideways scrolling. Exempt: content that needs two dimensions, such as a map or a data table.

#### Why

A page zoomed to 400 percent is 320 CSS pixels wide, and reading line by line while scrolling sideways loses the reader — WCAG 2.2, Reflow.

#### Examples

```css title="Avoid"
@layer layouts {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 22rem);
  }
}
```

```css title="Prefer"
@layer layouts {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  }
}
```

### text-wraps-instead-of-overflowing → wcag-aa-conformance · MUST

All text the program does not write wraps inside its box and never widens the page. Such text, such as a web address, an email address, a name or the user's input, breaks where a word would overflow its box, by `overflow-wrap: anywhere`.

#### Why

One long word with no place to break pushes its box past the screen, and the whole page then scrolls sideways — WCAG 2.2, Reflow.

#### Examples

```css title="Avoid"
@layer components {
  .customer-email { /* a long address widens the page */
    font-weight: 500;
  }
}
```

```css title="Prefer"
@layer components {
  .customer-email {
    font-weight: 500;
    overflow-wrap: anywhere;
  }
}
```

### decorative-layer-lets-input-through → control-operable-by-every-input · MUST

Every decorative layer over interactive content lets input through. An element that only decorates and lies over such content, such as a glow, a gradient or a sheen, takes `pointer-events: none`.

#### Why

An invisible layer over a control takes the click or the tap meant for it, and the control looks alive while nothing answers.

#### Examples

```css title="Avoid"
@layer components {
  .promo-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent, var(--color-surface));
  }
}
```

```css title="Prefer"
@layer components {
  .promo-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent, var(--color-surface));
    pointer-events: none;
  }
}
```

### hover-reveal-also-on-focus → hover-content-reached-without-hover · MUST

All content a style reveals on `:hover` is revealed on `:focus-within` of the same element too.

#### Why

A keyboard user never hovers, so content shown on hover alone never reaches them — WCAG 2.2, Keyboard.

#### Examples

```css title="Avoid"
@layer components {
  @scope (.order-row) {
    .actions {
      opacity: 0;
    }

    :scope:hover .actions {
      opacity: 1;
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.order-row) {
    .actions {
      opacity: 0;
    }

    :scope:is(:hover, :focus-within) .actions {
      opacity: 1;
    }
  }
}
```

### motion-stopped-under-prefers-reduced-motion → reduced-motion-honoured · MUST

Wherever the media feature `prefers-reduced-motion` is `reduce`, the stylesheet stops every transition and animation that `reduced-motion-honoured` stops.

#### Why

The media query is the one place a stylesheet learns that the person asked for less motion, so motion left outside it reaches the people it makes ill.

#### Examples

```css title="Avoid"
@layer components {
  .cart-drawer {
    transition: translate 250ms ease-out;
  }
}
```

```css title="Prefer"
@layer components {
  .cart-drawer {
    transition: translate 250ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .cart-drawer {
      transition: none;
    }
  }
}
```

## Variants

### cascading-variant-by-data-attribute → cascading-variant-set-once-on-ancestor · SHOULD

Every component variant that restyles descendants is a `data-*` attribute on their ancestor, which the stylesheet resolves.

#### Why

A component variant passed down as a prop must be threaded through every descendant it restyles, and a descendant it misses keeps the old look.

#### Examples

```css title="Avoid"
@layer components {
  @scope (.order-card) {
    .title-compact {
      font-size: 1rem;
    }

    .total-compact {
      font-size: 0.875rem;
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.order-card) {
    :scope[data-density="compact"] {
      & .title {
        font-size: 1rem;
      }

      & .total {
        font-size: 0.875rem;
      }
    }
  }
}
```

## Modes

### color-scheme-declared-on-root → theme-follows-system-until-chosen · MUST

Every document's root `color-scheme` names the schemes in force: each scheme the theme supports until its user chooses one, then the chosen one alone.

#### Why

Without it, native controls, scrollbars and the page's canvas keep the browser's light scheme under a dark theme.

#### Examples

```css title="Avoid"
@layer theme {
  :root {
    --color-surface: light-dark(oklch(99% 0 0), oklch(20% 0.01 260));
  }
}
```

```css title="Prefer"
@layer theme {
  :root {
    color-scheme: light dark;
    --color-surface: light-dark(oklch(99% 0 0), oklch(20% 0.01 260));
  }

  :root[data-theme="light"] {
    color-scheme: light;
  }

  :root[data-theme="dark"] {
    color-scheme: dark;
  }
}
```

### mode-colour-written-as-light-dark · SHOULD

Every colour token that differs only between the light and the dark theme mode is declared once, as `light-dark()`. Its value is `light-dark(<light>, <dark>)`, resolved by the `color-scheme` in force.

#### Why

A token declared once per theme mode can be missed in one of them, and a value chosen by a class on the root ignores a subtree that sets its own `color-scheme`.

#### Examples

```css title="Avoid"
@layer theme {
  :root {
    color-scheme: light dark;
    --color-surface: oklch(99% 0 0);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-surface: oklch(20% 0.01 260);
    }
  }
}
```

```css title="Prefer"
@layer theme {
  :root {
    color-scheme: light dark;
    --color-surface: light-dark(oklch(99% 0 0), oklch(20% 0.01 260));
  }
}
```

## Direction

### inline-side-written-logically → layout-mirrors-right-to-left · MUST

Wherever the program offers a language written right to left, every side along the line is written in its logical form. It is never left or right for a margin, a padding, a border, an inset, a float, a clear or a text alignment, each of which has a logical form, such as `margin-inline-start`, `inset-inline-end` and `text-align: start`. Exempt: numbers, media controls and logos, which keep their direction.

#### Why

A side written as left or right stays put when a right-to-left language reverses the line, so the layout breaks there unless a second stylesheet mirrors it.

#### Examples

```css title="Avoid"
@layer components {
  .cart-line-price {
    margin-left: auto;
    padding-right: var(--space-2);
    text-align: right;
  }
}
```

```css title="Prefer"
@layer components {
  .cart-line-price {
    margin-inline-start: auto;
    padding-inline-end: var(--space-2);
    text-align: end;
  }
}
```
