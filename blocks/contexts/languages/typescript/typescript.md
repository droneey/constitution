---
id: typescript
summary: TypeScript's forms of modules, types, errors, effects and packages.
requires: []
extends: null
abstract: false
languages: []
dictionary: [TypeScript, .ts, .tsx, .d.ts, index.ts, main.ts, package.json, JSDoc]
governs: ["**/*.ts", "**/*.tsx", package.json]
---

# TypeScript

> Programs written in TypeScript: their source files and imports, their types, failures and effects, and the `package.json` that declares them. Each rule gives a rule of core, or of a block this one meets, the form it takes in TypeScript.

## Code

### decorator-is-a-standard-decorator · SHOULD
A decorator is a standard ECMAScript decorator; the legacy form behind `experimentalDecorators` appears only where a framework's block requires it.

| Why | Tags |
|---|---|
| the standard form is the one the language keeps and every compiler runs alike, while the legacy form receives other arguments and runs at another time. | [] |

## Names

### identifier-case-by-kind → name-case-by-kind · SHOULD
Types, classes, enums and enum members are PascalCase; functions, variables and instances camelCase; a constant value SCREAMING_SNAKE_CASE, and a constant object or function camelCase. A function a framework renders by the case of its name takes the case that framework's block names.

| Why | Tags |
|---|---|
| the case tells what kind of thing a name is before its declaration is read. | [] |

### type-names-undecorated · SHOULD
A type's name is a noun with no decoration: no `I` prefix, on interfaces too, and no `Type` or `Interface` suffix.

| Why | Tags |
|---|---|
| a decoration repeats what the language already shows and makes every name longer. | [] |

### enum-named-in-the-singular · SHOULD
An enum is named in the singular: `OrderStatus`, not `OrderStatuses`.

| Why | Tags |
|---|---|
| a value of the enum is one member, so `status: OrderStatus` reads as what it holds. | [] |

### type-parameter-starts-with-t · SHOULD
A type parameter is `T`, or a name that starts with `T` and says its role: `TItem`, `TError`.

| Why | Tags |
|---|---|
| the prefix tells a type parameter from a concrete type at every use, and the rest of the name says which is which where there are several. | [] |

## Functions

### parameter-object-has-a-named-type · SHOULD
The object a function takes its values in is typed by a named type — `PlaceOrderInput` — never by an object type written inline in the signature.

| Why | Tags |
|---|---|
| the type names the whole the values make, callers and specs build it by that name, and the signature stays short enough to read at a glance. | [] |

### return-type-no-wider-than-returned · SHOULD
A declared return type is no wider than what the function returns.

| Why | Tags |
|---|---|
| a wider annotation throws away what the compiler knew, and every caller narrows again. | [] |

## Relations

### package-is-an-es-module · MUST
Every package is an ES module: its `package.json` sets `"type": "module"`, and no file uses `require`, `module.exports`, `__dirname`, `import … = require()` or `export =`.

| Why | Tags |
|---|---|
| one module system gives every import one meaning and one resolution in the program, its specs and its tools; CommonJS brings a second loader whose interop changes what an import returns. | [] |

### namespace-never-declares-code · MUST
Code is grouped by modules, never by a `namespace` or `module` block; a `declare namespace` only describes the types of a library or of the runtime.

| Why | Tags |
|---|---|
| a namespace is an older second way to group what a module already groups, and one that holds values compiles to an object no import rule can see into. | [] |

### type-only-import-written-as-import-type · MUST
An import or a re-export used only as a type is written `import type` or `export type`, or marks its name with `type`.

| Why | Tags |
|---|---|
| the line then says it vanishes from the running program, so it never loads a module for its side effects nor closes a cycle at run time. | [] |

### alias-declared-in-package-imports · MUST
Every import alias is declared once, in `imports` of `package.json`, the field the runtime reads; a tool that cannot read `imports` mirrors it word for word, and no configuration declares an alias of its own.

| Why | Tags |
|---|---|
| one declaration is the source and a mirror is checked against it on sight; an alias declared elsewhere drifts unseen. | [] |

### hash-alias-for-the-source-root · MUST
The source root is aliased `#/`: `"#/*": "./src/*"` in `imports`.

| Why | Tags |
|---|---|
| an import from the source root then reads the same in every program, and `#` is the prefix `imports` requires. | [] |

### module-exports-by-name · MUST
A module exports by name, never by `export default`, save where a framework or a tool reads a default export — a configuration file such as `*.config.ts` included — and there a suppression names which.

| Why | Tags |
|---|---|
| a thing then has one name in every import, so a search finds every use and a rename reaches them all. | [] |

### export-never-reassignable → state-never-global-and-mutable · MUST
No module exports a binding declared by `let` or `var`.

| Why | Tags |
|---|---|
| an exported binding that can be reassigned is state every importer shares without seeing who changes it, and it carries over from one spec into the next. | [] |

### overrides-marked-by-keyword → override-marked-where-declared · MUST
A method that overrides one of its base class carries `override`.

| Why | Tags |
|---|---|
| an override then says so where it is declared, and a base method renamed or removed leaves no method that silently overrides nothing. | [] |

## Types

### undefined-is-the-only-absence → absence-shown-by-the-type · MUST
Absence is `undefined`: `?: T` for what may be absent, `T | undefined` only where a present `undefined` means something, a bare `return;` for no result. `null` appears only where an outside format or an API the code calls uses it — `Object.create(null)`, a signature a library imposes — and is compared only there.

| Why | Tags |
|---|---|
| one spelling of absence means one check everywhere, and a second spelling slips past the check written for the first. | [] |

### absent-optional-field-left-out → absence-shown-by-the-type · MUST
An optional field that is absent is left out of its object, never set to `undefined`.

| Why | Tags |
|---|---|
| `in`, `Object.keys` and a spread all see a field set to `undefined` as present, and a spread of it erases the value it lands on. | [] |

### nullish-operators-for-absence · SHOULD
`??` gives a default and `?.` reaches through an absent value; neither `!value` nor `||` tests or replaces an absent value that is not boolean.

| Why | Tags |
|---|---|
| a negation and a logical or also treat `0` and the empty string as absent, a bug waiting for its input. | [] |

### strict-equality-only · MUST
Values are compared strictly — `===` and `!==`, against `null` too; never `==` or `!=`.

| Why | Tags |
|---|---|
| loose equality converts its operands by rules few remember, and hides a second absent value behind the first. | [] |

### any-never-written → unchecked-type-never-used · MUST
`any` is never written — not `: any`, `as any`, `Record<string, any>` or `Promise<any>` — and no parameter is left without a type for the compiler to read as `any`.

| Why | Tags |
|---|---|
| an `any` switches the checks off for whatever it touches and spreads to every value derived from it, so one written in a corner reaches code that never named it. | [] |

### type-assertion-never-written → narrowing-proves-all-it-claims · MUST
No type assertion is written: no `as` but `as const`, no `<T>value`, and no `!` non-null assertion.

| Why | Tags |
|---|---|
| an assertion claims a type no check proved and the compiler believes it, so the failure surfaces later, far from the line that claimed it. | [] |

### boundary-values-unknown-until-parsed → outside-value-untyped-until-parsed · MUST
A value from outside the program — the result of `JSON.parse` included — is typed `unknown`, and its plain checks are `typeof`, `in` and `Array.isArray`; `.json<T>()` and `as Promise<T>` are casts.

| Why | Tags |
|---|---|
| the compiler refuses every use of an `unknown` value until a check narrows it. | [] |

### exhaustive-branching-over-unions → closed-set-branched-exhaustively · MUST
A branch over a union or an enum names every member: a `switch` whose `default` assigns the value to `never`, or an `if` chain that ends in that check.

| Why | Tags |
|---|---|
| a new member then fails to compile at every branch that forgot it. | [] |

### closed-name-set-is-a-string-enum · MUST
A closed set of named values the program owns is a string `enum` — never a union of string literals, nor an `as const` array or object whose type names the set. A union of literals given to a key utility — `Omit<Props, 'onSubmit'>`, `Pick`, `Exclude`, `Extract` — names keys, not a set, and a type that describes another system's data keeps that system's literals.

| Why | Tags |
|---|---|
| the set is then one declaration with one name for each member, which a search, a rename and the compiler follow to every use. | [] |

### outside-number-set-is-a-numeric-enum · MUST
A set of numbers another system defines — exit statuses, HTTP statuses — is a numeric `enum` with every member's value written, and a number that arrives keeps the type `number` until it is compared with the members.

| Why | Tags |
|---|---|
| each number gets the name its system documents, and an arriving number kept as `number` is never taken for a member it may not be. | [] |

### union-discriminant-is-an-enum-member · MUST
The discriminant of a union is a member of the enum that names its kinds — `kind: ShapeKind.Circle`; a string literal only in a type that describes another system's data.

| Why | Tags |
|---|---|
| the union's kinds are then the set the enum declares, so a kind is added in one place and every branch over it is checked. | [] |

### brand-is-a-unique-symbol-key → identifier-branded-by-entity · MUST
A brand is an intersection with a property keyed by the program's one `declare const brand: unique symbol`: `string & { readonly [brand]: 'OrderId' }`.

| Why | Tags |
|---|---|
| one form of brand reads the same in every file, and a symbol key shows in no completion, `keyof` or serialised value, and no object written elsewhere carries it by accident. | [] |

### brand-set-only-where-minted-or-parsed → identifier-branded-by-entity · SHOULD
An identifier's brand is set only where the identifier is minted — its factory — or where it enters the program, in the parse of the outside value that carries it.

| Why | Tags |
|---|---|
| a brand set in one place proves the value came through it; set anywhere, it proves nothing. | [] |

### invariant-value-is-a-branded-type → invariant-value-is-plain-immutable-data · MUST
A value that keeps an invariant is a branded type — of a primitive, or of a plain object with `readonly` fields, never a class instance — built by `create<Name>`, which throws the value's error when the invariant fails, and narrowed by `is<Name>`.

```ts
type Email = string & { readonly [brand]: 'Email' };
const isEmail = (text: string): text is Email => EMAIL.test(text);
const createEmail = (text: string): Email => {
  if (!isEmail(text)) throw new InvalidEmailError(text);
  return text;
};
```

| Why | Tags |
|---|---|
| the brand is reachable only through the check, and the value stays plain data every boundary can carry. | [] |

### semantic-alias-names-a-shared-meaning · SHOULD
A semantic alias — `type ChatTitle = string` — names a meaning found in two or more places, carries no brand, and is used wherever that meaning appears, never the bare type beside it.

| Why | Tags |
|---|---|
| an alias names a meaning the program shares; one for every string turns vocabulary into noise, and a bare type beside an existing alias hides the meaning again. | [] |

### program-type-never-declared-ambient → type-lives-with-its-consumer · SHOULD
A type of the program is exported by a module and imported where it is used, never declared ambient in a global `.d.ts` or `declare global`; an ambient declaration only describes what the runtime or a library provides.

| Why | Tags |
|---|---|
| an imported type shows in every file where its meaning comes from and is held by the import rules like any other; an ambient one reaches every file unseen, a layer that must not know it included. | [] |

### conformance-checked-by-satisfies · SHOULD
A value's conformance to a type is checked with `satisfies`, which keeps its narrow type, never with `as` or a widening annotation.

| Why | Tags |
|---|---|
| `satisfies` catches a missing or wrong field and still lets the compiler know the exact value. | [] |

### derivable-types-derived-inline · SHOULD
A type derivable from an exported parent in one or two indexed accesses is derived where it is used, not exported under a name of its own.

| Why | Tags |
|---|---|
| an exported copy of a derivable type is one more name to keep in sync with its parent. | [] |

### business-types-readonly → value-immutable-by-default · SHOULD
The fields of a type of the program's business data are `readonly`, its lists `readonly T[]`, and its maps and sets `ReadonlyMap` and `ReadonlySet`.

| Why | Tags |
|---|---|
| the compiler then refuses a mutation the domain never meant, wherever the value travels. | [] |

### received-array-changed-only-by-copying-methods → value-immutable-by-default · SHOULD
An array the code received or shares is changed through the copying methods — `toSorted`, `toReversed`, `toSpliced`, `with` — or a spread, never by `sort`, `reverse`, `splice` or an assignment to an index.

| Why | Tags |
|---|---|
| the mutating methods change the array in place for every holder of it, so a sort for one screen reorders the data another reads. | [] |

### type-parameter-appears-twice · SHOULD
A type parameter appears at least twice in its signature; one that appears once is its constraint written out.

| Why | Tags |
|---|---|
| a parameter used once relates nothing, and only lets a caller claim a type the function never checks. | [] |

### value-made-text-by-a-named-form · SHOULD
A value becomes text through a form that names it — a formatter, `String` of a primitive, a template of strings — never by `+` with a value that is not a string, nor by an object's default `toString`.

| Why | Tags |
|---|---|
| `'Total: ' + order` prints `[object Object]`, and a number joined to a string is printed in no locale's form. | [] |

### date-and-time-are-temporal-values → instant-is-an-exact-time · MUST
A date, a time, an instant and a time zone are `Temporal` values — `Temporal.Instant`, `PlainDate`, `PlainTime`, `ZonedDateTime`; a `Date` appears only where an API demands one, converted at that call, and no date library but the `Temporal` polyfill is used.

| Why | Tags |
|---|---|
| `Date` mixes an instant with the machine's time zone and mutates in place, which is where date bugs come from; `Temporal` keeps each meaning in its own immutable type. | [data] |

### duration-measured-by-performance-now → duration-measured-on-a-monotonic-clock · MUST
A duration the program measures is the difference of two `performance.now()` readings, never of `Date.now()` or `Temporal.Now` values.

| Why | Tags |
|---|---|
| `Date.now()` and `Temporal.Now` read the wall clock, which jumps when the machine's time is corrected, so an elapsed time taken from them can come out negative or hours long; `performance.now()` only moves forward. | [] |

### exact-quantity-counted-in-integer-minor-units → exact-quantity-never-binary-float · MUST
Money and every other exact decimal quantity is a `bigint`, or a `number` that `Number.isSafeInteger` accepts, counting its smallest unit and branded by its unit or currency, or a value of a vetted decimal library; never a `number` with a fraction.

| Why | Tags |
|---|---|
| a JavaScript `number` is binary floating point, where `0.1 + 0.2` is not `0.3`, and past 2^53 it no longer holds every integer, so a total drifts by amounts the books will not. | [data] |

## Errors

### mapped-error-passes-its-cause → error-keeps-its-cause · MUST
An error that maps another passes it in the `cause` option of its constructor — `new OrderNotFoundError(message, { cause })` — and an error class hands that option on to `super`.

| Why | Tags |
|---|---|
| the standard `cause` is the one runtimes, loggers and debuggers print in the chain, so the original failure stays visible under the one that replaced it. | [] |

### caught-value-recognised-before-use → catch-handles-only-what-it-recognises · MUST
A `catch` reads its value, typed `unknown`, only after `instanceof` or the error library's guard has recognised it.

| Why | Tags |
|---|---|
| anything can be thrown, by the program's dependencies too, so a caught value read as an `Error` without a check fails a second time inside the handler meant for the first. | [] |

### return-awaited-inside-try → catch-handles-only-what-it-recognises · MUST
Inside a `try`, a returned promise is awaited — `return await` — so its rejection reaches the `catch`.

| Why | Tags |
|---|---|
| without the `await`, the function has returned before the promise rejects, so its `catch` never runs and the raw failure passes unmapped. | [errors] |

### finally-never-leaves-by-a-jump → catch-handles-only-what-it-recognises · MUST
A `finally` block never leaves by `return`, `break`, `continue` or `throw`.

| Why | Tags |
|---|---|
| a jump out of `finally` replaces the failure in flight, so the error vanishes without any `catch` having recognised it. | [errors] |

## Effects

### cancellation-by-abort-signal → outside-call-can-be-cancelled · SHOULD
An operation that can be cancelled takes an `AbortSignal` in its options object and hands it to every call across a process boundary it makes.

| Why | Tags |
|---|---|
| one signal from the caller stops all the work below it, and every API of the platform takes one. | [] |

### outside-call-timed-out-by-abort-signal → outside-call-has-a-timeout · MUST
A call across a process boundary is given `AbortSignal.timeout(ms)`, joined to its caller's signal by `AbortSignal.any` where it has one.

| Why | Tags |
|---|---|
| that signal is the timeout every API of the platform takes, and joining it to the caller's keeps one way to stop a call, whether the time ran out or the caller gave up. | [] |

### scoped-resource-held-by-using → resource-released-on-every-path · MUST
A resource whose life is one scope — a file handle, a lock, a temporary folder, a connection for one task — is held by `using` or `await using`.

| Why | Tags |
|---|---|
| the resource is then released at the end of its scope on every way out, a thrown failure included, where a `finally` is forgotten on the next path added. | [] |

## Security

### code-never-run-from-a-string → outside-input-reaches-interpreters-as-parameters · MUST
No code is run from a string: no `eval`, no `new Function`, and no `setTimeout` or `setInterval` given a string.

| Why | Tags |
|---|---|
| a string run as code runs whatever reaches it, so one piece of outside input inside it becomes the attacker's program, with every right the program has. | [security] |

### outside-keyed-collection-is-a-map · MUST
A collection keyed by values from outside the program is a `Map`, or an object made by `Object.create(null)`; outside input is never merged into a plain object by its own keys.

| Why | Tags |
|---|---|
| a key such as `__proto__` or `constructor` written into a plain object changes the prototype every object shares, and with it the checks and defaults of the whole program. | [security] |

### guarding-random-value-from-web-crypto → security-primitive-from-a-vetted-library · MUST
A token, a nonce or an identifier that guards access comes from `crypto.getRandomValues` or `crypto.randomUUID`, never from `Math.random`.

| Why | Tags |
|---|---|
| `Math.random` can be predicted from a few of its outputs, so a value drawn from it is guessed by whoever saw others; Web Crypto is a cryptographic source in every runtime. | [security] |

## Dependencies

### exports-map-each-entry → dependency-reached-through-its-public-entry · MUST
The `package.json` of a package others import maps each of its entries in `exports`, so no path outside those entries can be imported.

| Why | Tags |
|---|---|
| a path `exports` does not map cannot be imported, so the entries listed are the whole of what a consumer can couple to. | [] |

### tools-pinned-in-dev-dependencies → tool-pinned-exactly-by-the-repository · MUST
Every tool is a `devDependencies` entry of `package.json` at an exact version, with no range; a unit of the repository itself, linked from its working tree, is no such tool.

| Why | Tags |
|---|---|
| `devDependencies` install with the repository and never with the package, and an exact version lets no lockfile update move a tool without a change to the manifest. | [] |

### stateful-package-resolved-once · SHOULD
A package that holds state or types across the program — the schema library, the user-interface framework — resolves to one version in the lockfile.

| Why | Tags |
|---|---|
| two copies of such a package split its state, and its types stop matching across the split. | [] |

### temporal-polyfill-loaded-by-the-entry · MUST
A runtime the program supports that lacks `Temporal` gets its polyfill once, imported by the entry file before any code reads a date.

| Why | Tags |
|---|---|
| every module then finds the one `Temporal`, and no date is read before it exists or through a second copy. | [] |

## Tools

### type-error-suppressed-by-ts-expect-error → suppression-states-its-reason · MUST
A type error kept on purpose is silenced by `@ts-expect-error` with its reason on the same line, never by `@ts-ignore` or `@ts-nocheck`.

| Why | Tags |
|---|---|
| `@ts-expect-error` fails once the error it silences is gone, so it never outlives its reason, while `@ts-ignore` silences whatever error later lands on its line and `@ts-nocheck` a whole file. | [] |

## Layout

### typescript-file-forms → file-name-in-its-owners-case · MUST
A source file is a kebab-case `.ts` or `.tsx` file.

| Why | Tags |
|---|---|
| one spelling of every kind of file lets the reader find a file by its name. | [] |

### file-named-after-its-export → file-is-one-semantic-unit · MUST
A file with one export is named after it — `order-status.ts` exports `OrderStatus` — and a file with several exports after the unit they form.

| Why | Tags |
|---|---|
| a reader who knows the name of a thing knows the name of its file. | [] |

### tsx-only-where-markup-is-written · MUST
A file is `.tsx` only where it writes markup.

| Why | Tags |
|---|---|
| the extension then says which files render, and a plain module is never parsed for markup. | [] |

### test-folder-files-in-test-forms → file-named-for-its-kind · MUST
A `.ts` or `.tsx` file in `__tests__/` or `tests/` is a `.test`, `.<kind>.test`, `.fake` or `.fixtures` file.

| Why | Tags |
|---|---|
| a spec named otherwise would never run, and a helper named like a spec would run as one. | [testing] |

## Comments

### export-documented-by-jsdoc → export-documented-only-where-not-obvious · SHOULD
An export's documentation is a `/** … */` block on its declaration that states no type: no `{string}` after `@param`, no `@returns {T}`.

| Why | Tags |
|---|---|
| the editor shows that block wherever the export is used, and a type written in it repeats the signature and drifts from it. | [] |

### deprecated-by-jsdoc-tag → retired-code-marked-deprecated · SHOULD
Code kept only for its old callers carries a JSDoc `@deprecated` tag that names its replacement.

| Why | Tags |
|---|---|
| the tag travels with the declaration, so every use of it is marked where it is written, not only where it is declared. | [] |

## Tests

### exported-type-proven-by-type-cases · SHOULD
The exported generic and conditional types of a package others import are proven by type cases the compiler checks.

| Why | Tags |
|---|---|
| a consumer relies on what such a type computes, and nothing else fails when a change computes something else. | [testing] |
