# Browser

> Governs a stylesheet in a browser: the fonts it loads, the capabilities it may use there and the sizes it takes from the viewport.

## Bundle

### web-font-served-as-woff2 · MUST

Every web font is served as WOFF2 alone.

#### Why

A font served in a heavier form costs every visitor its bytes, though every current browser reads WOFF2.

#### Examples

```css title="Avoid"
@font-face {
  font-family: "Inter";
  src:
    url("/fonts/inter.woff2") format("woff2"),
    url("/fonts/inter.woff") format("woff"),
    url("/fonts/inter.ttf") format("truetype");
  font-display: swap;
}
```

```css title="Prefer"
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: swap;
}
```

### web-font-shows-its-text-while-it-loads · MUST

Every web font shows its text while it loads: its `@font-face` sets a `font-display` of `swap`, `fallback` or `optional`.

#### Why

A font that blocks its text leaves it invisible for up to three seconds on a slow network.

#### Examples

```css title="Avoid"
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: block;
}
```

```css title="Prefer"
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: swap;
}
```

## Dependencies

### stylesheet-capability-beyond-the-target-behind-supports → capability-beyond-the-target-detected-first · MUST

Every stylesheet capability beyond the support target is used only inside an `@supports` query that tests for it. Exempt: a capability no such query can test, such as a new at-rule, which instead follows its fallback, kept by a browser that lacks the capability when it drops the at-rule.

#### Why

A capability a supported browser lacks breaks silently there, often by dropping the whole rule that uses it, for users nobody on the team sees.

#### Examples

```css title="Avoid"
@layer components {
  .order-note-field {
    field-sizing: content;
    min-block-size: 3lh;
  }
}
```

```css title="Prefer"
@layer components {
  .order-note-field {
    min-block-size: 6rem;
    resize: vertical;

    @supports (field-sizing: content) {
      field-sizing: content;
      min-block-size: 3lh;
      resize: none;
    }
  }
}
```

## Viewport

### viewport-height-leaves-out-the-browsers-toolbars · MUST

Every viewport height leaves out the browser's toolbars. It is in `svh`, or in `dvh` where content follows the toolbars as they slide, never in `vh`.

#### Why

`vh` counts the space under a phone browser's toolbars, so content slides beneath them.

#### Examples

```css title="Avoid"
@layer layouts {
  .checkout-layout {
    min-block-size: 100vh;
  }
}
```

```css title="Prefer"
@layer layouts {
  .checkout-layout {
    min-block-size: 100svh;
  }
}
```

### full-width-leaves-out-the-scrollbar · MUST

Every full width leaves out the browser's scrollbar. It is `100%` of its containing block, never `100vw`.

#### Why

`100vw` counts the scrollbar, so the page scrolls sideways.

#### Examples

```css title="Avoid"
@layer components {
  .promo-banner {
    inline-size: 100vw;
  }
}
```

```css title="Prefer"
@layer components {
  .promo-banner {
    inline-size: 100%;
  }
}
```
