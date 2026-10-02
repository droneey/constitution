# Browser with user interface

> Screens in a browser: the URL, the document, the viewport and the pointer.

## links-are-anchors · MUST
Navigation renders an anchor with a real `href`.

| Why | Check | Tags |
|---|---|---|
| a real link opens in a new tab, can be copied and is announced as a link; a click handler is none of these. | review | [a11y, ux] |

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
