# User interface

> Governs a screen in a browser: its URL, images and speed, its pointer targets, the focus and announcements its navigation moves, and what it reads while it renders.

## Screens

### url-holds-shareable-view-state → view-state-kept-in-the-navigation-state · MUST

View state a link must reproduce lives in the URL, and no other state does. Such state — a filter, a sort, a page, a selection, the open tab — is what a link or a reload must bring back.

| Why |
|---|
| a view kept outside the URL is lost on reload and cannot be shared, bookmarked or restored with the back button. |

### drawn-image-and-icon-sharp-at-any-density → image-sharp-at-the-pixel-density · SHOULD

A picture the program draws, and an icon, stay sharp at any pixel density. Its canvas is scaled by `devicePixelRatio`, and an icon is SVG.

| Why |
|---|
| a canvas sized in CSS pixels holds one device pixel per CSS pixel and is stretched on a dense screen, while an SVG icon is drawn at whatever density it meets. |

### content-image-in-a-modern-format · SHOULD

A content image is served as AVIF or WebP.

| Why |
|---|
| a JPEG or a PNG carries the same picture in more bytes, which people on slow networks wait for, while every browser a Baseline target covers decodes AVIF and WebP. |

### core-web-vitals-within-budget → felt-speed-measured-in-the-field-within-budget · SHOULD

The speed budget is the Core Web Vitals at the 75th percentile of visits. Largest Contentful Paint stays within 2.5 s, Interaction to Next Paint within 200 ms and Cumulative Layout Shift within 0.1.

| Why |
|---|
| a page held only to its bundle's size passes that proxy while people wait for its main content, for the answer to their input or for its layout to hold still, which these three measure — Core Web Vitals. |

## Components

### browser-global-never-read-while-rendering · MUST

Code that can render outside the tab reads no browser global while it renders. Outside the tab is on a server or in a prerender at build; the code reads the globals only once it runs in the tab.

| Why |
|---|
| outside the tab the global does not exist, so the render fails there or produces markup that differs from the tab's. |

## Accessibility

### pointer-target-at-least-24-css-px → target-meets-the-minimum-size · MUST

A pointer target is at least 24 CSS pixels square, or spaced as if it were, and overlaps no other. It measures 24 × 24 CSS pixels, padding included, or is spaced so that a circle of 24 CSS pixels centred on it overlaps no other target, save the exceptions WCAG 2.5.8 lists; and no target's area overlaps another's.

| Why |
|---|
| below 24 CSS pixels, people with a tremor or a large finger hit the wrong target, and where two targets overlap a press may land on the one its user did not mean — WCAG 2.2, Target Size (Minimum). |

### coarse-pointer-target-at-least-44-css-px · SHOULD

A target is at least 44 × 44 CSS pixels where the primary pointer is coarse. The pointer is coarse where `@media (pointer: coarse)` matches.

| Why |
|---|
| a finger covers far more than a cursor, and a thumb misses a target smaller than 44 pixels, the size it hits reliably — WCAG 2.2, Target Size (Enhanced). |

### live-region-mounted-before-message → status-changes-announced · MUST

A live region is in the document, empty, before a message is put into it.

| Why |
|---|
| a region rendered together with its text is often not announced at all, so the status message assistive technology must be told of is lost — WCAG 2.2, Status Messages. |

### navigation-moves-focus-to-the-view → status-changes-announced · MUST

A navigation inside the program moves focus to the new view's main heading. One that only changes a parameter of the same view keeps focus where it is.

| Why |
|---|
| the browser announces nothing when the program changes the URL itself, so without the move a screen-reader user hears no new page — WCAG 2.2, Focus Order. |

### document-title-names-the-view → wcag-aa-conformance · MUST

Each view sets a title of its own. It declares the title to the head's one writer, which sets it with the view, and a navigation inside the program changes the title with the view.

| Why |
|---|
| a tab, a bookmark, the history and a screen reader name the page by its title, so views that share one, or keep the last view's, cannot be told apart — WCAG 2.2, Page Titled. |
