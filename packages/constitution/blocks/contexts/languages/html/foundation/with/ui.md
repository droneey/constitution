# User interface

> Governs the markup of a screen: its viewport, images and their sources, native elements and the attributes that carry its accessibility.

## Screens

### image-declares-its-size → late-content-reserves-its-space · SHOULD

An image declares its width and height in its markup.

| Why | Tags |
|---|---|
| the page reserves the image's box before it loads, so nothing already shown moves when it arrives. | [performance, ux] |

### image-offers-sources-for-each-density → image-sharp-at-the-pixel-density · SHOULD

A content image offers its widths by `srcset` and `sizes`, so the browser fetches the one the screen's pixel density and the image's box need.

| Why | Tags |
|---|---|
| a single `src` gives the browser one file for every screen, and only `srcset` with `sizes` lets it pick by density and box before the layout is known. | [performance, ux] |

## Components

### dialog-popover-and-details-native → complex-pattern-built-on-accessible-primitives · MUST

Unless another active block brings accessible primitives for these patterns, HTML's own elements carry them: `<dialog>` for a dialog, the `popover` attribute for a popover and `<details>` for a disclosure or an accordion's section.

| Why | Tags |
|---|---|
| each brings its focus, its keyboard and its announcement from the browser, with no script to get them wrong. | [a11y] |

## Forms

### field-declares-its-autocomplete → field-declares-its-kind · MUST

A field for its user's own data declares its purpose by the `autocomplete` token HTML defines for it.

| Why | Tags |
|---|---|
| the browser then fills it in, and assistive technology can tell its user what it is for. | [ux, a11y] |

### busy-submit-marked-aria-disabled → submit-busy-keeps-its-focus · SHOULD

A busy submit button is marked `aria-disabled`, never `disabled`, so it keeps its focus.

| Why | Tags |
|---|---|
| a `disabled` button drops its focus to the page and leaves the order of the keyboard, while `aria-disabled` keeps it focusable and says why it does nothing. | [a11y] |

## Accessibility

### tabindex-only-zero-or-minus-one → focus-order-follows-the-visual-order · MUST

An element's `tabindex` is `0` or `-1`, never a positive number.

| Why | Tags |
|---|---|
| a positive `tabindex` moves its element ahead of every other in the order of the keyboard, wherever it sits on the screen. | [a11y] |

### focusable-element-never-aria-hidden → control-operable-by-every-input · MUST

No element that can take focus, or holds one that can, is `aria-hidden`.

| Why | Tags |
|---|---|
| a screen reader user then reaches a control their reader cannot name or describe, and hears nothing where focus landed. | [a11y] |

### native-html-elements-first → native-semantics-first · MUST

`<button>` carries an action, `<a>` with a real `href` a move, lists are lists and tables have headers and a caption; ARIA is used only where HTML has no element.

| Why | Tags |
|---|---|
| a native element brings its role, its keyboard and its announcement, while ARIA on a generic element brings only a promise. | [a11y] |

### page-marks-its-landmarks → wcag-aa-conformance · MUST

Every page marks its landmarks — its header, navigation, main content and footer, where it has them — by their elements, with one `<main>`.

| Why | Tags |
|---|---|
| people using a screen reader or a keyboard move through a page by its landmarks, and a page without them must be read from the top. | [a11y] |

### skip-link-comes-first → wcag-aa-conformance · MUST

A page that repeats blocks before its content — a header, a navigation — offers as its first focusable element a link that skips to the main content.

| Why | Tags |
|---|---|
| it spares a keyboard user tabbing through the same navigation on every page. | [a11y] |

### live-region-polite-unless-urgent → status-changes-announced · MUST

A status goes to a polite live region, and only an urgent error to an assertive one.

| Why | Tags |
|---|---|
| an assertive announcement interrupts what its listener is hearing, so it is kept for what cannot wait. | [a11y] |

### invalid-field-tied-to-its-message → status-changes-announced · MUST

An invalid field carries `aria-invalid` and an `aria-describedby` that points at its message.

| Why | Tags |
|---|---|
| assistive technology then says that the field is wrong and why, when its user reaches it. | [a11y] |

### entry-document-declares-the-viewport → wcag-aa-conformance · MUST

Every entry document declares the responsive viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">`.

| Why | Tags |
|---|---|
| without it a phone lays the page out at a desktop's width and shrinks it, so its text is small and its layout never reflows. | [a11y] |

### viewport-never-blocks-zoom → wcag-aa-conformance · MUST

The viewport declaration never blocks zooming: no `user-scalable=no`, and no `maximum-scale` below 5.

| Why | Tags |
|---|---|
| a page that cannot be zoomed fails the people who need its text larger. | [a11y] |

### language-declared-by-lang → screen-declares-its-language · MUST

A document declares its language in the `lang` of its root element, and a passage in another language carries its own `lang`.

| Why | Tags |
|---|---|
| `lang` is what assistive technology reads to choose how a text is pronounced, and what the browser reads to hyphenate and translate it. | [a11y] |
