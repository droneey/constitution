# User interface

> Governs the markup of a screen: its viewport, images and their sources, native elements and the attributes that carry its accessibility.

## Screens

### image-declares-its-size → late-content-reserves-its-space · SHOULD

An image declares its width and height in its markup.

| Why |
|---|
| an image without its size has no box until it loads, so the content below it jumps when it arrives and the user loses their place or presses what slid under their finger. |

### image-offers-sources-for-each-density → image-sharp-at-the-pixel-density · SHOULD

A content image offers its widths by `srcset` and `sizes`. The browser then fetches the one the screen's pixel density and the image's box need.

| Why |
|---|
| an `<img src>` alone gives the browser one file for every screen, and only `srcset` with `sizes` lets it pick by density and box before the layout is known. |

## Components

### dialog-popover-and-details-native → complex-pattern-built-on-accessible-primitives · MUST

HTML's own elements carry a dialog, a popover and a disclosure. `<dialog>` carries a dialog, the `popover` attribute a popover and `<details>` a disclosure or an accordion's section, where no other active block brings accessible primitives for these patterns.

| Why |
|---|
| a dialog, a popover or a disclosure scripted by hand gets its focus, its keyboard or its announcement wrong, while each of these elements brings them from the browser. |

## Forms

### field-declares-its-autocomplete → field-declares-its-kind · MUST

A field for its user's own data declares its purpose by the `autocomplete` token HTML defines for it.

| Why |
|---|
| a field without its token leaves its user to type by hand what the browser already knows, and assistive technology cannot tell them what the field is for — WCAG 2.2, Identify Input Purpose. |

### busy-submit-marked-aria-disabled → submit-busy-keeps-its-focus · SHOULD

A busy submit button is marked `aria-disabled`, never `disabled`, so it keeps its focus.

| Why |
|---|
| a `disabled` button drops its focus to the page and leaves the order of the keyboard, while `aria-disabled` keeps it focusable and says why it does nothing. |

## Accessibility

### tabindex-only-zero-or-minus-one → focus-order-follows-the-visual-order · MUST

An element's `tabindex` is `0` or `-1`, never a positive number.

| Why |
|---|
| a positive `tabindex` moves its element ahead of every other in the order of the keyboard, wherever it sits on the screen, and a keyboard user loses their place — WCAG 2.2, Focus Order. |

### focusable-element-never-aria-hidden → control-operable-by-every-input · MUST

No element that can take focus, or holds one that can, is `aria-hidden`.

| Why |
|---|
| a screen reader user then reaches a control their reader cannot name or describe, and hears nothing where focus landed — WCAG 2.2, Name, Role, Value. |

### native-html-elements-first → native-semantics-first · MUST

HTML's own elements come first, and ARIA only where HTML has none. `<button>` carries an action, `<a>` with a real `href` a move, lists are lists and tables have headers and a caption.

| Why |
|---|
| ARIA on a generic element announces a role it does not keep (no keyboard, no focus, no behaviour), while a native element brings all three — the first rule of ARIA use. |

### page-marks-its-landmarks → wcag-aa-conformance · MUST

Every page marks its landmarks by their elements, with one `<main>`. Its landmarks are its header, navigation, main content and footer, where it has them.

| Why |
|---|
| people using a screen reader or a keyboard move through a page by its landmarks, and a page without them must be read from the top — WCAG 2.2, Info and Relationships and Bypass Blocks. |

### skip-link-comes-first → wcag-aa-conformance · MUST

A page that repeats blocks before its content offers, as its first focusable element, a link that skips them. The blocks are such as a header or a navigation, and the link leads to the main content.

| Why |
|---|
| without it, a keyboard user tabs through the same header and navigation on every page before reaching its content — WCAG 2.2, Bypass Blocks. |

### live-region-polite-unless-urgent → status-changes-announced · MUST

A status goes to a polite live region, and only an urgent error to an assertive one.

| Why |
|---|
| an assertive announcement cuts off what its listener is hearing, so a status sent to one interrupts them for what could have waited — WCAG 2.2, Status Messages. |

### invalid-field-tied-to-its-message → status-changes-announced · MUST

An invalid field carries `aria-invalid` and an `aria-describedby` that points at its message.

| Why |
|---|
| a field marked wrong only by its look, its message merely placed nearby, is announced as valid, and its user never hears why it is wrong — WCAG 2.2, Error Identification. |

### viewport-never-blocks-zoom → wcag-aa-conformance · MUST

Every entry document declares the responsive viewport and never blocks zooming. It declares `<meta name="viewport" content="width=device-width, initial-scale=1">`, with no `user-scalable=no` and no `maximum-scale` below 5.

| Why |
|---|
| without it a phone lays the page out at a desktop's width and shrinks it, and a page that cannot be zoomed fails the people who need its text larger — WCAG 2.2, Resize Text and Reflow. |

### language-declared-by-lang → screen-declares-its-language · MUST

A document declares its language in the `lang` of its root element, and a passage in another language carries its own `lang`.

| Why |
|---|
| without `lang`, assistive technology pronounces the text by another language's rules, and the browser hyphenates and translates it wrongly — WCAG 2.2, Language of Page and Language of Parts. |
