# Browser with user interface

> Screens in a browser: the URL, the document, the viewport and the pointer.

### targets-at-least-24-css-px → target-meets-the-minimum-size · MUST
A pointer target is at least 24 × 24 CSS pixels, padding included, and 44 for a primary touch target.

| Why | Tags |
|---|---|
| 24 is the floor WCAG sets for any pointer; 44 is what a thumb hits reliably. | [] |

### images-sized-for-density · SHOULD
Content images carry `srcset` and `sizes`, in a modern format; a canvas scales by the device's pixel ratio; icons are SVG.

| Why | Tags |
|---|---|
| one image size is blurry on a dense screen or wasteful on a plain one. | [performance, ux] |

### content-avoids-the-fold · SHOULD
On a foldable screen, content and controls never cross the fold; the layout follows the viewport segments the browser reports.

| Why | Tags |
|---|---|
| text and buttons that fall into the hinge cannot be read or pressed. | [ux] |

### images-declare-their-size · SHOULD
An image declares its width and height.

| Why | Tags |
|---|---|
| the page reserves the image's space before it loads, so nothing moves when it arrives. | [performance, ux] |

### core-web-vitals-within-budget · SHOULD
Largest Contentful Paint stays within 2.5 s, Interaction to Next Paint within 200 ms and Cumulative Layout Shift within 0.1 at the 75th percentile, measured in the field.

| Why | Tags |
|---|---|
| these are what users feel of speed; a bundle budget is only a proxy for them. | [performance, ux] |

### no-browser-globals-during-render · MUST
Code that can render on a server reads no browser global while it renders.

| Why | Tags |
|---|---|
| on the server the global does not exist, and the render fails or differs from the one in the tab. | [errors] |

### busy-submit-marked-aria-disabled → submit-busy-keeps-its-focus · SHOULD
A busy submit button is marked `aria-disabled`, never `disabled`, so it keeps its focus.

| Why | Tags |
|---|---|
| a `disabled` button loses focus to the page and is skipped by assistive technology, while `aria-disabled` keeps it in reach and says why it does nothing. | [a11y] |

## Accessibility

### dialog-popover-and-details-native → complex-pattern-built-on-accessible-primitives · MUST
Unless another active block brings accessible primitives for these patterns, the browser's own elements carry them: `<dialog>` for a dialog, the `popover` attribute for a popover and `<details>` for a disclosure or an accordion's section.

| Why | Tags |
|---|---|
| each brings its focus, its keyboard and its announcement from the browser, with no script to get them wrong; a library of primitives adds what they lack, so where one is active these patterns are built on it. | [] |

### native-popover-anchored-to-its-trigger · SHOULD
Unless another active block brings primitives that place their own popovers, a native `popover` is placed against its trigger by the browser's anchor positioning — `anchor-name` on the trigger, `position-anchor` and `position-area` on the popover — never by a script that measures; a supported browser that lacks anchor positioning loads its polyfill once, in the entry file.

| Why | Tags |
|---|---|
| the browser places the popover without a positioning library, and one polyfill loaded before any popover opens serves them all. | [ux, performance] |

### native-html-elements-first → native-semantics-first · MUST
`<button>` for an action, `<a>` with a real `href` for a move, lists as lists, tables with headers and a caption; ARIA only where HTML has no element.

| Why | Tags |
|---|---|
| a native element brings its role, its keyboard and its announcement; ARIA on a generic element brings only a promise. | [] |

### landmarks-and-skip-link → wcag-aa-conformance · MUST
Every page has landmarks — header, navigation, main, footer — and a link to skip to the content comes first.

| Why | Tags |
|---|---|
| screen reader and keyboard users jump by landmarks, and the skip link spares them the navigation on every page. | [] |

### fields-declare-autocomplete → wcag-aa-conformance · MUST
A field for the user's own data declares its purpose with `autocomplete`.

| Why | Tags |
|---|---|
| the browser then fills it in, and assistive technology can tell the user what it is for. | [ux] |

### live-regions-polite-by-default → status-changes-announced · MUST
A status goes to a polite live region, and only an urgent error to an assertive one. An invalid field has `aria-invalid` and `aria-describedby` pointing at its message.

| Why | Tags |
|---|---|
| assertive announcements interrupt what the user is listening to, so they are kept for what cannot wait. | [] |

### navigation-moves-focus-to-the-view → status-changes-announced · MUST
After a navigation inside the program, focus moves to the new view's main heading and the document's title names the view; a navigation that only changes a parameter of the same view keeps focus.

| Why | Tags |
|---|---|
| the platform announces nothing when the program changes the URL, so a screen-reader user hears no new page. | [a11y] |

### live-region-mounted-before-message → status-changes-announced · MUST
A live region is in the document, empty, before its message is put into it.

| Why | Tags |
|---|---|
| a region rendered together with its text is often not announced at all. | [a11y] |

### entry-document-declares-the-viewport → wcag-aa-conformance · MUST
Every entry document declares the responsive viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">`.

| Why | Tags |
|---|---|
| without it a phone lays the page out at a desktop's width and shrinks it, so its text is small and its layout never reflows. | [a11y] |

### viewport-never-blocks-zoom → wcag-aa-conformance · MUST
The viewport declaration never blocks zooming: no `user-scalable=no`, and no `maximum-scale` below 5.

| Why | Tags |
|---|---|
| a page that cannot be zoomed fails the people who need it larger. | [a11y] |

### url-holds-shareable-view-state → view-state-kept-in-the-navigation-state · MUST
View state a link or a reload must reproduce — filters, sort, page, selection, the open tab — lives in the URL, and nothing else does.

| Why | Tags |
|---|---|
| a view in the URL can be shared, bookmarked and restored with the back button; a view kept elsewhere is lost on reload. | [ux] |

### language-declared-by-lang → screen-declares-its-language · MUST
A document declares its language in the `lang` of its root, and a passage in another language carries its own `lang`.

| Why | Tags |
|---|---|
| `lang` is the attribute assistive technology reads to choose how a text is pronounced. | [a11y] |
