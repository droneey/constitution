# Browser with user interface

> Screens in a browser: the URL, the document, the viewport and the pointer.

## targets-at-least-24-css-px → targets-meet-platform-minimum
A pointer target is at least 24 × 24 CSS pixels, padding included, and 44 for a primary touch target.

| Why | Check | Tags |
|---|---|---|
| 24 is the floor WCAG sets for any pointer; 44 is what a thumb hits reliably. | review | [] |

## images-sized-for-density · SHOULD
Content images carry `srcset` and `sizes`, in a modern format; a canvas scales by the device's pixel ratio; icons are SVG.

| Why | Check | Tags |
|---|---|---|
| one image size is blurry on a dense screen or wasteful on a plain one. | review | [performance, ux] |

## content-avoids-the-fold · SHOULD
On a foldable screen, content and controls never cross the fold; the layout follows the viewport segments the browser reports.

| Why | Check | Tags |
|---|---|---|
| text and buttons that fall into the hinge cannot be read or pressed. | review | [ux] |

## primitive-passes-attributes-and-class → primitive-passes-its-element-through
In the browser, a primitive passes its native attributes and its class through, its class merged with the caller's.

| Why | Check | Tags |
|---|---|---|
| a caller then styles and sets attributes on a primitive as it would on the element underneath. | review | [ux] |

## images-declare-their-size → core-web-vitals-within-budget
An image declares its width and height.

| Why | Check | Tags |
|---|---|---|
| the page reserves the image's space before it loads, so nothing moves when it arrives. | review | [performance] |

## core-web-vitals-within-budget · SHOULD
Largest Contentful Paint stays within 2.5 s, Interaction to Next Paint within 200 ms and Cumulative Layout Shift within 0.1 at the 75th percentile, measured in the field.

| Why | Check | Tags |
|---|---|---|
| these are what users feel of speed; a bundle budget is only a proxy for them. | review | [performance, ux] |

## no-browser-globals-during-render · MUST
Code that can render on a server reads no browser global while it renders.

| Why | Check | Tags |
|---|---|---|
| on the server the global does not exist, and the render fails or differs from the one in the tab. | review | [errors] |

## busy-submit-marked-aria-disabled → submit-busy-while-submitting
A busy submit button is marked `aria-disabled`, never `disabled`, so it keeps its focus.

| Why | Check | Tags |
|---|---|---|
| a `disabled` button loses focus to the page and is skipped by assistive technology, while `aria-disabled` keeps it in reach and says why it does nothing. | review | [a11y] |

## Accessibility

## dialog-popover-and-details-native → complex-patterns-on-accessible-primitives
Unless another active block brings accessible primitives for these patterns, the browser's own elements carry them: `<dialog>` for a dialog, the `popover` attribute for a popover and `<details>` for a disclosure or an accordion's section.

| Why | Check | Tags |
|---|---|---|
| each brings its focus, its keyboard and its announcement from the browser, with no script to get them wrong; a library of primitives adds what they lack, so where one is active these patterns are built on it. | review | [] |

## native-html-elements-first → native-semantics-first
`<button>` for an action, `<a>` with a real `href` for a move, lists as lists, tables with headers and a caption; ARIA only where HTML has no element.

| Why | Check | Tags |
|---|---|---|
| a native element brings its role, its keyboard and its announcement; ARIA on a generic element brings only a promise. | review | [] |

## landmarks-and-skip-link → wcag-aa-conformance
Every page has landmarks — header, navigation, main, footer — and a link to skip to the content comes first.

| Why | Check | Tags |
|---|---|---|
| screen reader and keyboard users jump by landmarks, and the skip link spares them the navigation on every page. | test | [] |

## fields-declare-autocomplete → wcag-aa-conformance
A field for the user's own data declares its purpose with `autocomplete`.

| Why | Check | Tags |
|---|---|---|
| the browser then fills it in, and assistive technology can tell the user what it is for. | review | [ux] |

## live-regions-polite-by-default → status-changes-announced
A status goes to a polite live region, and only an urgent error to an assertive one. An invalid field has `aria-invalid` and `aria-describedby` pointing at its message.

| Why | Check | Tags |
|---|---|---|
| assertive announcements interrupt what the user is listening to, so they are kept for what cannot wait. | review | [] |

## navigation-moves-focus-to-the-view → status-changes-announced
After a navigation inside the program, focus moves to the new view's main heading and the document's title names the view; a navigation that only changes a parameter of the same view keeps focus.

| Why | Check | Tags |
|---|---|---|
| the platform announces nothing when the program changes the URL, so a screen-reader user hears no new page. | test | [a11y] |

## live-region-mounted-before-message → status-changes-announced
A live region is in the document, empty, before its message is put into it.

| Why | Check | Tags |
|---|---|---|
| a region rendered together with its text is often not announced at all. | test | [a11y] |

## viewport-never-blocks-zoom → wcag-aa-conformance
The viewport declaration never blocks zooming: no `user-scalable=no`, and no `maximum-scale` below 5.

| Why | Check | Tags |
|---|---|---|
| a page that cannot be zoomed fails the people who need it larger. | review | [a11y] |
