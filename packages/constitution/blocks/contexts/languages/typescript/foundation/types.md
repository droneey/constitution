# Types

> Governs how TypeScript types the program: absence, equality, assertions, enums and brands, the derived and readonly types, and the values of time and money.

## General

### equality-never-loose · MUST

No comparison is loose. No `==` or `!=` is written, against `null` too.

| Why |
|---|
| loose equality converts its operands by rules few remember, and hides a second absent value behind the first. |

## Modelling

### any-never-written → unchecked-type-never-used · MUST

`any` is never written. No annotation, assertion or type argument spells it — `: any`, `as any`, `Record<string, any>`, `Promise<any>` — and no parameter is left without a type for the compiler to read as `any`.

| Why |
|---|
| an `any` switches the checks off for whatever it touches and spreads to every value derived from it, so one written in a corner reaches code that never named it. |

### exhaustive-branching-over-unions → closed-set-branched-exhaustively · MUST

A branch over a union or an enum names every member. A `switch` that returns from every case of a function whose return type is declared has no `default`, since the compiler proves it exhaustive; any other branch is a `switch` whose `default` assigns the value to `never`, or an `if` chain that ends in that check.

| Why |
|---|
| a branch without the check to `never` takes a new member silently into no case, and nothing shows the branches that must decide on it; a `default` beside the compiler's proof is a line no member reaches, which no spec can cover. |

### outside-number-set-is-a-numeric-enum → closed-name-set-declared-once · MUST

A set of numbers another system defines is a numeric `enum`. Such sets include exit statuses and HTTP statuses; every member's value is written, and a number that arrives keeps the type `number` until it is compared with the members.

| Why |
|---|
| a bare number does not say which of its system's meanings it carries, and an arriving number typed as a member before it is compared is taken for one it may not be. |

### brand-is-a-unique-symbol-key → identifier-branded-by-entity · MUST

A brand is keyed by the program's one `declare const brand: unique symbol`. It is an intersection with a property keyed by that symbol: `string & { readonly [brand]: '<Name>' }`.

| Why |
|---|
| brands written in several forms read differently in each file, and a brand keyed by a name any object literal can spell is carried by accident by an object that spells it; a unique symbol is spelled by no literal elsewhere, and never exists at run time. |

### program-type-never-declared-ambient → type-has-one-home · MUST

A type of the program is never declared ambient. It is exported by a module and imported where it is used, never declared in a global `.d.ts` or `declare global`; an ambient declaration only describes what the runtime or a library provides.

| Why |
|---|
| an ambient type reaches every file unseen, a layer that must not know it included, where no import shows where its meaning comes from and no import rule can hold it. |

### outside-type-derived-from-its-source → type-has-one-home · MUST

A library's parameter or result is derived from its source, never typed again. It is derived by `Parameters` or `ReturnType` from the function that takes or returns it.

| Why |
|---|
| a library's type typed again goes on compiling when the library changes its own, and the mismatch shows only at run time. |

### closed-name-set-is-a-string-enum → closed-name-set-declared-once · MUST

A closed set of named values the program owns is a string `enum`. It is never a union of string literals, nor an `as const` array or object whose type names the set. A union of literals given to a key utility — `Omit`, `Pick`, `Exclude`, `Extract` — names keys, not a set, and a type that describes another system's data keeps that system's literals.

| Why |
|---|
| a union of literals names no member, so each use repeats the literal and a rename misses some, and an `as const` object needs a second declaration for its type; a string `enum` is TypeScript's one declaration that names each member and holds its value at run time. |

### enum-subset-listed-by-its-members → declared-values-never-typed-again · MUST

A subset of an enum that the program lists is an `as const` array of the enum's members. The subset's type, where the code names it, is derived from that array beside it by `(typeof …)[number]`, never written again as a union; a subset the program only types is a union of the members.

| Why |
|---|
| a subset typed apart from its list is a second copy of it, so a member added to one is missing from the other — a single source of truth. |

### union-discriminant-is-an-enum-member → closed-name-set-declared-once · MUST

A union's discriminant is a member of the enum that names its kinds. A string literal is the discriminant only in a type that describes another system's data.

| Why |
|---|
| a discriminant written as a literal repeats the kind at every member and every branch, so a kind renamed or added is changed in some places and missed in others, and no branch is checked against the set of kinds. |

### conformance-checked-by-satisfies · SHOULD

A value's conformance to a type is checked with `satisfies`. It keeps the value's narrow type, and conformance is never checked with `as` or a widening annotation.

| Why |
|---|
| `as` lets a missing or wrong field pass, and a widening annotation throws away the exact value the compiler knew, so later code narrows it again. |

### shape-composed-of-small-shapes · SHOULD

A shared shape is composed of small named shapes. Such shapes are an identifier, timestamps, a page of results; a shared shape is never cut out of a large type by omitting or picking its fields.

| Why |
|---|
| a shape cut from a large one changes whenever the large one does, and hides which fields its consumer needs. |

### enum-never-declared-const · MUST

An enum is declared `enum`, never `const enum`.

| Why |
|---|
| a tool that compiles one file at a time cannot inline a `const enum` declared in another, so the program breaks under one compiler and runs under the next. |

## Invariants

### invariant-value-is-a-branded-type → invariant-value-is-plain-immutable-data · MUST

A value that keeps an invariant is a branded type with a companion. It brands a primitive, or a plain object with `readonly` fields, never a class instance, and its functions sit in a `const` object, its companion: `<Name>.is` narrows to it and, where it is an object, `<Name>.equals` compares it, never `===`.

| Why |
|---|
| a class instance loses its methods when it crosses a boundary that carries plain data, `===` counts two equal objects as two values, and functions kept apart from the type leave no one name that says at each call what is built and what is asked of it. |

### invariant-value-built-only-by-create → invariant-checked-at-construction · MUST

A value that keeps an invariant is built only by its checked constructor, **`<Type>.create`**{#checked-constructor} on its companion. It throws the type's error when the invariant fails, and no cast, object literal or spread of the type is written outside the companion's file, in specs as in production. A value with a starting transition is built instead only in the files of it, its rebuild from storage and the functions that change it.

| Why |
|---|
| a cast, a literal or a spread outside the companion makes a value, or a changed copy, that no check saw, and the brand then vouches for an invariant nobody proved — parse, don't validate. |

### business-types-readonly → value-immutable-by-default · SHOULD

A type of the program's business data is read-only. Its fields are `readonly`, its lists `readonly T[]`, and its maps and sets `ReadonlyMap` and `ReadonlySet`.

| Why |
|---|
| a mutable field lets any holder change the value under every other holder, and the compiler lets a mutation the domain never meant pass wherever the value travels. |

### received-array-changed-only-by-copying-methods → value-immutable-by-default · SHOULD

An array the code received or shares is changed only by copying it. It is changed through the copying methods — `toSorted`, `toReversed`, `toSpliced`, `with` — or a spread, never by `sort`, `reverse`, `splice` or an assignment to an index.

| Why |
|---|
| the mutating methods change the array in place for every holder of it, so a sort for one screen reorders the data another reads. |

## Values from outside

### type-assertion-never-written → narrowing-proves-all-it-claims · MUST

No type assertion is written. There is no `as` but `as const`, no `<T>value`, and no `!` non-null assertion.

| Why |
|---|
| an assertion claims a type no check proved and the compiler believes it, so the failure surfaces later, far from the line that claimed it. |

### outside-value-unknown-until-parsed → outside-value-untyped-until-parsed · MUST

A value from outside the program is typed `unknown`. This includes the result of `JSON.parse` and of `Response.json()`, typed `any`; its plain checks are `typeof`, `in` and `Array.isArray`, and a type argument a client's `.json<T>()` takes and `as Promise<T>` are casts.

| Why |
|---|
| a value typed anything but `unknown` can be used before any check narrows it, so a shape the data never had reaches code that trusts it — parse, don't validate. |

## Kinds of value

### undefined-is-the-only-absence → absence-shown-by-the-type · MUST

Absence is **`undefined`**{#absent}. `?: T` marks what may be absent, `T | undefined` is written only where a present `undefined` means something, and a bare `return;` gives no result. `null` appears only where an outside format or an API the code calls uses it — `Object.create(null)`, a signature a library imposes — and is compared only there.

| Why |
|---|
| one spelling of absence means one check everywhere, and a second spelling slips past the check written for the first. |

### absent-optional-field-left-out → absence-shown-by-the-type · MUST

An optional field that is absent is left out of its object, never set to `undefined`.

| Why |
|---|
| `in`, `Object.keys` and a spread all see a field set to `undefined` as present, and a spread of it erases the value it lands on. |

### machine-text-never-formatted-by-intl → machine-text-independent-of-the-locale · MUST

Text written for another program is never formatted by a locale-aware call. It uses no `toLocaleString`, `toLocaleUpperCase`, `toLocaleLowerCase`, `localeCompare` or `Intl` call; a number is written by `String` or `toFixed`, an instant by `toString` of Temporal or `toISOString`.

| Why |
|---|
| these calls read the locale of the process or the browser, so the same value is written differently on each machine. |

### date-and-time-are-temporal-values → instant-is-an-exact-time · MUST

A date, a time, an instant and a time zone are `Temporal` values. They are `Temporal.Instant`, `PlainDate`, `PlainTime` and `ZonedDateTime`; a `Date` appears only where an API demands one, converted at that call, and no date library but the `Temporal` polyfill is used.

| Why |
|---|
| `Date` mixes an instant with the machine's time zone and mutates in place, which is where date bugs come from; `Temporal` keeps each meaning in its own immutable type. |

### duration-measured-by-performance-now → duration-measured-on-a-monotonic-clock · MUST

A duration the program measures is the difference of two `performance.now()` readings, never of `Date.now()` or `Temporal.Now` values.

| Why |
|---|
| `Date.now()` and `Temporal.Now` read the wall clock, which jumps when the machine's time is corrected, so an elapsed time taken from them can come out negative or hours long; `performance.now()` only moves forward. |

### exact-quantity-never-a-fractional-number → exact-quantity-never-binary-float · MUST

An exact decimal quantity is never a `number` with a fraction. Money and every other such quantity is a `bigint`, or a `number` that `Number.isSafeInteger` accepts, counting its smallest unit and branded by its unit or currency, or a value of a vetted decimal library.

| Why |
|---|
| a JavaScript `number` is binary floating point, where `0.1 + 0.2` is not `0.3`, and past 2^53 it no longer holds every integer, so a total drifts from the sum of its amounts and the books no longer balance. |

### nullish-operators-for-absence · SHOULD

`??` gives a default and `?.` reaches through an absent value. Neither `!value` nor `||` tests or replaces an absent value that is not boolean.

| Why |
|---|
| a negation and a logical or also treat `0` and the empty string as absent, a bug waiting for its input. |

### value-made-text-by-a-named-form · SHOULD

A value becomes text through a form that names it. The form is a formatter, `String` of a primitive or a template of strings, never `+` with a value that is not a string, nor an object's default `toString`.

| Why |
|---|
| an object joined to a string prints `[object Object]`, and a number joined to a string is printed in no locale's form. |
