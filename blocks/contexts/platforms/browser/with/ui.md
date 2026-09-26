# Browser with user interface

> Screens in a browser: the URL, the document, the viewport and the pointer.

## url-holds-shareable-view-state · MUST
View state a link or a reload must reproduce — filters, sort, page, selection, the open tab — lives in the URL, and nothing else does. A screen writes the one parameter it changes and keeps the others.
**Why:** a view in the URL can be shared, bookmarked and restored with the back button; a view kept elsewhere is lost on reload.
**Check:** review
**Tags:** data, ux
**Implements:** `view-state-homes`

## document-metadata-owned-by-screen · SHOULD
Title, description and links of the document are declared by the screen or component that owns them; a third-party script is declared where it is used.
**Why:** metadata declared beside what it describes changes with it, and no central file must know every screen.
**Check:** review
**Tags:** architecture

## links-are-anchors · MUST
Navigation renders an anchor with a real `href`, handed to presentational components through their slot.
**Why:** a real link opens in a new tab, can be copied and is announced as a link; a click handler is none of these.
**Check:** review
**Tags:** a11y, ux
**Implements:** `navigation-passed-by-slot`

## mobile-first-additive-breakpoints · SHOULD
Base styles serve the smallest screen, and wider screens add overrides from a minimum width; nothing desktop-first is undone. No minimum width locks a screen out, and every entry document declares the responsive viewport.
**Why:** styles that only add are simpler than styles that undo, and the smallest screen is never an afterthought.
**Check:** review
**Tags:** ux
**Implements:** `components-size-to-their-container`

## dynamic-viewport-units · MUST
Heights use dynamic viewport units or the container, never `100vh`, `100vw` or a fixed width in pixels.
**Why:** `100vh` ignores the browser's own toolbars on phones, and content slides under them.
**Check:** review
**Tags:** ux
**Implements:** `components-size-to-their-container`

## targets-at-least-24-css-px · MUST
A pointer target is at least 24 × 24 CSS pixels, padding included, and 44 for a primary touch target.
**Why:** 24 is the floor WCAG sets for any pointer; 44 is what a thumb hits reliably.
**Check:** review
**Tags:** a11y, ux
**Implements:** `targets-meet-platform-minimum`

## hover-styles-behind-hover-media · MUST
A hover style that changes visibility has a state without hover, or sits behind `@media (hover: hover)`.
**Why:** on a touch screen hover never happens, and whatever it reveals would never appear.
**Check:** review
**Tags:** a11y, ux
**Implements:** `hover-content-reachable-by-focus-and-tap`

## cascading-variant-by-data-attribute · SHOULD
A variant that restyles descendants is a `data-*` attribute on their ancestor, resolved by the stylesheet.
**Why:** the stylesheet then reaches every descendant, and no prop is drilled for looks.
**Check:** review
**Tags:** ux
**Implements:** `cascading-variant-set-once-on-ancestor`

## images-sized-for-density · SHOULD
Content images carry `srcset` and `sizes`, in a modern format; a canvas scales by the device's pixel ratio; icons are SVG.
**Why:** one image size is blurry on a dense screen or wasteful on a plain one.
**Check:** review
**Tags:** performance, ux

## content-avoids-the-fold · SHOULD
On a foldable screen, content and controls never cross the fold; the layout follows the viewport segments the browser reports.
**Why:** text and buttons that fall into the hinge cannot be read or pressed.
**Check:** review
**Tags:** ux
