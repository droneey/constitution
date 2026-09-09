# UI

> Governs the **design system** and **how components are authored**: theming, sourcing, composition, API shape, accessibility, locale.
> It does **not** govern where a component lives, layer boundaries or dependency direction — that is the `architecture` chapter. Rules here name a location only when the rule genuinely depends on it.
> **Tools are named by concern, not brand.** The concrete styling framework, component source, primitive library and variant engine live in the `stack` chapter; the rules below state the principle, and code examples use the default stack for illustration. Platform specifics — the web's keyboard and DOM, a device's touch — are the refining sphere's.
> Many rules below are **not** lint-catchable; they are real, review-enforced rules, not decoration.

---

## Theming

### 1. The design system is the single source of truth
All visual values (colour, spacing, sizing, typography, radius, motion) originate as tokens in the design system's **theme module** — the `architecture` chapter says where it lives. Nothing visual is hardcoded anywhere else.

- Theme artefacts live only in the theme module: the token definitions, the language-side constants, the theme enums (e.g. `ThemeMode`), the theme binding units (e.g. `useTheme`).
- **Three token layers, no overlap.** `PRIMITIVE` = raw literals (`--p-size-8`), never consumed by UI. `SEMANTIC` = role-based (`--color-surface-level-1`, `--text-sm`), consumed by UI. `COMMON` = cross-cutting shell constants (`--spacing-below-header`), consumed by UI. Test: a token is `SEMANTIC` if its name is meaningful in a conversation about UI *intent*.
- **Escape to a raw utility rarely.** Reach for a design-system token first. A bare framework utility is allowed only when (a) no token expresses the need **and** (b) minting one would be irrational (`flex`, `items-center`, `grid-cols-2`, `truncate`). Otherwise add the token at the correct layer rather than reaching for a raw value.

### 2. No component-named tokens
Token names tied to a component (`--card-bg`, `--button-padding-x`, `--modal-shadow`) are forbidden in the token layer — they collapse the layer boundary. Component-specific appearance is resolved at the component layer via variants (rule 3), not in the tokens.

### 3. Two variant mechanisms, chosen by reach
A component's **self-contained** variants — appearance only its own root needs (`variant`, `size` on a button) — are declared as **one declarative variant→class map**, co-located in `<name>.variants.ts`, that also types the variant props; it is the shape vendored source components arrive in. Ad-hoc conditional class logic outside that map is forbidden — the class-merge helper merges classes, it never decides them.

A variant that must **cascade** — descendants or surrounding styles adapt to an ancestor's state (theming a subtree, parent-driven appearance) — flows through a `data-*` attribute on the root and is resolved by the styling framework's cascading mechanism. Never resolve a cascading variant by prop-drilling it into children.

```tsx
// Component declares the variant once.
<div data-coloring={coloring} className='colored-surface rounded-3 p-3'>…</div>
```
```css
@utility colored-surface {
  background-color: var(--color-surface-level-1);
  &[data-coloring='blue'] { background-color: var(--color-surface-level-1-blue); }
}
```

Payoff: self-contained variants stay typed and local; cascading variants reach descendants with zero prop drilling; in both mechanisms the design system's tokens remain the only source of appearance values (rule 1).

---

## Component authoring

### 4. Build on the primitive library and component source, always
Build UI from the project's **component source** and accessible **primitive library** (both named in the `stack` chapter), styled with the framework consuming our tokens. Author a component from scratch **only** when the source has no equivalent.

- Complex interactive patterns — dialog, popover, dropdown, combobox, tabs, tooltip, menu, select, accordion, context menu, hover card, navigation menu — MUST be built on the **accessible primitive library** (directly or via the component source). Rolling them by hand is forbidden.
- This rule governs the *obligation to use* the toolchain; the concrete toolchain is named in the `stack` chapter.

### 5. Vendored source components are adapted on arrival
Components from an external source library are installed as **local source**, never imported from a package. **The code is theirs; the look is fully ours.**

Before review, every installed component MUST be:
1. Placed and named per our conventions (rule 6 and the `architecture` chapter's homes).
2. Restyled so every raw colour/spacing value becomes a design-system token (rule 1) — driven by our tokens, not the source's defaults.
3. Stripped of props no call site exercises (rule 12).
4. Made to conform on prop shape (rules 9–11) at the component, not per call site.

Pre-install, grep the primitive library for an existing primitive that already covers the need (rule 7). Installing is a last resort. A source component merged verbatim is a foreign body — **integrate it or reject it.**

### 6. One folder per component
Every component lives in its own folder; `index.ts` exports only the public surface (internals stay unexported).

```
<name>/
  <name>.tsx            // implementation
  <name>.types.ts       // props & exported types    (when shared — code chapter §11)
  <name>.variants.ts    // variant map               (when applicable)
  <name>.context.ts     // context for compounds      (when applicable)
  <name>.hooks.ts       // UI-logic binding units, scoped here (when applicable)
  <name>.constants.ts   // enums / constants          (when applicable)
  components/            // sub-components used only by this component (parent-prefixed)
  index.ts              // public exports ONLY
```

Where a component lives, and the prefix or suffix its location and role give it — the mandatory `-widget` suffix of a smart component included — is the `architecture` chapter's (its homes section).

### 7. Composition over duplication
Build a new component by composing existing primitives. Reimplementing markup that already lives in a primitive is forbidden. Decision order: cover it with existing components → extend a primitive → only if genuinely new, author the primitive and compose it.

### 8. Compound composition over prop explosion
A component with more than one region, optional part or configurable slot MUST be a **compound component** — a layout root plus named sub-components attached as static properties — receiving content through `children`. Encoding regions as props (`withBackButton`, `breadcrumbs={[…]}`, `titleAction={…}`, `leftContent`, `footer`) is forbidden once a second region or optional part appears.

**Reach for it when** the component renders two+ regions, a part is toggled by a `withX`/`hasX` boolean, a prop is an array mapped into repeated children, or a prop is a node named after a position. **Don't** compound a genuine leaf with a small stable content surface (`Button`, `Badge`, `Input`).

```tsx
// ✗ prop explosion
<PageHeader title='Order #1024' withBackButton breadcrumbs={[…]} titleAction={<Copy/>} />

// ✓ compound composition — consumer arranges the regions
<PageHeader>
  <PageHeader.BackAction><Button onClick={goBack} /></PageHeader.BackAction>
  <PageHeader.Breadcrumbs>
    <PageHeader.Breadcrumbs.Item><Link to='/orders'>Orders</Link></PageHeader.Breadcrumbs.Item>
    <PageHeader.Breadcrumbs.Title>Order #1024</PageHeader.Breadcrumbs.Title>
  </PageHeader.Breadcrumbs>
</PageHeader>
```

- Sub-components live in `components/`, parent-prefixed; `index.ts` exports the compound + prop types only — sub-components are reached through the dotted API. How they are attached is the `framework` chapter's.
- **Slot vs container children:** use a **slot primitive** (stack) + a single element when the consumer must keep control of the rendered tag (a link, a button); use a free-form node for containers.
- **Common case coexists:** when one arrangement recurs across the app, wrap the compound in a convenience **widget** that encapsulates it once — never regress to props.

---

## Component API conventions

*(The linter does not enforce these — they are real rules.)*

### 9. Boolean props use a fixed prefix
Every boolean prop uses one of five prefixes, each a distinct role. Unprefixed (`disabled`), mixed (`isWithIcon`) or negated (`isNotDisabled`) booleans are forbidden.

| Prefix | Role | Examples |
| --- | --- | --- |
| `is` | component state | `isDisabled`, `isLoading`, `isActive` |
| `has` | presence of data/content | `hasIcon`, `hasError` |
| `with` | optional feature/slot opt-in | `withDivider`, `withFloatingLabel` |
| `should` | behaviour policy hint | `shouldAutoFocus` |
| `as` | polymorphic render (slot primitive) | `asChild` (this purpose only) |

This rule governs **component props**. A data or configuration schema names its fields by its own document's rules.

### 10. Event handler props use `on*`
Callback props are named `on` + event in PascalCase (`onClick`, `onValueChange`, `onRangeChange`). The internal handler may be `handleClick`, but the prop is `onClick`. Action-verb (`click`), `handle*` props and past-tense (`onClicked`) are forbidden.

### 11. Reuse an existing prop name before inventing one
Before adding a prop, grep every UI folder of the application for an existing prop with the same semantic and adopt its exact name. Synonym drift (`isLoading` vs `isPending` vs `isFetching` for the same thing) is forbidden; if variants already exist, converge them in the change.

### 12. Delete unused props
An optional prop that no call site exercises is dead — remove it from the types, drop the destructuring, hardcode the former default at the point of use. Reintroduce it only when a concrete use case returns. Every optional prop is a standing commitment to every future caller.

---

## Routing, accessibility, locale

### 13. Routing stays out of presentational components
Presentational (dumb) components MUST NOT import routing primitives (links, navigation or params binding units). For navigation they receive a **render-prop slot**; for non-navigation actions they receive a callback. The screen or widget owns routing and supplies the link. The slot takes `children` first, then any binding data — `(children, …data) => element`.

```tsx
// presentational — no router import
interface OrdersTableProps { renderRowLink: (children: ReactNode, order: OrderPreview) => ReactElement }

// screen/widget — owns routing
<OrdersTable renderRowLink={(children, order) => (
  <Link to='/orders/$publicId' params={{ publicId: order.publicId }}>{children}</Link>
)} />
```

Use a callback (`onRowClick`) instead when the action is not a fixed navigation (selection, opening a modal, triggering a mutation).

### 14. Accessibility is a contract
Every interactive component MUST be fully operable through the platform's input methods and show a visible focused or selected state.

- Use the platform's native semantic elements by default — never a generic container with a press handler.
- Never remove a focus indication without a replacement from the design system.
- Complex interactive patterns go through the accessible primitive library (rule 4).
- An icon that is the sole content of an interactive element needs an accessible label; a decorative icon is hidden from assistive technology.
- Before shipping any interactive component, verify by hand with the platform's input methods; the refining sphere lists the exact checks.

### 15. The primitive library is locale-agnostic
Components in the primitive library contain no hardcoded user-facing text and import no i18n library. Text arrives via props (`string | node`); every consumer above it supplies translated strings. Language-neutral structural glyphs (`…`, `/`, `—`) and icons are fine.

```tsx
function DataTable({ emptyMessage, … }) { return rows.length === 0 ? <span>{emptyMessage}</span> : /* … */; }  // ✓
function DataTable() { return <span>No results.</span>; }                                                       // ✗
```
