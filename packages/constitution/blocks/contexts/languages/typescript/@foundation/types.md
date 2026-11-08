# Types

> Governs how TypeScript types the program: equality, enums, brands and shapes, invariant values, assertions and values from outside, absence and its operators, the values of time and money, and how a value becomes text.

## Vocabulary

A type's **companion** is the `const` object of the type's name, declared in the type's file, that holds the type's functions.

A **brand** is a property that a type carries and no value holds at run time, which sets the type apart from every other type of its shape; a type that carries one is branded.

Absence is spelled **`undefined`**{#absent}, and a value with an invariant is built by its companion's **`<Type>.create`**{#checked-constructor}.

## General

### equality-never-loose · MUST

No comparison is loose. No `==` or `!=` is written, against `null` too.

| Why |
|---|
| loose equality converts its operands by rules few remember, and hides a second absent value behind the first. |

## Modelling

### exhaustive-branching-over-unions → closed-set-branched-exhaustively · MUST

In a typed file, every branch over a closed set, an `enum` or a union's kinds, is one the compiler proves exhaustive. A `switch` that returns from every case of a function whose return type is declared has no `default`; any other branch is a `switch` whose `default` assigns the value to `never`, or an `if` chain that ends in that check.

| Why |
|---|
| a branch without the check to `never` takes a new member silently into no case, and nothing shows the branches that must decide on it; a `default` beside the compiler's proof is a line no member reaches, which no spec can cover. |

### outside-number-set-is-a-numeric-enum → outside-vocabulary-reached-through-a-total-table · MUST

In a typed file, every set of numbers another party defines is a numeric `enum` whose members key its total table. Such sets include exit statuses and HTTP statuses.

| Why |
|---|
| a bare number does not say which of its party's meanings it carries, and a table keyed by the `enum` is one the compiler proves total. |

### numeric-enum-member-written-with-its-number → outside-code-written-out-on-its-member · MUST

In a typed file, every member of a numeric `enum` of another party's numbers has its number written. No member takes the number the compiler counts on from the member before it.

| Why |
|---|
| a member left without its number takes the one after its neighbour's, so a member added or moved in the list stands for a code its party gives another meaning, and the compiler passes it. |

### brand-is-a-unique-symbol-key · MUST

Every branded type is an intersection with a property keyed by the program's one `declare const brand: unique symbol`, as in `string & { readonly [brand]: '<Name>' }`.

| Why |
|---|
| brands written in several forms read differently in each file, and a brand keyed by a name any object literal can spell is carried by accident by an object that spells it; a unique symbol is spelled by no literal elsewhere, and never exists at run time. |

### program-type-never-declared-ambient → type-has-one-home · MUST

No type of the program is declared ambient. It is exported by a module and imported where it is used, never declared in a global `.d.ts` or `declare global`; an ambient declaration only describes what the runtime or a library provides.

| Why |
|---|
| an ambient type reaches every file unseen, a layer that must not know it included, where no import shows where its meaning comes from and no import rule can hold it. |

### outside-type-derived-from-its-source → type-has-one-home · MUST

Every type of a library's parameter or result is taken from the library, never typed again. One the library exports is imported, and one it does not is derived by `Parameters` or `ReturnType` from the function that takes or returns it.

| Why |
|---|
| a library's type typed again goes on compiling when the library changes its own, and the mismatch shows only at run time. |

### closed-name-set-is-a-string-enum → closed-set-declared-as-one-enumeration · MUST

In a typed file, every closed set of named values the program owns is a string `enum`. It is never a union of string literals, nor an `as const` array or object whose type names the set. Exempt: a union of literals given to a key utility, such as `Omit`, `Pick`, `Exclude` or `Extract`, which names keys, not a set; a type that describes another party's data, which keeps that party's literals; and an enum subset, which `enum-subset-listed-by-its-members` gives.

| Why |
|---|
| a union of literals names no member, so each use repeats the literal and a rename misses some, and an `as const` object needs a second declaration for its type; a string `enum` is TypeScript's one declaration that names each member and holds its value at run time. |

### enum-subset-listed-by-its-members → value-subset-named-beside-its-set · MUST

In a typed file, every enum subset the program lists is an `as const` array of the enum's members. A subset it only types is a union of the members.

| Why |
|---|
| a subset written in other literals, or as an array the compiler widens, loses the members' names and types, so a member renamed in the enum is missed in the subset. |

### enum-subset-type-derived-from-its-list → declared-values-never-typed-again · MUST

In a typed file, every listed enum subset's type is derived from its list, never written again as a union. It is `(typeof <list>)[number]`.

| Why |
|---|
| a subset typed apart from its list is a second copy of it, so a member added to one is missing from the other — a single source of truth. |

### union-discriminant-is-an-enum-member → closed-name-reached-by-its-name · SHOULD

In a typed file, every union's discriminant is a member of the enum that names its kinds. Exempt: a type that describes another party's data, whose discriminant is that party's literal.

| Why |
|---|
| a discriminant written as a literal repeats the kind at every member and every branch, so a kind renamed or added is changed in some places and missed in others, and no branch is checked against the set of kinds. |

### conformance-checked-by-satisfies · SHOULD

In a typed file, every value's conformance to a type is checked with `satisfies`, never by a widening annotation. It keeps the value's narrow type.

| Why |
|---|
| a widening annotation throws away the exact value the compiler knew, so later code narrows it again. |

### shape-composed-of-small-shapes · SHOULD

Every shared shape is composed of small named shapes, never cut out of a large type by omitting or picking its fields. Such shapes include an identifier, timestamps and a page of results.

| Why |
|---|
| a shape cut from a large one changes whenever the large one does, and hides which fields its consumer needs. |

### enum-never-declared-const · MUST

No enum is declared `const enum`.

| Why |
|---|
| a tool that compiles one file at a time cannot inline a `const enum` declared in another, so the program breaks under one compiler and runs under the next. |

### entity-value-or-event-typed-readonly → value-immutable-by-default · MUST

In a typed file, every type of an entity, a value equal by its data or an event is read-only. Its fields are `readonly`, its lists `readonly T[]`, and its maps and sets `ReadonlyMap` and `ReadonlySet`.

| Why |
|---|
| a mutable field lets any holder change the value under every other holder, and the compiler lets a mutation the domain never meant pass wherever the value travels. |

### array-with-another-holder-changed-only-by-copying-methods → value-immutable-by-default · MUST

Every array with another holder, one the code received or handed on, is changed only by copying it. It is changed through the copying methods, such as `toSorted`, `toReversed`, `toSpliced` and `with`, or a spread, never by `sort`, `reverse`, `splice` or an assignment to an index.

| Why |
|---|
| the mutating methods change the array in place for every holder of it, so a sort for one screen reorders the data another reads. |

## Type checking

### any-never-written → unchecked-type-never-used · MUST

In a typed file, no code spells `any` or leaves the compiler to infer it. No annotation, assertion or type argument spells it, such as `: any`, `as any`, `Record<string, any>` or `Promise<any>`, and no parameter is left without a type for the compiler to read as `any`.

| Why |
|---|
| an `any` switches the checks off for whatever it touches and spreads to every value derived from it, so one written in a corner reaches code that never named it. |

### type-assertion-never-written → narrowing-proves-all-it-claims · MUST

No type assertion is written: no `as`, no `<T>value` and no `!` non-null assertion. A type that a check proves and the compiler cannot infer, a brand's among them, is given by a type predicate or an assertion function that runs that check. Exempt: `as const`, which narrows a literal to what it spells.

| Why |
|---|
| an assertion claims a type no check proved and the compiler believes it, so the failure surfaces later, far from the line that claimed it, while a type predicate ties the claim to the check that makes it. |

## Invariants

### invariant-value-is-a-branded-type → invariant-checked-at-construction · MUST

In a typed file, every value with an invariant that is equal by its data is a branded type.

| Why |
|---|
| a type without its brand takes any value of its shape for one that kept the invariant, so a value no check saw passes wherever the checked one is expected. |

### invariant-value-is-plain-readonly-data → invariant-value-is-plain-immutable-data · MUST

In a typed file, every value with an invariant that is equal by its data is plain data, never a class instance. It is a primitive or a plain object with `readonly` fields.

| Why |
|---|
| a class instance loses its methods when it crosses a boundary that carries plain data, and a field that is not `readonly` lets any holder break the invariant after its check. |

### invariant-value-compared-by-equals → invariant-value-compared-by-its-data · MUST

Every object with an invariant that is equal by its data is compared by its companion's `equals`, never by `===`.

| Why |
|---|
| `===` compares two objects by their identity, so two equal values count as two and a check of equality misses the one it already holds. |

### invariant-value-built-only-by-create → invariant-checked-at-construction · MUST

In a typed file, no object literal or spread of a type with an invariant is written outside its checked constructor. This holds in specs as in production. Exempt: a value with a starting transition, built only by that transition, its rebuild from storage and the functions that change it.

| Why |
|---|
| the compiler takes a spread of a branded value for the brand, so a literal or a spread outside the constructor makes a value, or a changed copy, that no check saw, and the brand then vouches for an invariant nobody proved — parse, don't validate. |

### checked-constructor-throws-on-a-failed-invariant · MUST

Every checked constructor throws when the invariant fails. It never returns a value in place of the one it builds.

| Why |
|---|
| a constructor that answers a failed check with a value hands its caller something that looks built, so the failure passes on as data. |

## Values from outside

### outside-value-unknown-until-parsed → outside-value-untyped-until-parsed · MUST

In a typed file, every value from outside the program is typed `unknown` until it is parsed. This holds for what the runtime's built-in parsers return typed `any` too, such as a response's `.json()`. The plain checks that narrow such a value include `typeof`, `in` and `Array.isArray`.

| Why |
|---|
| a value typed anything but `unknown` can be used before any check narrows it, so a shape the data never had reaches code that trusts it — parse, don't validate. |

## Kinds of value

### undefined-is-the-only-absence → absence-spelled-by-one-value · MUST

Every absent value is spelled `undefined`, never `null`. Exempt: a `null` that an outside format or an API the code calls uses, such as `Object.create(null)` or a signature a library imposes, and its comparison there.

| Why |
|---|
| one spelling of absence means one check everywhere, and a second spelling slips past the check written for the first. |

### empty-return-written-bare · MUST

Every `return` of `undefined` is a bare `return;`, never `return undefined`.

| Why |
|---|
| a `return undefined` is a second spelling of the bare `return;`, so its reader looks for a difference between the two that is not there. |

### optional-marked-by-a-question-mark → absence-shown-by-the-type · MUST

In a typed file, every field or parameter that may be left out is marked `?:`. A type is `T | undefined` only where a present `undefined` means something.

| Why |
|---|
| a type that spells a field that may be left out as one always present, holding `undefined`, says nothing of which the code may meet, so a check is written for the wrong one. |

### absent-optional-field-left-out → absence-spelled-by-one-value · MUST

Every optional field that is absent is left out of its object, never set to `undefined`.

| Why |
|---|
| `in`, `Object.keys` and a spread all see a field set to `undefined` as present, and a spread of it erases the value it lands on. |

### time-held-as-a-temporal-value → instant-never-a-date-or-a-wall-time · MUST

Every date, time of day, wall time, instant and zoned time is a `Temporal` value, never a `Date`. Such values include `Temporal.PlainDate`, `PlainTime`, `PlainDateTime`, `Instant` and `ZonedDateTime`. Exempt: a `Date` an API demands, converted at that call.

| Why |
|---|
| `Date` mixes an instant with the machine's time zone and mutates in place, which is where date bugs come from; `Temporal` keeps each meaning in its own immutable type. |

### duration-measured-by-performance-now → duration-measured-on-a-monotonic-clock · MUST

Every duration the program measures is the difference of two `performance.now()` readings, never of `Date.now()` or `Temporal.Now` values.

| Why |
|---|
| `Date.now()` and `Temporal.Now` read the wall clock, which jumps when the machine's time is corrected, so an elapsed time taken from them can come out negative or hours long; `performance.now()` only moves forward. |

### exact-quantity-never-a-fractional-number → exact-quantity-never-binary-float · MUST

No exact quantity is a `number` with a fraction. Money and every other exact quantity holds its amount as a `bigint`, a `number` that `Number.isSafeInteger` accepts counting its smallest unit, or a value of a vetted decimal library.

| Why |
|---|
| a JavaScript `number` is binary floating point, where `0.1 + 0.2` is not `0.3`, and past 2^53 it no longer holds every integer, so a total drifts from the sum of its amounts and the books no longer balance. |

### exact-quantity-branded-by-its-unit → exact-quantity-carries-its-unit-in-its-type · MUST

In a typed file, every exact quantity held as a `bigint` or a `number` is branded by its unit. That unit is its currency or its unit of measure. Exempt: an amount kept in a value object beside its unit.

| Why |
|---|
| a bare `bigint` of cents is added to one of another currency, or to a count of grams, and the compiler passes the sum. |

### nullish-operators-for-absence → absence-spelled-by-one-value · MUST

Wherever a default replaces an absent value, it is given by `??`, and a chain through an absent value is written `?.`. No `!` or `||` tests or replaces an absent value whose present value is no boolean.

| Why |
|---|
| a negation and a logical or also treat `0` and the empty string as absent, a bug waiting for its input. |

### value-made-text-by-a-named-form · MUST

Every value becomes text through a form that names it. The form is a formatter, `String` of a primitive or a template of strings, never `+` with a value that is not a string, nor an object's default `toString`.

| Why |
|---|
| an object joined to a string prints `[object Object]`, and a number joined to a string is printed in no locale's form. |
