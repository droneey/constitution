# Presentation

> Governs the markup of a screen: its viewport, images and their sources, native elements and the attributes that carry its accessibility.

## Screens

### image-declares-its-size → late-content-reserves-its-space · MUST

Every image declares its width and height in its markup.

| Why |
|---|
| an image without its size has no box until it loads, so the content below it jumps when it arrives and the user loses their place or presses what slid under their finger. |

### image-offers-its-sources-by-srcset → image-sharp-at-the-pixel-density · SHOULD

Every raster image a document shows in its content offers its sources by `srcset`. It offers them by width with `sizes`, or by pixel density where the image is shown at one fixed size.

| Why |
|---|
| an `<img src>` alone gives the browser one file for every screen, and only `srcset` lets it pick by density, and with `sizes` by box, before the layout is known. |

### viewport-declared-responsive → wcag-aa-conformance · MUST

Every document a browser opens as a page declares the responsive viewport, `<meta name="viewport" content="width=device-width, initial-scale=1">`.

| Why |
|---|
| without it a phone lays the page out at a desktop's width and shrinks it, so its text is too small to read and its lines run past the screen — WCAG 2.2, Reflow. |

### viewport-never-blocks-zoom → wcag-aa-conformance · MUST

No document's viewport blocks zooming: its `<meta name="viewport">` holds no `user-scalable=no` and no `maximum-scale` below 5.

| Why |
|---|
| a page that cannot be zoomed fails the people who need its text larger — WCAG 2.2, Resize Text. |

## Components

### pattern-carried-by-its-native-element → complex-pattern-built-on-accessible-primitives · MUST

Wherever no library of accessible component primitives is active, every dialog, popover and disclosure is carried by HTML's own element for it. A dialog is a `<dialog>`, a popover takes the `popover` attribute, and a disclosure or an accordion's section is a `<details>`.

| Why |
|---|
| a dialog, a popover or a disclosure scripted by hand gets its focus, its keyboard or its announcement wrong, while each of these elements brings them from the browser. |

## Forms

### field-declares-its-autocomplete → own-data-field-declares-its-purpose · MUST

Every field of its user's own data declares its purpose by the `autocomplete` token HTML defines for it.

| Why |
|---|
| a field without its token leaves its user to type by hand what the browser already knows, and assistive technology cannot tell them what the field is for — WCAG 2.2, Identify Input Purpose. |

### busy-submit-never-disabled → submit-busy-keeps-its-focus · MUST

Every busy submit button stays focusable, never `disabled`; it is marked busy by `aria-disabled`.

| Why |
|---|
| a `disabled` button drops its focus to the page and leaves the order of the keyboard, while one marked by `aria-disabled` keeps its place in that order and is announced as unavailable. |

## Accessibility

### tabindex-only-zero-or-minus-one → focus-order-follows-the-visual-order · MUST

Every element's `tabindex` is `0` or `-1`, never a positive number.

| Why |
|---|
| a positive `tabindex` moves its element ahead of every other in the order of the keyboard, wherever it sits on the screen, and a keyboard user loses their place — WCAG 2.2, Focus Order. |

### focusable-element-never-aria-hidden → wcag-aa-conformance · MUST

No element that can take focus, or holds one that can, is `aria-hidden`. Exempt: content behind an open modal layer, while focus stays in that layer.

| Why |
|---|
| a screen reader user then reaches a control their reader cannot name or describe, and hears nothing where the focus is — WCAG 2.2, Name, Role, Value. |

### html-element-taken-for-each-structure → native-semantics-first · MUST

Every action, move, list and table takes HTML's own element for it. Such an element is the one HTML gives that structure, such as a `<button>` for an action, an `<a>` with a real `href` for a move, a `<ul>`, an `<ol>` or a `<dl>` for a list and a `<table>` for a table.

| Why |
|---|
| a generic element with a role added announces what it does not keep (no keyboard, no focus, no behaviour), while a native element brings all three — the first rule of ARIA use. |

### table-header-cells-marked-by-th → wcag-aa-conformance · MUST

Every header cell of a table is a `<th>`.

| Why |
|---|
| a screen reader names each cell by the header cells of its row and its column, so in a table whose headers are plain cells its user hears a grid of unnamed values — WCAG 2.2, Info and Relationships. |

### table-has-an-accessible-name · MUST

Every table has an accessible name, such as its `<caption>` or `aria-labelledby` pointing at the heading that titles it.

| Why |
|---|
| a screen reader announces a table by its name, so its user learns what a table without one holds only by reading its cells. |

### page-marks-its-landmarks → wcag-aa-conformance · MUST

Every page marks its landmarks by their elements, with one `<main>`. Its landmarks are its header, navigation, main content and footer, where it has them.

| Why |
|---|
| people using a screen reader or a keyboard move through a page by its landmarks, and a page without them must be read from the top — WCAG 2.2, Info and Relationships and Bypass Blocks. |

### skip-link-comes-first → wcag-aa-conformance · MUST

Wherever a page repeats blocks before its content, its first focusable element is a link that skips them. Such blocks include a header and a navigation, and the link leads to the main content.

| Why |
|---|
| without it, a keyboard user tabs through the same header and navigation on every page before reaching its content — WCAG 2.2, Bypass Blocks. |

### live-region-polite-unless-urgent → announcement-interrupts-only-when-urgent · MUST

Every live region that carries no urgent announcement is polite, never assertive.

| Why |
|---|
| an assertive announcement cuts off what its listener is hearing, so a status sent to one interrupts them for what could have waited — WCAG 2.2, Status Messages. |

### invalid-field-tied-to-its-message → invalid-field-tells-its-error · MUST

Every invalid field carries `aria-invalid` and an `aria-describedby` that points at its message.

| Why |
|---|
| a field marked wrong only by its look, its message merely placed nearby, is announced as valid, and its user never hears why it is wrong — WCAG 2.2, Error Identification. |
