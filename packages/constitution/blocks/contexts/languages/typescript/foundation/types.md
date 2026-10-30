# Types

> Governs how TypeScript types the program: absence, equality, assertions, enums and brands, the derived and readonly types, and the values of time and money.

## General

### equality-never-loose · MUST

No comparison is loose — no `==` or `!=`, against `null` too.

| Why |
|---|
| loose equality converts its operands by rules few remember, and hides a second absent value behind the first. |

## Modelling

### any-never-written → unchecked-type-never-used · MUST

`any` is never written — not `: any`, `as any`, `Record<string, any>` or `Promise<any>` — and no parameter is left without a type for the compiler to read as `any`.

| Why |
|---|
| an `any` switches the checks off for whatever it touches and spreads to every value derived from it, so one written in a corner reaches code that never named it. |

### exhaustive-branching-over-unions → closed-set-branched-exhaustively · MUST

A branch over a union or an enum names every member: a `switch` whose `default` assigns the value to `never`, or an `if` chain that ends in that check.

| Why |
|---|
| a new member then fails to compile at every branch that forgot it. |

### outside-number-set-is-a-numeric-enum → outside-number-set-declared-once · MUST

A set of numbers another system defines — exit statuses, HTTP statuses — is a numeric `enum` with every member's value written, and a number that arrives keeps the type `number` until it is compared with the members.

| Why |
|---|
| each number gets the name its system documents, and an arriving number kept as `number` is never taken for a member it may not be. |

### brand-is-a-unique-symbol-key → identifier-branded-by-entity · MUST

A brand is an intersection with a property keyed by the program's one `declare const brand: unique symbol`: `string & { readonly [brand]: 'OrderId' }`.

| Why |
|---|
| one form of brand reads the same in every file; no object literal written elsewhere can spell its symbol key, so nothing carries the brand by accident, and it never exists at run time. |

### program-type-never-declared-ambient → type-has-one-home · MUST

A type of the program is exported by a module and imported where it is used, never declared ambient in a global `.d.ts` or `declare global`; an ambient declaration only describes what the runtime or a library provides.

| Why |
|---|
| an imported type shows in every file where its meaning comes from and is held by the import rules like any other; an ambient one reaches every file unseen, a layer that must not know it included. |

### outside-type-derived-from-its-source → type-has-one-home · MUST

A type the program does not declare — a library's parameter or result — is derived from its source, never typed again: `Parameters<typeof lib.fn>[0]`, `ReturnType<typeof lib.parse>`.

| Why |
|---|
| a type derived from its source changes when the source does, while one typed again is a second home that drifts. |

### closed-name-set-is-a-string-enum → closed-name-set-declared-once · MUST

A closed set of named values the program owns is a string `enum` — never a union of string literals, nor an `as const` array or object whose type names the set. A union of literals given to a key utility — `Omit<Props, 'onSubmit'>`, `Pick`, `Exclude`, `Extract` — names keys, not a set, and a type that describes another system's data keeps that system's literals.

| Why |
|---|
| a string `enum` is TypeScript's one declaration that names each member and holds its value at run time; a union of literals names no member, and an `as const` object needs a second declaration for its type. |

### enum-subset-listed-by-its-members → declared-values-never-typed-again · MUST

A subset of an enum that the program lists is an `as const` array of the enum's members, and the subset's type, where the code names it, is derived from that array beside it, `type LoweredLevel = (typeof LOWERED_LEVELS)[number]`, never written again as a union; a subset the program only types is a union of the members.

| Why |
|---|
| the list and its type are then one declaration, while a subset typed apart from its list is a second copy of it that drifts. |

### union-discriminant-is-an-enum-member · MUST

The discriminant of a union is a member of the enum that names its kinds — `kind: ShapeKind.Circle`; a string literal only in a type that describes another system's data.

| Why |
|---|
| the union's kinds are then the set the enum declares, so a kind is added in one place and every branch over it is checked. |

### conformance-checked-by-satisfies · SHOULD

A value's conformance to a type is checked with `satisfies`, which keeps its narrow type, never with `as` or a widening annotation.

| Why |
|---|
| `satisfies` catches a missing or wrong field and still lets the compiler know the exact value. |

### derivable-types-derived-inline · SHOULD

A type derivable from an exported parent in one or two indexed accesses is derived where it is used, not exported under a name of its own.

| Why |
|---|
| an exported copy of a derivable type is one more name to keep in sync with its parent. |

### enum-never-declared-const · MUST

An enum is declared `enum`, never `const enum`.

| Why |
|---|
| a tool that compiles one file at a time cannot inline a `const enum` declared in another, so the program breaks under one compiler and runs under the next. |

## Invariants

### invariant-value-is-a-branded-type → invariant-value-is-plain-immutable-data · MUST

A value that keeps an invariant is a branded type — of a primitive, or of a plain object with `readonly` fields, never a class instance — whose functions a `const` object, its companion, holds: `<Name>.is` narrows to it and, where it is an object, `<Name>.equals` compares it, never `===`.

| Why |
|---|
| the value stays plain data every boundary can carry, and one name says at each call what is built and what is asked of it. |

### invariant-value-built-only-by-create → invariant-checked-at-construction · MUST

A value that keeps an invariant is built only by its companion's `create`, which throws the type's error when the invariant fails; no cast, object literal or spread of the type is written outside the companion's file, in specs as in production.

| Why |
|---|
| the brand is then reachable only through the check, while a cast, a literal or a spread elsewhere makes a value, or a changed copy, that no check saw. |

### business-types-readonly → value-immutable-by-default · SHOULD

The fields of a type of the program's business data are `readonly`, its lists `readonly T[]`, and its maps and sets `ReadonlyMap` and `ReadonlySet`.

| Why |
|---|
| the compiler then refuses a mutation the domain never meant, wherever the value travels. |

### received-array-changed-only-by-copying-methods → value-immutable-by-default · SHOULD

An array the code received or shares is changed through the copying methods — `toSorted`, `toReversed`, `toSpliced`, `with` — or a spread, never by `sort`, `reverse`, `splice` or an assignment to an index.

| Why |
|---|
| the mutating methods change the array in place for every holder of it, so a sort for one screen reorders the data another reads. |

## Values from outside

### type-assertion-never-written → narrowing-proves-all-it-claims · MUST

No type assertion is written: no `as` but `as const`, no `<T>value`, and no `!` non-null assertion.

| Why |
|---|
| an assertion claims a type no check proved and the compiler believes it, so the failure surfaces later, far from the line that claimed it. |

### boundary-values-unknown-until-parsed → outside-value-untyped-until-parsed · MUST

A value from outside the program — the result of `JSON.parse` and of `Response.json()`, typed `any`, included — is typed `unknown`, and its plain checks are `typeof`, `in` and `Array.isArray`; a type argument a client's `.json<T>()` takes and `as Promise<T>` are casts.

| Why |
|---|
| the compiler refuses every use of an `unknown` value until a check narrows it. |

## Kinds of value

### undefined-is-the-only-absence → absence-shown-by-the-type · MUST

Absence is `undefined`: `?: T` for what may be absent, `T | undefined` only where a present `undefined` means something, a bare `return;` for no result. `null` appears only where an outside format or an API the code calls uses it — `Object.create(null)`, a signature a library imposes — and is compared only there.

| Why |
|---|
| one spelling of absence means one check everywhere, and a second spelling slips past the check written for the first. |

### absent-optional-field-left-out → absence-shown-by-the-type · MUST

An optional field that is absent is left out of its object, never set to `undefined`.

| Why |
|---|
| `in`, `Object.keys` and a spread all see a field set to `undefined` as present, and a spread of it erases the value it lands on. |

### machine-text-never-formatted-by-intl → machine-text-independent-of-the-locale · MUST

Text written for another program uses no `toLocaleString`, `toLocaleUpperCase`, `toLocaleLowerCase`, `localeCompare` or `Intl` call; a number is written by `String` or `toFixed`, an instant by `toString` of Temporal or `toISOString`.

| Why |
|---|
| these calls read the locale of the process or the browser, so the same value is written differently on each machine. |

### date-and-time-are-temporal-values → instant-is-an-exact-time · MUST

A date, a time, an instant and a time zone are `Temporal` values — `Temporal.Instant`, `PlainDate`, `PlainTime`, `ZonedDateTime`; a `Date` appears only where an API demands one, converted at that call, and no date library but the `Temporal` polyfill is used.

| Why |
|---|
| `Date` mixes an instant with the machine's time zone and mutates in place, which is where date bugs come from; `Temporal` keeps each meaning in its own immutable type. |

### duration-measured-by-performance-now → duration-measured-on-a-monotonic-clock · MUST

A duration the program measures is the difference of two `performance.now()` readings, never of `Date.now()` or `Temporal.Now` values.

| Why |
|---|
| `Date.now()` and `Temporal.Now` read the wall clock, which jumps when the machine's time is corrected, so an elapsed time taken from them can come out negative or hours long; `performance.now()` only moves forward. |

### exact-quantity-counted-in-integer-minor-units → exact-quantity-never-binary-float · MUST

Money and every other exact decimal quantity is a `bigint`, or a `number` that `Number.isSafeInteger` accepts, counting its smallest unit and branded by its unit or currency, or a value of a vetted decimal library; never a `number` with a fraction.

| Why |
|---|
| a JavaScript `number` is binary floating point, where `0.1 + 0.2` is not `0.3`, and past 2^53 it no longer holds every integer, so a total drifts by amounts the books will not. |

### nullish-operators-for-absence → absence-shown-by-the-type · MUST

`??` gives a default and `?.` reaches through an absent value; neither `!value` nor `||` tests or replaces an absent value that is not boolean.

| Why |
|---|
| a negation and a logical or also treat `0` and the empty string as absent, a bug waiting for its input. |

### value-made-text-by-a-named-form · SHOULD

A value becomes text through a form that names it — a formatter, `String` of a primitive, a template of strings — never by `+` with a value that is not a string, nor by an object's default `toString`.

| Why |
|---|
| `'Total: ' + order` prints `[object Object]`, and a number joined to a string is printed in no locale's form. |
