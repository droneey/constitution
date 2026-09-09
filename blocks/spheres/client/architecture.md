# Architecture — client

> The single source of truth for how a **client application** is structured: a program that renders a user interface over a server that owns the data. Every developer — and every agent — follows this. No improvisation.
> This chapter states **principles and boundaries**, not micro-instructions; particulars are *derived*. It is **framework-free**: the framework's reactive units, the cache, the router and the styling engine are named by concern, and the `framework` and `stack` chapters bind them. Code examples illustrate with the default stack.
> Boundaries are enforced mechanically by the dependency checker. An un-enforced rule is decoration.

---

## 0. Philosophy

**Strict Clean Architecture, organized by feature (vertical slices), with command/query separation and a small DDD vocabulary.**

- Business logic lives in a pure `domain/` layer that knows nothing about the framework, the transport or any library.
- The **server owns the data.** The client renders, orchestrates and caches; it never becomes a second source of truth.
- Dependencies point **inward**. Reads and writes are **separated**. Features are **isolated**; composition happens above them. Boundaries are **enforced by lint**.

The test for *where business logic goes*: **would this rule still be true with no user interface at all?** Yes → `domain`. No (cache invalidation, notifications, navigation) → `app`.

---

## 1. Top-level structure

```
src/
├── root/           # App composition shell & bootstrap. USED ONLY by the screens layer and the router.
│   ├── providers/  # framework providers + the instances they wire (data client, theme, auth init)
│   └── ui/         # components/ (dumb) + widgets/ (smart): app-wide composition, layout, nav
│
├── kernel/         # SHARED KERNEL: pure, universal, STABLE business types, value objects
│                   # (Money, Email, DateRange) & structural contracts (WithId, Paginated — §5).
│                   # Pure like domain. Kept small. Created by symptom.
│
├── assets/         # static: icons, images, fonts
│
├── libs/           # PROJECT-AGNOSTIC code. Zero app knowledge. Could be published.
│   ├── ui/         # dumb primitives + theme/design tokens
│   └── <other>/    # generic wrappers (libs/http, libs/date)
│
├── shared/         # APP-SPECIFIC, cross-feature, NO business logic, not tied to any feature's domain.
│   ├── ui/ · providers/ · hooks/ · constants/ · utils/ · types/
│
├── features/       # business features (bounded contexts). Most code lives here. See §2.
│   └── <feature>/
│
├── routes/         # SCREENS: thin composition above features + access guards.
│                   # Screen-private pieces co-locate beside their screen (mechanics: the sphere's refinement).
├── router.*        # router instance + wiring (stack)
├── types.d.ts      # the project's semantic aliases (code chapter §7)
└── styles.*
```

Composition flows **up**: `routes`/`root` may import features (through their public `index.ts`) and assemble them. This is not a violation of feature isolation — the law forbids feature↔feature only; someone above must do the assembling.

**Co-location at the screens level.** A screen's non-reusable pieces — the parts that exist only for that one screen — live beside their screen, excluded from routing and private to the screen. They are **not** reusable components and never travel to another screen; reusable UI goes to `features/*/ui`, `shared/ui`, or `libs/ui` (§8). The concrete folder convention and its pitfalls are the refining sphere's and the stack's.

---

## 2. Feature structure (strict, command/query separated)

```
features/<feature>/
├── domain/                                # PURE. The stable core.
│   ├── entities/                          # business types & enums
│   ├── contracts/                         # type-only boundaries the outer layers depend on
│   │   └── repositories/                  # ports (interfaces). Split by CQRS side; one file per repo.
│   │       ├── queries/<name>.repository.ts    # READ port + its params/result (one file, all exported)
│   │       └── commands/<name>.repository.ts   # WRITE port + its params/result (one file, all exported)
│   ├── use-cases/                         # OPTIONAL — present only when an operation carries business logic
│   │   ├── queries/<name>/                # <name>.ts + <name>.types.ts  (READ; types own the I/O contract)
│   │   └── commands/<name>/               # <name>.ts + <name>.types.ts  (WRITE; business rules & preconditions)
│   └── errors/                            # domain error types
│
├── infra/                                 # adapters. The only place transport & response validation live.
│   └── repositories/
│       └── api-<feature>/                 # one folder per repository (the API adapter)
│           ├── api-<feature>.repository.ts   # impl module object — implements the feature's port(s)
│           ├── api-<feature>-raw.types.ts    # raw wire DTOs                  (when needed)
│           ├── api-<feature>.types.ts        # request / mapping-helper types (when needed)
│           └── api-<feature>.utils.ts        # mappers: raw ↔ entity          (when needed)
│
├── app/                                   # framework-binding layer (composition root)
│   ├── use-cases/
│   │   ├── queries/<name>/                # the read binding unit — the composition root of the read
│   │   └── commands/<name>/               # the write binding unit; + <name>.ts only for a non-reactive caller
│   └── utils/cache.utils.ts               # cache-key factory (per feature)
│
├── ui/                                    # feature UI; knows entities (types type-only; enums at runtime)
│   ├── components/                        # dumb
│   └── widgets/                           # smart (consume app binding units; placement-agnostic)
│
└── index.ts                               # PUBLIC API & the feature's ONLY aggregate barrel — see §10.
```

| Layer | Owns | Changes when… | Framework? | Transport? |
|-------|------|---------------|------------|------------|
| `domain` | types, ports, business rules | business changes | ❌ | ❌ |
| `infra` | repo impl, mapping, validation | backend/transport changes | ❌ | ✅ |
| `app` | binding units, cache, keys | data-binding changes | ✅ | ❌ |
| `ui` | components & widgets | design changes | ✅ | ❌ |

Optional segments (`constants`, `types`, `hooks`, `schemas`, …) are not listed exhaustively: place them by co-location (principles, Law 12).

**App use-cases vs domain use-cases — strict separation.** `app/use-cases` is the **default** home for every operation and holds only **app logic**: cache orchestration, invalidation, the composition root. `domain/use-cases` holds only **business logic** and exists **only when the operation has any** — it may use the repository (via its port) to do that work. A pass-through with no business logic has **no** `domain` use-case; its binding unit calls the port-typed repository directly. The two never mix.

**Each unit owns the types it introduces.** A type has one home — the unit whose signature declares it — and everyone else imports it from there; it is never re-exported (aliased) through a second layer to fake a second owner. The **port** declares the operation's `params`/`result` in its `<name>.repository.ts` and owns them; `app` and `infra` import them from the port. A **use-case** owns only the types **its own** signature adds.

**One repository per side, one file each.** A port is a single file under `domain/contracts/repositories/queries/` (or `commands/`) that declares its `params`/`result` types **and** the interface, exporting them all. The CQRS axis is the **folder**, never a filename suffix; the interface keeps its `…QueryRepository`/`…CommandRepository` type name. Universal contract shapes — `WithId`, `WithTimestamps`, `Paginated`, `WithPaginationParams` — come from `kernel/contracts`.

**Precise sub-barrels; the feature `index.ts` is the only aggregate.** The layer folders (`domain/`, `app/`, `infra/`, `ui/`) are containers — they carry **no** aggregate `index.ts`. Internal code imports the exact sub-barrel it couples to; cross-feature code imports only the feature's public `index.ts`. The import path then states the coupling, and there is no aggregate to launder a forbidden import through.

**The binding unit is the composition root.** An operation's `app` layer is one **binding unit** — the framework's reactive unit, a hook in a hook-based framework — that binds the concrete repository and calls the use-case. A plain function composition is added only when a **non-reactive** caller needs it (a router loader or guard). Co-location again: inline until a second, non-reactive consumer appears.

**The binding-unit contract.** A unit that loads or mutates exposes a **uniform result surface**: a loading state, an error state carrying a typed `DomainError` (§6), and the result — **`undefined` until the first success**, never a fabricated default (`?? []`, `?? 0`). Fabricated defaults erase the loading / empty / error distinction: consumers branch on the states, never on a sentinel empty. A unit exposes only the **axes its operation has** — one that cannot fail omits the error state; a fire-and-forget command exposes only its trigger. The concrete field names are the stack's.

---

## 3. Command/Query separation in practice

```
READ PATH                                       WRITE PATH
domain/use-cases/queries/get-orders/            domain/use-cases/commands/cancel-order/
  → OrdersQueryRepository (read port)              → OrdersCommandRepository (write port)
infra: api-orders/ — apiOrdersRepository implements BOTH ports (one module object, one backend, one set of mappings)
app/use-cases/queries/get-orders/               app/use-cases/commands/cancel-order/
  (read binding unit)                             (write binding unit)
```

- **Two port interfaces, one implementation.** Interface segregation gives type-level protection: a read use-case is handed an `OrdersQueryRepository` and physically cannot see `cancel()`. The unit is the **external system**: when the two sides integrate different systems (a data API for reads, an identity provider for writes), each system gets its own adapter implementing its side's port — one adapter per system, never per method.
- Queries are side-effect free. Commands carry effects + business rules; they receive their data as **input** and never call a query.
- Cache invalidation after a command happens in the command's binding unit, via the key factory.

A repository implementation is a **module object, not a class**: it holds no state, so `new`/`this` buy nothing, and an object literal typed by the port intersection is simpler, tree-shakeable and serialization-indifferent.

```ts
export const apiOrdersRepository: OrdersQueryRepository & OrdersCommandRepository = { /* … */ };
```

**Streaming operations.** When a result arrives progressively (server-sent events, sockets, chunked answers), the port stays the contract and the stream becomes data:

- The port method exposes the stream as an **`AsyncIterable` of domain events**, alongside any immediate result — e.g. `send(params): Promise<{ events: AsyncIterable<MessageStreamEvent> }>`. Completion is the iterator ending; failure is the iterator throwing a domain error; cancellation is the consumer breaking out. No callback parameters, no library stream types in port signatures.
- The **event vocabulary is a discriminated union declared in the port file** — that operation's result contract, in domain terms. Wire event names and shapes are DTOs: `infra` parses the transport, validates, and maps wire → domain events; unknown wire events die in `infra`, never inward.
- When streamed events progressively build an entity, that rule is a **pure domain use-case reducer** (`(state, event) → state`); `app` folds the stream into the cache with it.
- CQRS placement follows causation: a stream caused by a mutation belongs to the **command**; a passive server-push subscription is a **query**-side port.

---

## 4. Domain modelling

**Entities** are **data shapes** by default. The server owns them; they arrive already valid. Behaviour lives in use-cases, not on the entity. When the **client** owns an entity (a draft, an optimistic creation, a purely client-side entity), it may have a validating factory — because then the client holds its invariant. An entity with a **lifecycle** is a **discriminated union keyed by its state** (`code` chapter §9), so an invalid combination cannot be constructed.

**Value Objects** are small values with their own invariant that must be guarded **on the client**. They are **branded types + functions**, not classes — branded primitives serialize through JSON/cache/URL cleanly; classes lose their prototype. A class is justified only when a VO carries substantial behaviour.

```ts
// kernel/value-objects/email.ts — the ONE source of truth for "what a valid email is"
export type Email = string & { readonly __brand: 'Email' };
export function createEmail(raw: string): Email { /* validate, then `as Email` */ }
export function isValidEmail(raw: string): boolean { /* same predicate */ }
```

**Patterns we use:** Entities, Value Objects, Repositories (one **per aggregate root**, not per table), Bounded Contexts (= features), Anti-Corruption Layer (infra mapping), Application/Domain Services (use-cases), Shared Kernel, Ubiquitous Language.

**Patterns deliberately NOT used** (backend-heavy, low value on a client where the server is the source of truth and the data layer handles reactivity): Domain Events, Event Sourcing, formal Specifications, heavyweight Factories.

---

## 5. Kernel & cross-feature sharing

When a real cross-feature **business** type appears, lift it **down** into `kernel` — never sideways between features. Rules: `kernel` is pure like `domain` (lint-enforced); any feature's `domain` may import it; it is not `shared` (which carries no business).

Across bounded contexts, **duplication is the default, sharing is the exception.** The same word often means different things in different contexts; forcing one model couples the contexts. A feature that needs a sliver of another's concept models its own narrow view (`CustomerRef`) rather than importing a foreign model. Structural mixins (`WithId`, `WithTimestamps`, `Paginated<T>`) are composed, never subtracted from a god-interface.

**Kernel or `shared` — decision tree.** Stop at the first "yes": (1) Is it **business vocabulary** — would it keep its meaning with no user interface at all? Used by 2+ features → `kernel`; by one → that feature's `domain`. (2) Is it an **application mechanism** — framework, platform, formatting, transport plumbing — used by 2+ features? → `shared` (it may *reference* kernel vocabulary, never define business of its own). (3) Would it make sense **published** with zero app knowledge? → `libs`. (4) One consumer → co-locate with it. The lint holds the floor: `domain` may import `kernel`, never `shared`.

---

## 6. Anti-corruption: mapping, validation, errors

- **Mapping** lives in `infra`, both directions: response → entity, command input → request DTO. DTO types never leave `infra`.
- **Validation, three levels:** untrusted server responses → schema validation in `infra` (at the boundary; the engine is the stack's) — so a wire change fails at this **one** boundary, not deep in `app`/`ui`; business invariants → `domain`; form/input → reused VO predicates composed into the form's schema, co-located with the form.
- **Errors, two layers:** universal failures (`UnauthorizedError`, `UnexpectedError`) live in `kernel/errors`; feature-specific ones in `domain/errors`, all extending `DomainError`. `infra` maps transport failures to domain errors **in the repository's `catch`** via a shared `mapApiToDomainError({ error, map })` helper in `shared` — it resolves auth and unexpected failures itself and takes a per-feature `code → DomainError` map; nothing raw (HTTP, network, timeout) ever reaches `app`. `app` surfaces them via the binding unit's error state (§2); `ui` renders error states; the global unauthorized rule and app-wide error boundaries live in `root`.

---

## 7. Dependency rules (enforced by the dependency checker)

```
kernel/      → itself + global types ONLY (pure business kernel)
domain/      → own domain + kernel + global types
contracts    → entities, kernel               (repository ports: query + command interfaces)
queries      → entities, query port, kernel    commands → entities, command port, errors, kernel
infra/       → domain (ports/entities/errors), kernel, shared/providers, libs, external (impl of BOTH ports)
app/         → domain use-cases, ports (TYPE), infra (BIND), entities, kernel, shared, framework + data libs
ui/          → libs/ui, shared/ui, app binding units, domain/entities (types type-only; enums at runtime), kernel (runtime — VO predicates, enums)
shared/      → kernel, libs, sibling shared, external, global types
libs/        → external + sibling libs ONLY
root/        → shared, libs, features' public index, framework libs (USED ONLY by the screens layer and the router)
routes/      → root, features' public index, shared, libs, framework libs
```

**Hard prohibitions (the check fails):** feature↔feature; `domain`/`kernel` importing anything impure; `ui` reaching `infra`/use-cases/ports directly (entities are type-only); `queries`↔`commands`; `libs` importing any app code (incl. `kernel`); `shared` importing `features`/`root`/`routes` (`kernel` is allowed); deep imports past a feature's `index.ts`; `root` imported by non-entrypoints; cycles.

---

## 8. Homes

**A component** — stop at the first "yes": (1) used only by one screen, not reusable → beside that screen (§1); (2) knows a feature's domain → that feature's `ui/`; (3) generic primitive, zero app knowledge → `libs/ui`; (4) app-specific, used by 2+ features, no single feature's domain → `shared/ui`; (5) app-wide shell/provider composition → `root/ui`.

**Naming by location.** Every component lives in its own folder (`ui` chapter, rule 6); the folder name carries the prefix or suffix its location and role give it:

| Location | Prefix / suffix | Example |
| --- | --- | --- |
| `libs/ui/*` | none (domain-agnostic) | `button/`, `card/` |
| `shared/ui/*` | none (location encodes it) | `page-header/` |
| `root/ui/*` | `root-` (mandatory — flags shell role) | `root-header/`, `root-splash/` |
| `features/*/ui/*` | feature-name prefix | `orders-table/`, `orders-summary/` |
| any smart component | `-widget` suffix (mandatory) | `orders-table-widget/` |

The `-widget` suffix is mandatory because a widget is the only UI that carries business logic; the suffix makes that responsibility visible at every import site.

**A tool** is placed by the two principles of `principles` §2: name the concern, not the brand; a tool never defines the shape of a layer it doesn't belong to. So a transport SDK's wire shapes die in `infra`; the cache engine's types never reach `domain`; a validation engine *conforms to* domain types; a rendering or i18n library never crosses into `domain`/`app`.

---

## 9. State model

Every kind of state has **exactly one home**; everything else reads it. Ownership decides the home: **server-owned data** lives only in the data layer's cache; **view state** that should survive reload and sharing lives where the sphere puts it (the URL on the web, navigation state on a device); **ephemeral UI state** lives in the component; the few genuinely **global client concerns** (theme, session, notifications) live in one minimal store. Server data is never duplicated into a client store, and cache keys come from the feature's key factory so they never drift.

A command invalidates only its **own** feature's cached data. When a write in one feature must refresh another's, that coordination lives at the composing layer (`routes`/`root`, which may import both public APIs) or is left to the cache's staleness policy — one feature never reaches into another's cache.

**Optimistic updates.** An optimistic write happens inside a **rollback-capable mutation lifecycle**, never inline in the mutation body where no rollback path exists. Optimistic entity instances come from domain factories (§4). Real streamed data arriving mid-flight is **not** optimism: folding it into the cache as it arrives is the normal write path (§3).

---

## 10. Screen composition and conventions

A **screen** owns its navigation state and is the composition point: it reads and validates that state, loads (or delegates loading of) the screen's data, and assembles the page from feature widgets and screen-private pieces. Only the screen knows its own address — **a piece never reads or writes navigation state itself**; it receives data and `on*` callbacks and stays presentational by default. Business logic always comes from the feature's `app` binding units — a screen never reimplements it.

Screen pieces are **not reusable widgets** — they exist only for their screen. A genuinely reusable block belongs in `features/*/ui`, `shared/ui`, or `libs/ui` (§8), and a widget that owns business logic carries the `-widget` suffix.

- **Barrels.** A folder that groups **items** exposes them through one `index.ts`; consumers import the folder, not a deep path — everywhere, any child count. A barrel is a **curated surface, not a mirror**: internals (mappers, raw/wire types, helpers) stay unexported. Layer-container folders carry **no** aggregate `index.ts` (§2). The feature's public root `index.ts` exports only widgets and entity types a screen actually consumes.
- **Tests** follow the `testing` chapter: `__tests__/` beside the unit, inward-out — most tests in `domain` (pure, no fakes); `infra` with a faked transport; `app` binding units behind their data-client provider; `ui/widgets` with the component testing library the stack names.

---

## 11. Authorization

`features/auth` owns session & role logic, exposed only through its public `index.ts`. Screen-level access control (guards, redirects) lives in the screens layer using that public API. Feature UI adapts to permissions received via composition, not by importing `auth` internals.

---

## 12. Recipes

**Add a read:** entity (if new) → add method to query port → `infra` schema+mapping & impl method → key factory entry + `app/queries` binding unit → render in `ui`, export new public widget. *(Add a `domain/queries` use-case only if the read carries business logic.)*

**Add a write:** entity/error (if new) → add method to command port → `infra` impl (map entity→DTO, map errors) → `app/commands` binding unit (invalidate via key factory) → wire in `ui`, export new public widget. *(Add a `domain/commands` use-case for the business rule/precondition when there is one.)*

**Add a streaming operation:** as above, plus: declare the domain event union in the port → expose the stream as `AsyncIterable` of those events → map wire→domain events in `infra` → reduce events into entities via a pure `domain` use-case → fold the stream into the cache in the binding unit (§3).

**Add a cross-feature business type:** put it in `kernel`; import from feature `domain`. **Add a component:** run the §8 tree.

---

## 13. Definition of done

- [ ] `domain`/`kernel` import only allowed pure targets; reads/writes separated at every level
- [ ] No cache logic in repositories; one impl module object per external system implements its port(s)
- [ ] Business logic lives in a `domain/queries|commands` use-case; app logic lives in `app/use-cases`; the two stay strictly separate
- [ ] `app` binding units type repos by port, bind the concrete module object, use the key factory; results honour the contract (§2 — no fabricated defaults)
- [ ] Response validated & mapped in `infra`; DTOs don't leave `infra`; errors mapped to domain errors
- [ ] `ui` reaches data only via `app` binding units; entities/kernel imported type-only
- [ ] No feature↔feature; cross-module imports hit `index.ts`; public index exports only widgets + entity types
- [ ] Server data only in the cache; view state in its one home
- [ ] Naming, imports, and language patterns per the `code` chapter; tests per the `testing` chapter
- [ ] The dependency check passes
