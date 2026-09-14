# Code — TypeScript

> Governs **how we write TypeScript**: imports, naming, enums, absence sentinels, escape hatches, comments, semantic aliases, type ownership, discriminated unions and typed errors.
> *Structure* is the `architecture` chapter; the general clean-code rules are in `principles`; the resolver, the linter and the runtime are the `stack` chapter's. Anything the linter already enforces is not restated here.

---

## 1. Imports: `#/` across modules, relative within
Use the **`#/` alias** for an import that **leaves** the importing module; use **relative** imports between files **inside** it. A module is the unit the `architecture` chapter draws a boundary around and reaches through its public surface — a feature, a library — or a top-level source folder that has no such units inside. A module never imports itself via `#/`. The stack fixes how `#/` resolves; the rule is the same everywhere.

```ts
// inside src/features/orders/ui/components/order-summary.tsx
import { Card } from '#/libs/ui';                    // another module → #/
import { useCart } from '#/features/cart/public';    // another feature → #/
import { useOrders } from '../../app/use-cases';     // same feature → relative
import { OrderTotal } from './order-total';          // sibling file → relative
```

---

## 2. Naming
- **Files & folders: `kebab-case`** — always.
- **Exports:** `PascalCase` for components, classes, types, interfaces, enums; `camelCase` for functions, hooks, variables, instances.
- A file is **one semantic unit**, named after it in kebab-case. With one export, the name matches that export (`order-status.ts` → `OrderStatus`). With several, they must form one unit — a family of field schemas, the mappers of one external system, a model with the types only it uses — and the file name names that unit (`order-fields.ts`). A file that gathers unrelated exports is split.
- A file carries a **role suffix** when the folder alone does not say what it is — `.model.ts`, `.use-case.ts`, `.port.ts`, `.error.ts`, `.command.ts`, `.spec.ts`. The set a sphere uses is fixed in its `architecture` chapter; a suffix is never invented per file.

---

## 3. `enum` for grouped values; `as const` for atomic ones
A group of related named values is a TypeScript **string `enum`**. A group of numbers another system defines — exit statuses, HTTP statuses — is a **numeric `enum` with every value written out**; TypeScript lets any `number` into a numeric enum type, so a number that arrives from outside stays `number` and is compared against the members, never typed as the enum. `as const` is for arrays/tuples and single literal constants — never an object imitating an enum.

```ts
enum CardColoring { Default = 'default', Blue = 'blue', Pink = 'pink' }   // ✓ grouped values
enum HttpStatus { NotFound = 404, InternalServerError = 500 }             // ✓ numbers another system defines
enum Priority { Low, High }                                               // ✗ numbers nobody defined
const NAV_ITEMS = [/* … */] as const;                                     // ✓ array
const ORDERS_PATH = '/orders' as const;                                   // ✓ single literal
const CardColoring = { Default: 'default', Blue: 'blue' } as const;       // ✗ enum in disguise
```

A discriminant of a lifecycle union (§9) is a string literal, not an enum member: the union is the type, the literal is the tag.

---

## 4. `undefined` is the absence sentinel; `null` is a boundary citizen
Internal code uses **`undefined`** as the sole "absence" value. Inventing `null` in entities, props, hooks, utils, stores or loaders is forbidden.

`null` is permitted only: in raw API types (mirroring the wire), at third-party SDK adapter boundaries, and as a framework's own explicit "nothing" value where the framework demands it. Mappers at the boundary convert `null → undefined` when mapping to the inner model.

- Optional params/props: `?: T` — the value may be absent. Write `?: T | undefined` only where an explicit `undefined` is itself meaningful; the compiler's `exactOptionalPropertyTypes` keeps the two apart and is on in every repository. "No result" returns: `T | undefined` (`return;`).
- Comparisons are strict: `=== undefined`, `=== null`. Never `== null` / `!= null`.
- Use `??` for defaults and `?.` for access. Never `!value` as a nullish check on a non-boolean (it also catches `0`, `''`, `NaN`).

```ts
interface OrderMeta { promocode: string | undefined }                 // ✓ internal: undefined
function mapOrder(raw: OrderRawApi): Order {
  return { updatedAt: raw.updatedAt ?? undefined };                   // ✓ convert at the boundary
}
interface OrderMeta { promocode: string | null }                      // ✗ null in an internal entity
if (value == null) {}                                                 // ✗ non-strict
```

---

## 5. No type-system escape hatches
Forbidden unless explicitly justified in the change:
- `as X` casts where a type guard, a discriminated union or a generic parameter would work.
- `!` non-null assertions.
- `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`.

Narrow with a type guard, a conditional or a discriminated-union check instead. A legitimate exception carries a linter suppression line that states why.

```ts
const user = data as User; const name = user!.name;   // ✗
function isUser(v: unknown): v is User { return typeof v === 'object' && v !== null && 'id' in v; }
if (isUser(data)) { const name = data.name; }         // ✓
```

---

## 6. Comments in TypeScript
The rule is in `principles`: a comment explains *why*, never *what*; commented-out code is forbidden. In TypeScript specifically:
- JSDoc only for a **non-obvious public API**; never redundant JSDoc on self-describing props or parameters.
- A linter suppression (`biome-ignore`-style) is a comment that states the reason; a bare suppression is forbidden.

---

## 7. Semantic aliases are a project's own vocabulary
A project may declare general-purpose semantic aliases and prefer them over bare primitives in entity fields, props and signatures whenever the semantic matches.

```ts
type DateString = string; type Email = string; type Id = string;
type Link = string; type PhoneNumber = string; type SearchQuery = string;
```

- The aliases live in **one ambient declaration file** at the root of the source tree, so they need no import.
- **The set is the project's vocabulary.** Each project declares only the aliases it uses; the constitution prescribes the mechanism, never the list.
- They are nominal in **name only** — no runtime branding. A value that needs an enforced invariant uses the branded value-object pattern (`architecture` chapter), not an alias.
- Do not use an alias when the value is genuinely just a `string` (a CSS class).
- Add a new alias only when the semantic appears in two or more places and has no existing match.
- **Publishable, app-agnostic code never references them.** It declares its own parameter types and the app maps at the call site. Ambient usage leaves no import for the linter to catch, so this line is review-enforced — it is what keeps such code genuinely publishable.

---

## 8. Don't export trivially derivable types
Do not add a named export for a type derivable from an already-exported parent in one or two readable indexed accesses — derive it inline at the consumer. Name and export it only when derivation needs three or more accesses or otherwise obscures intent.

```ts
// ✓ derive inline from the exported parent
function mapEntity(raw: GetAllOrdersResult['items'][number]): OrderPreview { /* … */ }

// ✗ parallel name for a type already inside the exported parent
export interface OrderPreviewRaw { id: string; name: string }
```

---

## 9. Make illegal states unrepresentable
A type that models a **lifecycle** — a value with distinct stages, each carrying different valid fields — is a **discriminated union keyed by a state tag**, not one flat shape with optional fields and boolean flags. The compiler then rejects impossible combinations, instead of every caller re-asking "is this field set yet?".

```ts
// ✗ a flat bag of optionals + a flag: a pending and a finished thing are the same type
interface Message { content: string; isCompleted: boolean; sources?: Source[]; failureReason?: string }

// ✓ the states that actually exist, each with exactly its valid fields
type Message =
  | { status: 'pending'; content: string }
  | { status: 'completed'; content: string; sources: Source[] }
  | { status: 'failed'; reason: string };

// a function can now demand the one state it serves — the wrong state won't compile
function renderSources(message: Extract<Message, { status: 'completed' }>): ReactNode { /* … */ }
```

- A boolean that gates whether *other* fields are meaningful (`isCompleted`, `isDraft`, `isLoaded`) is the smell — promote it to the **discriminant** of a union.
- Making every field optional (`id?`, `status?`) to quiet the compiler is surrender, not safety: model the states that exist, so invalid ones have nowhere to hide.
- This is the type-level form of §4 and §5, and the domain-modelling expression of honest types: fewer runtime checks, bugs caught at compile time.

---

## 10. Errors are typed, surfaced, never swallowed
A caught error is **handled, rethrown, or mapped to a typed error** — never silently discarded. An empty `catch {}`, a `.catch(() => undefined)`, or any swallow that hides a failure is forbidden: it turns a fault into silent corruption, the hardest bug to find.

- A typed error carries a **code** the caller can branch on. **Branch on the type or the code, never on message text** — `if (error.message.includes('already exists'))` is a hostage to copy edits and translations.
- Deliberately ignoring an error is itself a decision and must be **explicit**: a one-line suppression stating why it is safe to drop (§6), not a silent empty block.
- What may be logged with an error — identifiers and reasons, never secrets or personal data — is the `security` chapter's rule.

---

## 11. Types live with their consumer; a `.types.ts` only when shared
A type is declared **in the file that uses it** — a component's props in the component file, a hook's argument and return shapes in the hook file, a util's shapes in the util file. A type earns its own `[name].types.ts` (or the sphere's equivalent `.model.ts`) only when it is **imported by two or more files**.

- **One consumer → inline**, beside the consumer. No parallel types file, no second import hop.
- **Two or more consumers → extract** next to the primary file, surfaced through the folder barrel.
- Promote inline → extracted on the **second** consumer, never pre-emptively; demote back when the second consumer disappears.

This is the file-level form of §8 and of the clean-code rules: a single-use type read next to its use is clearer than the same type one file and one import away.

```ts
// ✓ single consumer — props inline in the component file
interface OrderSummaryProps { order: Order; onClose: () => void }
function OrderSummary({ order, onClose }: OrderSummaryProps): JSX.Element { /* … */ }

// ✓ shared by the hook, its provider, and a selector → its own file, via the barrel
// order-filters.types.ts
export interface OrderFilters { status: OrderStatus; query: SearchQuery }
```
