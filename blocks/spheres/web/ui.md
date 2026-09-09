# UI — web

> What the browser adds to the `ui` concern: the responsive contract, keyboard and DOM accessibility, and links that are links. The `ui` chapter is the law; this chapter binds it to the web platform.

---

## 1. Mobile-first responsive
Author base styles for small screens; widen with the styling framework's breakpoint prefixes as **additive** overrides. Desktop-first styles "undone" at small sizes (a `max-*` override) are forbidden.

```tsx
<div className='flex flex-col gap-2 md:flex-row md:gap-3' />   // ✓
<div className='flex flex-row gap-3 max-md:flex-col' />        // ✗
```

---

## 2. Accessibility on the web
The `ui` chapter's contract (rule 14), bound to the DOM:

- Use native semantic elements by default (`<button>`, `<a>`, `<input>`) — never `<div onClick>`.
- Every interactive component is fully **keyboard-operable** and shows a visible **focus ring** via the design system's `focusable` utility; never remove an outline without a replacement.
- **ARIA attributes are hyphenated** — `aria-label`, `aria-expanded`, `aria-hidden` — exactly as the DOM spells them. The camelCase form (`ariaLabel`) is forbidden.
- An icon that is the sole content of an interactive element needs an `aria-label`; a decorative icon is `aria-hidden`.
- Before shipping any interactive component, verify by hand: **Tab** reaches it, **Enter/Space** activates it, **Escape** dismisses overlays, focus returns to the trigger on close.

---

## 3. Links are links
Navigation renders an anchor. A presentational component receives the link through the render-prop slot of `ui` rule 13, and the screen or widget supplies the router's link primitive, so the browser gets a real `href`: middle-click, copy-link and assistive navigation work for free.
