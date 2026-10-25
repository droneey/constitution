# User interface

> Governs a screen in a browser: its URL, images and speed, its pointer targets, the focus and announcements its navigation moves, and what it reads while it renders.

## Screens

### url-holds-shareable-view-state → view-state-kept-in-the-navigation-state · MUST

View state a link or a reload must reproduce — a filter, a sort, a page, a selection, the open tab — lives in the URL; state no link must reproduce stays out of it.

| Why |
|---|
| a view in the URL can be shared, bookmarked and restored with the back button, while a view kept elsewhere is lost on reload. |

### image-sharp-at-the-screens-density → image-sharp-at-the-pixel-density · SHOULD

A picture the program draws scales its canvas by `devicePixelRatio`, and an icon is SVG.

| Why |
|---|
| a canvas sized in CSS pixels holds one device pixel per CSS pixel and is stretched on a dense screen, while an SVG icon is drawn at whatever density it meets. |

### content-image-in-a-modern-format · SHOULD

A content image is served as AVIF or WebP.

| Why |
|---|
| both carry the same picture in fewer bytes than JPEG or PNG, and the browsers a Baseline target covers decode them. |

### content-kept-off-the-fold · SHOULD

On a foldable screen whose browser reports its viewport segments, content and controls never cross the fold; the layout follows the segments.

| Why |
|---|
| text and buttons that fall into the hinge cannot be read or pressed. |

### core-web-vitals-within-budget · SHOULD

Largest Contentful Paint stays within 2.5 s, Interaction to Next Paint within 200 ms and Cumulative Layout Shift within 0.1, at the 75th percentile of visits measured in the field.

| Why |
|---|
| they measure what people feel of speed — the main content arriving, the answer to input, the page holding still — and a bundle budget is only a proxy for them. |

## Components

### browser-global-never-read-while-rendering · MUST

Code that can render outside the tab — on a server, or in a prerender at build — reads no browser global while it renders; it reads them only once it runs in the tab.

| Why |
|---|
| outside the tab the global does not exist, so the render fails there or produces markup that differs from the tab's. |

## Accessibility

### pointer-target-at-least-24-css-px → target-meets-the-minimum-size · MUST

A pointer target is at least 24 × 24 CSS pixels, padding included, or spaced so that a circle of 24 CSS pixels centred on it overlaps no other target, save the exceptions WCAG 2.5.8 lists, and no target's area overlaps another's.

| Why |
|---|
| 24 CSS pixels is the floor WCAG 2.2 sets for any pointer, and below it people with a tremor or a large finger hit the wrong target, and where two targets overlap a press may land on the one its user did not mean. |

### coarse-pointer-target-at-least-44-css-px · SHOULD

Where the primary pointer is coarse — `@media (pointer: coarse)` — a target is at least 44 × 44 CSS pixels.

| Why |
|---|
| a finger covers far more than a cursor, and 44 pixels is the size WCAG's enhanced level sets for a target a thumb hits reliably. |

### fine-pointer-target-at-least-40-css-px · SHOULD

Where the primary pointer is fine — `@media (pointer: fine)` — a target is at least 40 × 40 CSS pixels, save the exceptions WCAG 2.5.8 lists.

| Why |
|---|
| the larger a target, the faster and surer a cursor lands on it, and 40 pixels gives a mouse or a trackpad that margin above WCAG's floor. |

### live-region-mounted-before-message → status-changes-announced · MUST

A live region is in the document, empty, before a message is put into it.

| Why |
|---|
| a region rendered together with its text is often not announced at all. |

### navigation-moves-focus-to-the-view → status-changes-announced · MUST

After a navigation inside the program, focus moves to the new view's main heading; a navigation that only changes a parameter of the same view keeps focus where it is.

| Why |
|---|
| the browser announces nothing when the program changes the URL itself, so without the move a screen-reader user hears no new page. |

### document-title-names-the-view → wcag-aa-conformance · MUST

Each view declares a title of its own to the head's one writer, which sets it with the view, and a navigation inside the program changes the title with the view.

| Why |
|---|
| the title is what a tab, a bookmark, the history and a screen reader name the page by. |
