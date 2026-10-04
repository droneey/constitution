# Browser with user interface

> Screens in a browser: the URL, the document, the viewport and the pointer.

## links-are-anchors · MUST
Navigation renders an anchor with a real `href`.

| Why | Check | Tags |
|---|---|---|
| a real link opens in a new tab, can be copied and is announced as a link; a click handler is none of these. | review | [a11y, ux] |

## popover-placed-by-anchor-positioning · SHOULD
A native `popover` is placed against its trigger by CSS anchor positioning — `anchor-name`, `position-anchor`, `position-area` — never by a script that measures; a supported browser that lacks it loads the anchor-positioning polyfill once, in the entry file.

| Why | Check | Tags |
|---|---|---|
| the browser places it and flips it at the viewport's edge without a positioning library or a frame of the wrong position. | review | [ux, performance] |

## mobile-first-additive-breakpoints → components-size-to-their-container
Base styles serve the smallest screen, and wider screens add overrides from a minimum width; nothing desktop-first is undone. No minimum width locks a screen out, and every entry document declares the responsive viewport.

| Why | Check | Tags |
|---|---|---|
| styles that only add are simpler than styles that undo, and the smallest screen is never an afterthought. | review | [] |

## dynamic-viewport-units → components-size-to-their-container · MUST
Heights use the small viewport unit or the container — `svh` by default, `dvh` only where content must follow the toolbar — never `100vh` or `100vw`, and no layout width is fixed in pixels outside the tokens.

| Why | Check | Tags |
|---|---|---|
| `100vh` ignores the browser's own toolbars on phones, and content slides under them. | review | [] |

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

## primitive-passes-class-and-data-slot → primitive-passes-its-element-through
In the browser, a primitive accepts its element's native attributes and class, merges its class through the class merger, and marks its parts with `data-slot`.

| Why | Check | Tags |
|---|---|---|
| a caller then styles and targets a primitive as it would the element underneath. | review | [ux] |

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
