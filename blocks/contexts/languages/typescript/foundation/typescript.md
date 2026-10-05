# TypeScript

## Modules and files

## alias-declared-in-package-imports · MUST
An import alias, where the program has one, is declared once, in `imports` of `package.json`, the source the runtime reads. A tool that cannot read `imports` repeats it word for word, and no configuration declares an alias of its own.

| Why | Check | Tags |
|---|---|---|
| one declaration is the source and a mirror is checked against it on sight; an alias declared elsewhere drifts unseen. | review | [] |

## file-named-after-its-export · SHOULD
A file with one export is named after it — `order-status.ts` exports `OrderStatus`; a file with several exports names the unit they form.

| Why | Check | Tags |
|---|---|---|
| a reader who knows the name of a thing knows the name of its file. | review | [] |

## typescript-file-forms → kebab-case-file-names
Source files are kebab-case `.ts` or `.tsx`.

| Why | Check | Tags |
|---|---|---|
| one spelling of every kind of file lets the tools and the reader find a file by its name. | tool/names | [] |

## tsx-only-where-markup-is-written → typescript-file-forms
A file is `.tsx` only where it writes markup.

| Why | Check | Tags |
|---|---|---|
| the extension then says which files render, and a plain module is never parsed for markup. | review | [] |

## Names

## identifier-case-by-kind · SHOULD
PascalCase for types, classes, enums and their members; camelCase for functions, variables and instances; SCREAMING_SNAKE_CASE for a constant value, camelCase for a constant object or function. An enum is named in the singular.

| Why | Check | Tags |
|---|---|---|
| the case tells what kind of thing a name is before its declaration is read. | review | [] |

## names-in-the-case-of-their-kind → identifier-case-by-kind
Types, classes, interfaces and enums are in PascalCase, a type parameter is `T` or starts with it, and no name is in snake_case.

| Why | Check | Tags |
|---|---|---|
| the case tells what kind of thing a name is before its declaration is read. | tool/lint | [] |

## type-names-undecorated · SHOULD
A type is a noun, undecorated: no `I` prefix, on interfaces too, and no `Type` or `Interface` suffix.

| Why | Check | Tags |
|---|---|---|
| a decoration repeats what the language already shows and makes every name longer. | tool/lint | [] |

## Values and types

## undefined-is-the-only-absence → absence-has-one-value
Code spells absence as `undefined`: `?: T` for what may be absent, `T | undefined` only where an explicit `undefined` means something, `return;` for no result. An optional field that is absent is left out, never set to `undefined`. `null` appears only in a comparison with what a platform API returns, in the type of an external format that uses it, and where an API's types demand it — the language's `Object.create(null)`, a signature a library imposes.

| Why | Check | Tags |
|---|---|---|
| one spelling of absence means one check, and an optional field is then present or missing, never set to `undefined` by accident. | tool/lint | [] |

## brand-is-an-intersection-or-unique-symbol → identifiers-branded-by-entity
A brand is `string & { readonly __brand: 'OrderId' }` or a unique symbol.

| Why | Check | Tags |
|---|---|---|
| one form of brand reads the same in every file. | review | [] |

## invariant-value-is-a-branded-type → invariant-values-are-plain-immutable-data
A value that keeps an invariant is a branded type — of a primitive, or of a plain object with `readonly` fields, never a class instance — built by `create<Name>`, which throws the kit's error when the invariant fails, and narrowed by `is<Name>`.

```ts
type Email = string & { readonly __brand: 'Email' };
const isEmail = (text: string): text is Email => EMAIL.test(text);
const createEmail = (text: string): Email => {
  if (!isEmail(text)) throw new InvalidEmailError(text);
  return text;
};
```

| Why | Check | Tags |
|---|---|---|
| the brand is reachable only through the check, and the value stays a plain string every boundary can carry. | review | [] |

## semantic-alias-names-a-shared-meaning · SHOULD
A semantic alias — `type ChatTitle = string` — names a meaning without an invariant and is never branded; it is declared only when the code uses it, for a meaning found in two or more places, never for a string that is just a string. Where an alias exists, code uses it, not the bare type.

| Why | Check | Tags |
|---|---|---|
| an alias names a meaning the program shares; one per string turns vocabulary into noise, and a bare type beside an existing alias hides the meaning again. | review | [] |

## enums-for-named-value-groups · MUST
A closed set of named values is a string `enum` — never a union of string literals, and never an `as const` array or object whose type names the set. Numbers another system defines — exit statuses, HTTP statuses — are a numeric `enum` with every value written, and an incoming number stays `number`, compared with the members. `as const` is for a single literal and for data that is not a set of names. A union's discriminant is an enum member when the enum owns the vocabulary, and a string literal otherwise. A union of literals given to a key utility — `Omit<Props, 'onSubmit' | 'disabled'>`, `Pick`, `Exclude`, `Extract` — names keys, not a set, and a type that describes another system's data keeps that system's literals.

| Why | Check | Tags |
|---|---|---|
| an enum is one declaration of a closed set that the compiler checks everywhere it is used. | tool/lint | [] |

## strict-equality-only · MUST
Comparisons are strict — `===` and `!==`, with `null` too; never `==`.

| Why | Check | Tags |
|---|---|---|
| loose equality converts its operands by rules few remember, and hides a second absent value behind the first. | tool/lint | [] |

## nullish-operators-for-absence · SHOULD
`??` gives a default and `?.` reaches through an absent value; `!value` is never a check for absence on a value that is not boolean.

| Why | Check | Tags |
|---|---|---|
| `!value` also treats `0` and the empty string as absent, which is a bug waiting for its input. | review | [] |

## nullish-default-over-or → nullish-operators-for-absence
A default for an absent value is given with `??`, not `||`.

| Why | Check | Tags |
|---|---|---|
| a logical or also replaces `0`, an empty string and `false`, which are values, not absence. | tool/lint | [] |

## no-any → no-any-type
No `any`: not `: any`, `as any`, `Record<string, any>` or `Promise<any>`, and no parameter left without a type for the compiler to read as `any`.

| Why | Check | Tags |
|---|---|---|
| these are the places `any` is written, and a parameter without a type is an `any` nobody wrote. | tool/lint | [] |

## no-unchecked-escape-hatches → suppression-states-its-reason
No `as` cast except `as const`, no `!` non-null assertion, no `@ts-ignore` or `@ts-nocheck`. `@ts-expect-error` and any other exception carry a suppression that states why.

| Why | Check | Tags |
|---|---|---|
| each escape hatch is a place where the code tells the compiler it knows better; without a reason nobody can check whether it still does. | review | [] |

## overrides-marked-by-keyword → override-marked-where-declared
A method that overrides one of its base class carries `override`.

| Why | Check | Tags |
|---|---|---|
| an override then says so where it is declared, and a base method renamed or removed leaves no method that silently overrides nothing. | tool/types | [] |

## casts-and-assertions-refused → no-unchecked-escape-hatches
No `as` cast except `as const`, no `!` non-null assertion and no `@ts-ignore`.

| Why | Check | Tags |
|---|---|---|
| each is a place where the code tells the compiler it knows better. | tool/lint | [] |

## boundary-values-unknown-until-parsed → outside-values-untyped-until-parsed
A value from outside the program — `JSON.parse`'s result included — is `unknown`, and its plain checks are `typeof`, `in` and `Array.isArray`; `.json<T>()` and `as Promise<T>` are casts.

| Why | Check | Tags |
|---|---|---|
| the compiler refuses every use of an `unknown` value until a check narrows it. | review | [] |

## exhaustive-branching-over-unions → illegal-states-unrepresentable
A branch over a union handles every member: a `switch` whose default proves `never`, or an `if` chain that ends in a `never` check.

| Why | Check | Tags |
|---|---|---|
| a new member then fails to compile at every branch that forgot it. | review | [] |

## switch-over-union-exhaustive → exhaustive-branching-over-unions
A `switch` over a union of literals handles every member.

| Why | Check | Tags |
|---|---|---|
| a member added later then fails the check at every switch that misses it. | tool/lint | [] |

**Example:**
```ts
type Payment = { status: 'pending' } | { status: 'paid'; at: Temporal.Instant } | { status: 'failed'; reason: string };

const label = (payment: Payment): string => {
  switch (payment.status) {
    case 'pending': return 'Waiting';
    case 'paid': return `Paid ${payment.at.toString()}`;
    case 'failed': return payment.reason;
    default: {
      const unreachable: never = payment;
      return unreachable;
    }
  }
};
```

## satisfies-to-check-conformance · SHOULD
Conformance to a type is checked with `satisfies`, which keeps the narrow type, not with `as` or a widening annotation.

| Why | Check | Tags |
|---|---|---|
| `satisfies` catches a missing or wrong field and still lets the compiler know the exact value. | review | [] |

## derivable-types-derived-inline · SHOULD
A type derivable from an exported parent in one or two indexed accesses is derived where it is used, not exported under a name of its own.

| Why | Check | Tags |
|---|---|---|
| an exported copy of a derivable type is one more name to keep in sync with its parent. | review | [] |

## business-types-readonly → immutable-by-default
The fields of a type of the program's business data are `readonly`, its lists `readonly T[]` and its maps `ReadonlyMap`.

| Why | Check | Tags |
|---|---|---|
| the compiler then refuses a mutation the domain never meant. | review | [] |

## no-mutable-export → immutable-by-default
No module declares an export with `export let` or `export var`.

| Why | Check | Tags |
|---|---|---|
| an exported binding that is reassigned is state every importer shares without seeing who changes it, and it leaks from one spec into the next. | tool/lint | [] |

## type-parameter-appears-twice · SHOULD
A type parameter appears at least twice in its signature; one that appears once is its constraint written out.

| Why | Check | Tags |
|---|---|---|
| a parameter used once relates nothing, and only lets a caller claim a type the function never checks. | review | [] |

## text-made-deliberately · SHOULD
A value becomes text through a function that names its form — a formatter, `String` of a primitive, a template of strings — never by `+` with a value that is not a string, or by an object's default `toString`.

| Why | Check | Tags |
|---|---|---|
| `'Total: ' + order` prints `[object Object]`, and a number joined to a string is printed in no locale's form. | review | [] |

## dates-through-temporal → instants-carry-their-zone
A date, a time, a duration or a time zone is a `Temporal` value; a `Date` appears only where an API demands one, converted at that call; no date library is used. A runtime the program supports that lacks `Temporal` loads its polyfill once, in the entry file, before any code reads a date.

| Why | Check | Tags |
|---|---|---|
| `Date` mixes an instant with the machine's time zone and mutates in place, which is where date bugs come from; `Temporal` keeps each meaning in its own immutable type. | review | [data] |

## no-date-library → dates-through-temporal
No module imports a date library, one that wraps `Date`, or a path inside one.

| Why | Check | Tags |
|---|---|---|
| a date library wraps the `Date` that `Temporal` replaces. | tool/lint | [] |

## no-object-joined-into-text → text-made-deliberately
No object reaches text through its default `toString`, by `+` or in a template, and `+` never mixes a `bigint` with a `number`.

| Why | Check | Tags |
|---|---|---|
| these are the joins that print `[object Object]` or throw at run time, which the linter can see from the types. | tool/lint | [] |

## return-type-no-wider-than-returned · SHOULD
A declared return type is no wider than what the function returns.

| Why | Check | Tags |
|---|---|---|
| a wider annotation throws away what the compiler knew, and every caller narrows again. | review | [] |

## return-union-lists-only-returned-members → return-type-no-wider-than-returned
A union or literal a function declares as its return type lists no member, `undefined` aside, that the function never returns.

| Why | Check | Tags |
|---|---|---|
| a member never returned is a case every caller handles for nothing, and the linter sees it from the returns. | tool/lint | [] |

## no-literal-thrown → only-errors-thrown
No literal, template or object literal is thrown.

| Why | Check | Tags |
|---|---|---|
| these are the thrown non-errors the linter can see without types; a variable holding one is left to review. | tool/lint | [] |

## return-awaited-inside-try → errors-surfaced-never-swallowed
Inside a `try`, a returned promise is awaited — `return await` — so its rejection reaches the `catch`.

| Why | Check | Tags |
|---|---|---|
| without the `await`, the function has returned before the promise rejects, so its `catch` never runs and the raw failure passes unmapped. | review | [errors] |

## named-exports-only · MUST
A module exports by name. A default export appears only in a configuration file a tool reads — `*.config.*`, `.*rc.*` — or where a framework or a tool reads one, and then its suppression, or the tool's part of the presets, says which.

| Why | Check | Tags |
|---|---|---|
| one name for one thing in every import, so a rename reaches every place it is used. | tool/lint | [] |

## cancellation-by-abort-signal → io-has-timeout-and-cancellation
An operation that can be cancelled takes an `AbortSignal` in its options object and hands it to every I/O call it makes.

| Why | Check | Tags |
|---|---|---|
| one signal from the caller stops all the work below it, and every API of the platform takes one. | review | [] |

## resources-released-by-using → resources-released-on-every-path
A resource that must be released — a file handle, a lock, a subscription, a temporary folder — is held by `using` or `await using`, so it is released on every path.

| Why | Check | Tags |
|---|---|---|
| a `finally` is forgotten on the next path added; `using` releases at the end of the scope whatever the path. | review | [] |

## disposable-held-by-using → resources-released-by-using
A value whose type implements `Disposable` or `AsyncDisposable` is declared with `using` or `await using`.

| Why | Check | Tags |
|---|---|---|
| the type says the value must be released, so the lint can hold it; a reader or a handle whose type says nothing stays with review. | tool/lint | [] |

## options-object-has-a-named-type → at-most-three-positional-arguments
An object of values that travel together is typed by a named type, never by an object type written inline in the signature.

| Why | Check | Tags |
|---|---|---|
| the type names the whole the values make, and the call site reads each of them by name. | review | [] |

## jsdoc-only-for-non-obvious-public-entry → docs-only-for-non-obvious-public-entry
JSDoc documents only a public entry whose use is not obvious, never a self-describing property or parameter; a `@deprecated` tag aside.

| Why | Check | Tags |
|---|---|---|
| JSDoc that repeats a signature drifts from it, and the editor already shows the types. | review | [] |

## deprecated-by-jsdoc-tag → retired-code-marked-deprecated
The mark is a JSDoc `@deprecated` tag that names the replacement.

| Why | Check | Tags |
|---|---|---|
| editors strike the call through, and the tooling reads the tag. | review | [] |

## no-deprecated-import → deprecated-forms-never-used
No new import names an export marked `@deprecated`.

| Why | Check | Tags |
|---|---|---|
| the tag is where TypeScript marks a deprecated export, and the linter reads it at the import. | tool/lint | [] |

## Dependencies

## tools-are-dev-dependencies → tools-pinned-exactly-by-the-repository
The tools are `devDependencies` of `package.json`.

| Why | Check | Tags |
|---|---|---|
| a package's `devDependencies` are installed in its repository and never with the package. | review | [] |

## tools-pinned-without-a-range → tools-pinned-exactly-by-the-repository
Every tool in `devDependencies` is an exact version, with no range; the workspace's own packages, at `workspace:*`, are not tools.

| Why | Check | Tags |
|---|---|---|
| a range lets the lockfile move a tool to a new version without a change to the manifest. | tool/versions | [] |

## production-imports-no-development-dependency → tools-are-dev-dependencies
Production code imports no development dependency.

| Why | Check | Tags |
|---|---|---|
| a tool imported by production code ships inside it. | tool/imports | [security] |

## caret-ranges-lockfile-pins → program-dependencies-ranged-lockfile-pins
The range of a dependency of the program is a caret range.

| Why | Check | Tags |
|---|---|---|
| a caret takes every release of the same major, which promises to keep the dependency compatible. | tool/versions | [] |

## shared-state-packages-once-in-lockfile · SHOULD
A package that holds state or types across the program — the schema engine, the user-interface framework — resolves to one version in the lockfile.

| Why | Check | Tags |
|---|---|---|
| two copies of such a package split its state, and its types stop matching across the split. | review | [] |

## manifest-fields-in-shared-order · SHOULD
The fields of `package.json` follow the shared order.

| Why | Check | Tags |
|---|---|---|
| every manifest reads the same way, and a diff shows a change of content, not of order. | tool/format | [] |

## test-folder-files-in-test-forms → test-files-named-by-role
A `.ts` or `.tsx` file in `__tests__/` or `tests/` is a `.test`, `.<kind>.test`, `.fake` or `.fixtures` file.

| Why | Check | Tags |
|---|---|---|
| a spec named otherwise would not run, and a helper named like a spec would. | tool/names | [testing] |
