# Stack — TanStack SPA

> The **stack axis in one chapter**: the toolbox (runtime, libraries, framework APIs) and the binding of the client, web, ui and react chapters to it — data binding, state homes, routing & page mechanics, the design-system toolchain, verification. **This is the only chapter that names a brand.** Where a rule and this chapter cover the same ground, the rule chapter states the law and this one the mechanics — the law wins.

---

## 1. The toolbox

Bun is the only runtime, package manager and script runner.

- Install with `bun install`; run scripts with `bun run <script>`; execute binaries with `bunx <bin>`. Never `npm`/`yarn`/`pnpm`/`npx`.
- The project ships a single lockfile: `bun.lock`. Committing `package-lock.json`, `yarn.lock` or `pnpm-lock.yaml` is forbidden.
- Fall back to another tool only when something is genuinely incompatible with Bun, and record the reason in the relevant config or script.

These are the canonical tools. Introducing a library outside this set requires a concrete justification recorded in the change.

| Concern | Tool |
| --- | --- |
| Language | TypeScript |
| Framework | React 19, Compiler on (the `framework` chapter) |
| App shell | TanStack Start (SPA mode — §2) |
| Routing | TanStack Router |
| Server state / data fetching | TanStack Query |
| Table state (sort / filter / paginate) | TanStack Table |
| Forms | TanStack Form |
| HTTP client | ky |
| UI primitives | Radix (via shadcn) |
| Component source | shadcn (installed locally; adapted per the `ui` chapter) |
| Styling | Tailwind (consuming design-system tokens) |
| Bundler / dev server | Vite |
| Lint + format | Biome, through `@droneey/devkit-ts-biome` |
| Dependency boundaries | dependency-cruiser |
| Git hooks | lefthook, through `@droneey/devkit-ts-lefthook` |
| TypeScript config | `@droneey/devkit-ts-tsconfig` |
| Tests | Vitest + React Testing Library |
| Boundary & schema validation | zod |
| Component workshop | Storybook |

**TanStack first.** For anything TanStack covers — routing, server state, tables, forms — use TanStack. No parallel router, server-state library, or table/form engine.

**Biome owns lintable style.** Biome's config is the source of truth for everything it can enforce (formatting, import order, lint rules). Rules Biome already enforces are not restated as prose anywhere.

**dependency-cruiser owns boundaries.** The client `architecture` §7 rules live in `.dependency-cruiser.mjs` and run in `check`.

**Experiments.** A tool under evaluation ships behind an entry here instead of the table — currently: **Paraglide** (i18n). An experiment either graduates into the table or leaves the codebase; the verdict is recorded in `DECISIONS.md`.

**`#/` resolution.** `package.json` → `"imports": { "#/*": "./src/*" }`; `tsconfig.json` → `"moduleResolution": "bundler"`. Native to Bun and Node, zero resolver config. shadcn generates `@/`, rewritten to `#/` during the install-and-adapt pass (`ui` rule 5).

---

## 2. SPA mode

The app is a client SPA (TanStack Start in SPA mode): no server functions, no server routes, no database access from the application — the web `architecture` §3 stance. SSR may be enabled later for render speed only.

---

## 3. Data binding (the `app` layer)

- Queries bind with **`useQuery`**, commands with **`useMutation`** — the concrete form of the read/write binding-unit convention.
- The hook is the composition root: its `queryFn`/`mutationFn` binds the port-typed repository module object. A plain `<name>.ts` composition exists only for a **non-React** caller (router loader/guard).
- Each feature owns a query-key factory (`app/utils/cache.utils.ts`); keys are built from the port's params so they never drift from the contract.
- The hook contract's concrete field names: **`isLoading`**, **`isError`**, **`error`** (the `DomainError`), **`payload`** (`undefined` until first success); a command exposes **`run`**. No fabricated defaults; Query's `null`s convert to `undefined` at this boundary.

---

## 4. State homes

| State | Home |
|-------|------|
| Server data | TanStack Query cache (only) |
| Filters / sorting / pagination | URL search params |
| Local UI | component `useState`/`useReducer` |
| Global client (theme, session, toasts) | minimal global store |

- Server data is never duplicated into a store. The same `queryKey` across components shares one fetch — always through the feature's key factory.
- Merge URL params on write; never overwrite the whole set.
- A command invalidates only its **own** feature's keys; cross-feature refresh is coordinated at `routes`/`root` or left to Query's staleness/refetch.

---

## 5. Optimistic updates

The rollback-capable lifecycle the client `architecture` §9 requires is Query's mutation lifecycle:

- **`onMutate`** — snapshot the affected keys (`getQueryData`), apply the optimistic writes (`setQueryData`; entity instances come from domain factories), return the snapshot as context.
- **`onError`** — restore the snapshot from context.
- **`onSettled`** — invalidate the touched keys so the cache reconciles with the server.
- Optimistic writes never live inside `mutationFn` — outside the lifecycle there is no rollback path.
- Purely component-local optimism with no cache involvement uses React's `useOptimistic` instead.

---

## 6. Routing & page mechanics

File-based routes (TanStack Router). `routeTree.gen.ts` is generated — never hand-edited; `router.tsx` wires the instance.

- **The route owns its URL:** it reads/validates search params (`validateSearch`), runs the `loader`, and composes the page. A co-located piece never imports `useNavigate`/`useSearch`; it writes URL state by calling a callback the route passed down.
- **Page-private co-location.** A screen's non-reusable pieces live beside the route in a `-components/` folder — the `-` prefix excludes them from route generation and marks them private to the page.

```
routes/
├── __root.tsx                 # root route: providers wiring, devtools (always present)
├── _app/                      # pathless LAYOUT (the `_` keeps it out of the URL: orders stays /orders)
│   ├── route.tsx              # layout shell: chrome + <Outlet/>   (route.tsx, NOT index.tsx — see below)
│   ├── -components/           # layout-only pieces (e.g. app-header), excluded from routing
│   └── orders/
│       ├── index.tsx          # the orders route: validateSearch, loader, page composition
│       └── -components/       # orders page pieces (orders-table, orders-filters), excluded from routing
```

- A **layout** is a pathless route (`_name/route.tsx`) rendering `<Outlet/>`. In folder form the layout file is **`route.tsx`, never `index.tsx`** — a layout in `index.tsx` is not inherited by child routes (documented TanStack pitfall). `index.tsx` is the page *at* that path; `route.tsx` is the wrapper for all children.
- Route-level access control lives in `beforeLoad`/loaders using a feature's public non-React composition (e.g. `getAuthSession`).

---

## 7. Errors at the edge

The web `architecture` §5 rule is implemented in `root`'s Query layer: `QueryCache`/`MutationCache` `onError` handlers translate `UnauthorizedError` into session state through the auth feature's public API. Hooks surface `DomainError`s via Query's error state; `ui` renders error states; app-wide error boundaries live in `root`.

---

## 8. UI & design system

Binds the brand-free `ui` chapter to the concrete toolchain. Each row resolves a concern the `ui` chapter names abstractly:

| `ui` concern | Tool | How it binds |
|---|---|---|
| Styling framework | **Tailwind** | consumes design-system tokens; tokens + `@utility` definitions live in `libs/ui/theme/theme.css`; the "raw utility" escape hatch (`ui` rule 1) is a bare Tailwind class; the mobile-first widen prefixes (web `ui` rule 1) are `md:`/`lg:`/`xl:`, the forbidden desktop-first override is `max-*:` |
| Variant engine | **cva** | declares a component's self-contained variant→class map in `<name>.variants.ts` and types its props via `VariantProps` (`ui` rule 3) |
| Class-merge helper | **`cn()`** (clsx + tailwind-merge) | merges class lists; it never decides appearance (`ui` rule 3) |
| Cascading-variant CSS | Tailwind **`@utility`** | resolves a `data-*` variant in CSS (`ui` rule 3) |
| Accessible primitives | **Radix** | the required base for complex interactive widgets (`ui` rule 4); **`<Slot>`** is the slot primitive for polymorphic render / `asChild` (`ui` rules 8, 9) |
| Component source | **shadcn** | vendored as local source via its CLI, then adapted on arrival (`ui` rule 5); never imported from a package |
| Component workshop | **Storybook** | component development & states, co-located as `<name>.stories.tsx` |
| Focus indication | the `focusable` utility in `theme.css` | the visible focus ring of web `ui` rule 2 |
| Routing primitives | TanStack Router | `<Link>`, `useNavigate`, `useParams` — consumed only by routes/widgets, never by presentational components (`ui` rule 13) |

Swapping any of these is an edit here: the `ui` chapter's principles are unaffected.

---

## 9. Verification

`check` runs, in this order: `lint:check` (Biome), `type:check` (`tsc --noEmit`, the real type gate), `test:unit` (Vitest with coverage thresholds of 100 percent for functions and lines in its configuration file), `architecture:check` (dependency-cruiser), `build` (Vite production build; it does **not** type-check).

```bash
bun run check
```

Script names are the stable interface; the tools behind them are fixed here. Hooks, commit validation and branch validation come from `@droneey/devkit-ts-lefthook`, installed by `bun install`.
