# Framework — React

> How the client anatomy binds to **React 19 with the React Compiler enabled**. The client `architecture` chapter names the framework's reactive unit by concern; here it is the **hook**. The router, the data layer, the styling engine and the test harness are the `stack` chapter's.

---

## 1. React 19, Compiler on
Target **React 19 with the React Compiler enabled.** Use the modern API; the legacy equivalent is forbidden whenever the modern one serves the same purpose.

**The Compiler memoises automatically — hand-written `useMemo`, `useCallback` and `React.memo` are forbidden.** They are allowed only with profiler evidence recorded in the change.

| Legacy — forbidden | Modern — required |
| --- | --- |
| `useMemo`, `useCallback`, `React.memo` | nothing — the Compiler memoises |
| `useContext(Ctx)` | `use(Ctx)` (also `use(promise)`) |
| `useState` + `useEffect` for async / pending | `useActionState`, `useTransition`, `useOptimistic` |
| `forwardRef((props, ref) => …)` | `ref` as a regular prop: `function Foo({ ref }) {}` |
| `<Ctx.Provider value={…}>` | `<Ctx value={…}>` |
| ref callback returning `void` | ref callback returning a cleanup function |
| class components, inheritance | function components, composition |

---

## 2. Hooks are the binding units
- An operation's `app` layer is its **`<name>.hooks.ts`**: the hook binds the concrete repository module object, types it by the port, and calls the use-case. The hook is the composition root; no container.
- A plain `<name>.ts` composition exists only for a **non-React** caller — a router loader or guard. Inline until that second consumer appears.
- **Effects only in hooks.** A component never performs IO; `domain` is effect-free; `infra` never touches React.
- Hooks and UI **orchestrate**; they never decide business rules. A rule that would still be true with no UI lives in `domain`.
- The binding-unit contract of the client `architecture` §2 holds for every hook: loading, typed error, result `undefined` until first success, only the axes the operation has. The data layer's field names are the stack's.

---

## 3. Components
- **Function components only.** `ref` is a regular prop. Context is read with `use(Ctx)` and provided with `<Ctx value>`.
- **Compose components and hooks** — compound components, custom hooks — never class-component inheritance.
- **Compound components** (`ui` concern, rule 8) attach their sub-components with a typed `Object.assign`; the explicit intersection annotation is what makes `PageHeader.BackAction` type-check.
- **Data down, events up.** A component receives data through props and reports through `on*` callbacks; it never knows which screen it sits on.
- **Slot vs container.** A slot that must keep control of the rendered tag takes a `ReactElement`; a free-form container takes `ReactNode`. A render-prop slot is typed `(children: ReactNode, …data) => ReactElement`.
- Async UI state — pending, optimistic, transitions — uses `useActionState`, `useTransition` and `useOptimistic`, not hand-rolled `useState` + `useEffect` machinery. Component-local optimism with no cache involvement uses `useOptimistic`; cache-backed optimism follows the client `architecture` §9 lifecycle.

---

## 4. React in the browser
- Document metadata — `<title>`, `<meta>`, `<link>` — is rendered inline by the component that owns it; React 19 hoists and dedupes it. No metadata library, no side-effect hook for the document head.
- Async third-party scripts are rendered as `<script async src="…" />` in the component that needs them; no imperative script-tag management.

---

## 5. React on a device
TODO: the React Native specifics — the host components, the platform's accessibility props, the gesture and safe-area primitives — are recorded when the first mobile project lands.

---

## 6. Testing React
- Components and widgets are tested through the **component testing library** the stack names, by what a user sees and does — roles, labels, text — never by implementation details.
- Hooks are tested behind their **data-client provider**; a fake repository behind the port replaces the network.
- Screens are tested last and thinly, as composition: the pieces they mount and the callbacks they wire.
