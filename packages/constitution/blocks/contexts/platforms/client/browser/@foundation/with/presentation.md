# Presentation

> Governs a screen in a browser: its URL, its drawn graphics, the three measures of its speed, its first render, its pointer targets, the focus, title and announcements its navigation moves, and how the theme's modes follow the person's settings.

## Screens

### url-holds-only-view-state · MUST

Every piece of state the program writes into a screen's address is view state, which a link or a reload brings back. Such view state includes a filter, a sort, a page of results, a selection and the open tab panel. Exempt: a parameter another party's protocol puts in the address it sends the person back to, such as a sign-in callback's code and state.

| Why |
|---|
| state a page's URL holds is shared with every link, bookmark and history entry made from it, so state that no link should bring back, such as a draft or a one-time result, is replayed by each of them. |

### drawn-graphic-scaled-by-device-pixel-ratio-or-vector → image-sharp-at-the-pixel-density · SHOULD

Every graphic the program draws stays sharp at any pixel density. A canvas is scaled by `devicePixelRatio`, and an icon is SVG.

| Why |
|---|
| a canvas sized in layout pixels holds one device pixel per layout pixel and is stretched on a dense screen, while an SVG icon is drawn at whatever density it meets. |

### largest-contentful-paint-within-2-5-s → felt-speed-measured-in-the-field-within-budget · SHOULD

Every page's Largest Contentful Paint stays within 2.5 s at the 75th percentile of its visits.

| Why |
|---|
| a page held only to its bundle's size passes that proxy while people on slow devices and networks still wait for its main content, the wait the paint of its largest element measures. |

### interaction-to-next-paint-within-200-ms → felt-speed-measured-in-the-field-within-budget · SHOULD

Every page's Interaction to Next Paint stays within 200 ms at the 75th percentile of its visits.

| Why |
|---|
| a page that loads fast but answers a press late feels broken, so people press again or leave, and nothing measured at load shows it. |

### cumulative-layout-shift-within-0-1 → felt-speed-measured-in-the-field-within-budget · SHOULD

Every page's Cumulative Layout Shift stays within 0.1 at the 75th percentile of its visits.

| Why |
|---|
| content that moves while people read it or reach for it makes them lose their place or press what slid under their finger. |

## Components

### first-render-matches-the-served-markup · SHOULD

Every tab's first render of prerendered markup matches that markup. Markup is prerendered when a server or a build renders it before the tab runs. Until the tab has taken over the markup, nothing the render draws depends on the clock, chance, the tab's locale or its storage. Exempt: an attribute of the document's root that a script sets before the first paint, such as the theme mode its user chose.

| Why |
|---|
| a first render that differs from the prerendered markup is thrown away and redrawn, which costs the speed rendering ahead was for and flashes content under its user. |

## Accessibility

### pointer-target-overlaps-no-other → target-meets-the-minimum-size · MUST

No pointer target's hit area covers a visible part of another target. Exempt: a target drawn wholly inside another, which a press on it activates alone, such as a button on a card the whole of which is a link.

| Why |
|---|
| where two targets overlap, a press may land on the one its user did not mean — WCAG 2.2, Target Size (Minimum). |

### live-region-mounted-before-message → status-changes-announced · MUST

Every live region is in the document, empty, before a message is put into it.

| Why |
|---|
| a region rendered together with its text is often not announced at all, so the status message assistive technology must be told of is lost — WCAG 2.2, Status Messages. |

### navigation-moves-focus-to-the-main-heading → focus-order-follows-the-visual-order · MUST

Every navigation the program makes without loading a new document moves focus to the new screen's main heading. Exempt: a navigation that only changes a parameter of the same screen, which keeps focus where it is.

| Why |
|---|
| the parent orders focus within a screen, and this rule starts that order where the new screen's content starts: the browser moves focus nowhere when the program changes the screen itself, so focus is left on a control that is gone or falls back to the page's top, and a keyboard or screen-reader user must find where the new screen starts by hand — WCAG 2.2, Focus Order. |

### document-title-names-the-screen → wcag-aa-conformance · MUST

Every screen sets a document title of its own, which a navigation inside the program changes with the screen.

| Why |
|---|
| a tab, a bookmark, the history and a screen reader name the page by its title, so screens that share one, or keep the last screen's, cannot be told apart — WCAG 2.2, Page Titled. |

## Modes

### increased-contrast-mode-follows-prefers-contrast → theme-follows-system-until-chosen · MUST

Wherever the theme has an increased-contrast mode, every page shows it while `prefers-contrast: more` matches, until its user chooses a theme mode in the program. It follows each change of the query.

| Why |
|---|
| a person with low vision asks every site for more contrast once, in their settings, and a page that ignores the request is one they cannot read. |
