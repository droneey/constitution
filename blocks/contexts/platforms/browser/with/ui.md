# Browser with a user interface

> Governs a screen in a browser: its document, viewport, pointer, images and speed, and the HTML that carries its accessibility.

## Screens

### url-holds-shareable-view-state → view-state-kept-in-the-navigation-state · MUST
View state a link or a reload must reproduce — a filter, a sort, a page, a selection, the open tab — lives in the URL; state no link must reproduce stays out of it.

| Why | Tags |
|---|---|
| a view in the URL can be shared, bookmarked and restored with the back button, while a view kept elsewhere is lost on reload. | [ux] |

### image-declares-its-size → late-content-reserves-its-space · SHOULD
An image declares its width and height in its markup.

| Why | Tags |
|---|---|
| the page reserves the image's box before it loads, so nothing already shown moves when it arrives. | [performance, ux] |

### image-sharp-at-the-screens-density · SHOULD
An image is drawn for the screen's pixel density: a content image offers its widths by `srcset` and `sizes`, a canvas scales by `devicePixelRatio`, and an icon is SVG.

| Why | Tags |
|---|---|
| one image size is blurry on a dense screen and wasteful on a plain one. | [performance, ux] |

### content-image-in-a-modern-format · SHOULD
A content image is served as AVIF or WebP.

| Why | Tags |
|---|---|
| both carry the same picture in fewer bytes than JPEG or PNG, and the browsers a Baseline target covers decode them. | [performance] |

### content-kept-off-the-fold · SHOULD
On a foldable screen whose browser reports its viewport segments, content and controls never cross the fold; the layout follows the segments.

| Why | Tags |
|---|---|
| text and buttons that fall into the hinge cannot be read or pressed. | [ux] |

### core-web-vitals-within-budget · SHOULD
Largest Contentful Paint stays within 2.5 s, Interaction to Next Paint within 200 ms and Cumulative Layout Shift within 0.1, at the 75th percentile of visits measured in the field.

| Why | Tags |
|---|---|
| they measure what people feel of speed — the main content arriving, the answer to input, the page holding still — and a bundle budget is only a proxy for them. | [performance, ux] |

## Components

### browser-global-never-read-while-rendering · MUST
Code that can render outside the tab — on a server, or in a prerender at build — reads no browser global while it renders; it reads them only once it runs in the tab.

| Why | Tags |
|---|---|
| outside the tab the global does not exist, so the render fails there or produces markup that differs from the tab's. | [errors] |

### dialog-popover-and-details-native → complex-pattern-built-on-accessible-primitives · MUST
Unless another active block brings accessible primitives for these patterns, the browser's own elements carry them: `<dialog>` for a dialog, the `popover` attribute for a popover and `<details>` for a disclosure or an accordion's section.

| Why | Tags |
|---|---|
| each brings its focus, its keyboard and its announcement from the browser, with no script to get them wrong. | [a11y] |

### native-popover-anchored-to-its-trigger · SHOULD
Unless another active block brings primitives that place their own popovers, a native `popover` is placed against its trigger by the browser's anchor positioning — `anchor-name` on the trigger, `position-anchor` and `position-area` on the popover — never by a script that measures.

| Why | Tags |
|---|---|
| the browser keeps the popover beside its trigger through scrolling and resizing, with no positioning library to load. | [ux, performance] |

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
| a `disabled` button drops its focus to the page and leaves the reach of assistive technology, while `aria-disabled` keeps it in reach and says why it does nothing. | [a11y] |

## Accessibility

### pointer-target-at-least-24-css-px → target-meets-the-minimum-size · MUST
A pointer target is at least 24 × 24 CSS pixels, padding included, or spaced so that a circle of 24 CSS pixels centred on it overlaps no other target, save the exceptions WCAG 2.5.8 lists.

| Why | Tags |
|---|---|
| 24 CSS pixels is the floor WCAG 2.2 sets for any pointer, and below it people with a tremor or a large finger hit the wrong target. | [a11y] |

### coarse-pointer-target-at-least-44-css-px · SHOULD
Where the primary pointer is coarse — `@media (pointer: coarse)` — a target is at least 44 × 44 CSS pixels.

| Why | Tags |
|---|---|
| a finger covers far more than a cursor, and 44 pixels is the size WCAG's enhanced level sets for a target a thumb hits reliably. | [a11y, ux] |

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

### live-region-mounted-before-message → status-changes-announced · MUST
A live region is in the document, empty, before a message is put into it.

| Why | Tags |
|---|---|
| a region rendered together with its text is often not announced at all. | [a11y] |

### navigation-moves-focus-to-the-view → status-changes-announced · MUST
After a navigation inside the program, focus moves to the new view's main heading; a navigation that only changes a parameter of the same view keeps focus where it is.

| Why | Tags |
|---|---|
| the browser announces nothing when the program changes the URL itself, so without the move a screen-reader user hears no new page. | [a11y] |

### document-title-names-the-view → wcag-aa-conformance · MUST
Each view sets the document's title to a name of its own, and a navigation inside the program changes the title with the view.

| Why | Tags |
|---|---|
| the title is what a tab, a bookmark, the history and a screen reader name the page by. | [a11y, ux] |

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
