# Layout

> Governs a TypeScript file: the kinds of file, and the names and extensions of source files.

## Vocabulary

A **typed file** is a file that can carry types: a `.ts`, `.tsx`, `.mts` or `.cts` file. A `.js`, `.mjs` or `.cjs` file carries none.

A source file is **`.ts`**{#typescript-source}, and one that writes markup **`.tsx`**{#typescript-markup-source}.

A folder's surface is its **`index.ts`**{#surface}, and a program starts at **`main.ts`**{#entry}.

An ambient declaration, which describes what exists without an import, lives in a **`.d.ts`**{#ambient-declaration} file.

## Kinds

### source-file-is-a-typescript-file · MUST

Every source file is a typed file, never a JavaScript file. Exempt: a file a framework or a tool reads by its spelling, which its block names.

#### Why

A JavaScript file among the sources carries no types, so it escapes every check of them and hands the typed files values no check saw.

#### Examples

```text title="Avoid"
src/features/orders/domain/order/
├── entities/
│   └── order.aggregate.ts
└── value-objects/
    └── order-number.value-object.js
```

```text title="Prefer"
src/features/orders/domain/order/
├── entities/
│   └── order.aggregate.ts
└── value-objects/
    └── order-number.value-object.ts
```

### typescript-source-spelled-ts-or-tsx → format-has-one-extension · MUST

Every typed file among the sources is a `.ts` file or a `.tsx` file, never a `.mts` or a `.cts` file. Exempt: a file a framework or a tool reads by its spelling, which its block names.

#### Why

A source file with another extension is missed by every glob and tool written for the one spelling.

#### Examples

```text title="Avoid"
src/libs/csv/
├── index.ts
└── parse-csv.mts
```

```text title="Prefer"
src/libs/csv/
├── index.ts
└── parse-csv.ts
```

### tsx-only-where-markup-is-written · MUST

Every `.tsx` file writes markup.

#### Why

A `.tsx` file that writes no markup tells its reader it renders when it does not, and is parsed for markup it does not hold.

#### Examples

```tsx title="Avoid"
// src/features/orders/presentation/utils/order-status-label-key.utils.tsx
export const orderStatusLabelKey = (status: OrderStatus): string => `orders.status.${status}`;
```

```ts title="Prefer"
// src/features/orders/presentation/utils/order-status-label-key.utils.ts
export const orderStatusLabelKey = (status: OrderStatus): string => `orders.status.${status}`;
```

## Names

### source-file-named-in-kebab-case → file-name-in-its-owners-case · MUST

Every source file's name is in kebab-case. Exempt: a name a framework or a tool reads by its spelling, which its block names.

#### Why

A file in another case is missed by the reader who looks for it by its name, and two names that differ only by case collide on a file system that ignores case.

#### Examples

```text title="Avoid"
src/features/orders/application/use-cases/commands/
├── cancelOrder.use-case.ts
└── place_order.use-case.ts
```

```text title="Prefer"
src/features/orders/application/use-cases/commands/
├── cancel-order.use-case.ts
└── place-order.use-case.ts
```

### file-named-after-its-export → file-named-after-its-topic · SHOULD

Every file is named after what it exports. A file of several exports is named after the unit they form. Exempt: a surface, an entry file, a name a framework or a tool reads by its spelling, which its block names, and a file of specs or of fixtures, which is named after what it proves or builds.

#### Why

A file named otherwise is not found by the name of what it holds, so a reader who knows the thing searches the folder for its file.

#### Examples

```ts title="Avoid"
// src/libs/collections/helpers.ts
export const chunk = <TItem>(items: readonly TItem[], size: number): TItem[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
```

```ts title="Prefer"
// src/libs/collections/chunk.ts
export const chunk = <TItem>(items: readonly TItem[], size: number): TItem[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
```
