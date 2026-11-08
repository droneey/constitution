# Distribution

> Governs the declarations, the resolution and the polyfills of a TypeScript package others install.

## Contents

### package-export-typed-explicitly → distributed-package-ships-its-types · MUST

In a typed file, every export of a package others install states its type where its declaration needs one. That is a function's return type, or the type of a constant whose value is no literal, so each file's declarations are emitted from that file alone.

#### Why

A type left to inference changes the declarations a consumer compiles against whenever a change inside a function widens what the compiler infers, and declarations that need inference can be emitted only by the whole compiler, never file by file.

#### Examples

```ts title="Avoid"
// packages/slugs/src/to-slug.ts
/** Turns a title into the slug of its address. */
export const toSlug = (title: string) =>
  title.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
```

```ts title="Prefer"
// packages/slugs/src/to-slug.ts
/** Turns a title into the slug of its address. */
export const toSlug = (title: string): string =>
  title.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
```

### distributed-package-never-installs-a-polyfill · MUST

No package others install installs a polyfill globally.

#### Why

A polyfill a package installs globally replaces the one its consumer chose, so the consumer's values and the package's stop mixing, and the consumer's code runs on a built-in it never picked.

#### Examples

```ts title="Avoid"
// packages/booking-calendar/src/first-day-of-month.ts
import 'temporal-polyfill/global';

/** The first day of the month a date falls in. */
export const firstDayOfMonth = (date: Temporal.PlainDate): Temporal.PlainDate => date.with({ day: 1 });
```

```ts title="Prefer"
// packages/booking-calendar/src/first-day-of-month.ts
import { Temporal } from 'temporal-polyfill';

/** The first day of the month a date falls in. */
export const firstDayOfMonth = (date: Temporal.PlainDate): Temporal.PlainDate => date.with({ day: 1 });
```

## Runtimes

### distributed-package-checked-under-its-runtimes-resolution → package-checked-on-every-runtime-it-supports · MUST

Every package others install is type-checked under the module resolution of each runtime it supports, never a bundler's. An import that only a bundler resolves, such as one without its file's extension, then fails the check.

#### Why

A bundler's resolution passes an import that a runtime resolving by file path refuses at the consumer's first load.

#### Examples

```json title="Avoid"
// packages/money/tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

```json title="Prefer"
// packages/money/tsconfig.json
{
  "compilerOptions": {
    "module": "nodenext"
  }
}
```
