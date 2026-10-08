---
id: typescript
summary: How TypeScript is written, resolved, typed and packaged.
requires: []
extends: null
abstract: false
languages: []
dictionary: [TypeScript, .ts, .tsx, .d.ts, index.ts, main.ts, package.json, JSDoc]
governs: ["**/*.ts", "**/*.tsx", "package.json"]
---

# TypeScript

> The form core's rules take in TypeScript. The source root is the `src/` of each package or application, and its entry is `main.ts`.

## Modules and files

### alias-declared-in-package-imports · MUST
An import alias, where the program has one, is declared once, in `imports` of `package.json`, the source the runtime reads. A tool that cannot read `imports` repeats it word for word, and no configuration declares an alias of its own.

| Why | Tags |
|---|---|
| one declaration is the source and a mirror is checked against it on sight; an alias declared elsewhere drifts unseen. | [] |

### hash-alias-for-the-source-root · MUST
The source root's alias is `#/`: `"#/*": "./src/*"` in `imports`.

| Why | Tags |
|---|---|
| an import that leaves its module then reads the same in every program, and `#` is the prefix `imports` requires. | [] |

### exports-map-each-entry · MUST
`exports` in the `package.json` of a package others import maps each of its entries to its file, so a consumer reaches the package only through the entries it lists.

| Why | Tags |
|---|---|
| a path `exports` does not map cannot be imported, so the curated entries are the whole of what a consumer can couple to. | [] |

### exported-types-have-type-tests · SHOULD
The exported generic and conditional types of a package others import are proven by type cases the compiler checks.

| Why | Tags |
|---|---|
| a consumer relies on what such a type computes, and nothing else fails when a change computes something else. | [testing] |

### file-named-after-its-export · SHOULD
A file with one export is named after it — `order-status.ts` exports `OrderStatus`; a file with several exports names the unit they form.

| Why | Tags |
|---|---|
| a reader who knows the name of a thing knows the name of its file. | [] |

### typescript-file-forms → file-name-in-its-owners-case · MUST
Source files are kebab-case `.ts` or `.tsx`.

| Why | Tags |
|---|---|
| one spelling of every kind of file lets the tools and the reader find a file by its name. | [] |

### tsx-only-where-markup-is-written · MUST
A file is `.tsx` only where it writes markup.

| Why | Tags |
|---|---|
| the extension then says which files render, and a plain module is never parsed for markup. | [] |

## Names

### identifier-case-by-kind → name-case-by-kind · SHOULD
PascalCase for types, classes, enums and their members; camelCase for functions, variables and instances; SCREAMING_SNAKE_CASE for a constant value, camelCase for a constant object or function. A function a framework renders by the case of its name takes the case that framework's block names. An enum is named in the singular. A type parameter is `T` or starts with it.

| Why | Tags |
|---|---|
| the case tells what kind of thing a name is before its declaration is read. | [] |

### type-names-undecorated · SHOULD
A type is a noun, undecorated: no `I` prefix, on interfaces too, and no `Type` or `Interface` suffix.

| Why | Tags |
|---|---|
| a decoration repeats what the language already shows and makes every name longer. | [] |

## Values and types

### undefined-is-the-only-absence → absence-shown-by-the-type · MUST
Code spells absence as `undefined`: `?: T` for what may be absent, `T | undefined` only where an explicit `undefined` means something, `return;` for no result. An optional field that is absent is left out, never set to `undefined`. `null` appears only in a comparison with what a platform API returns, in the type of an external format that uses it, and where an API's types demand it — the language's `Object.create(null)`, a signature a library imposes.

| Why | Tags |
|---|---|
| one spelling of absence means one check, and an optional field is then present or missing, never set to `undefined` by accident. | [] |

### brand-is-an-intersection-or-unique-symbol → identifier-branded-by-entity · SHOULD
A brand is `string & { readonly __brand: 'OrderId' }` or a unique symbol.

| Why | Tags |
|---|---|
| one form of brand reads the same in every file. | [] |

### invariant-value-is-a-branded-type → invariant-value-is-plain-immutable-data · MUST
A value that keeps an invariant is a branded type — of a primitive, or of a plain object with `readonly` fields, never a class instance — built by `create<Name>`, which throws the kit's error when the invariant fails, and narrowed by `is<Name>`.

```ts
type Email = string & { readonly __brand: 'Email' };
const isEmail = (text: string): text is Email => EMAIL.test(text);
const createEmail = (text: string): Email => {
  if (!isEmail(text)) throw new InvalidEmailError(text);
  return text;
};
```

| Why | Tags |
|---|---|
| the brand is reachable only through the check, and the value stays a plain string every boundary can carry. | [] |

### semantic-alias-names-a-shared-meaning · SHOULD
A semantic alias — `type ChatTitle = string` — names a meaning without an invariant and is never branded; it is declared only when the code uses it, for a meaning found in two or more places, never for a string that is just a string. Where an alias exists, code uses it, not the bare type, and imports it with `import type`.

| Why | Tags |
|---|---|
| an alias names a meaning the program shares; one per string turns vocabulary into noise, and a bare type beside an existing alias hides the meaning again. | [] |

### enums-for-named-value-groups · MUST
A closed set of named values is a string `enum` — never a union of string literals, and never an `as const` array or object whose type names the set. Numbers another system defines — exit statuses, HTTP statuses — are a numeric `enum` with every value written, and an incoming number stays `number`, compared with the members. `as const` is for a single literal and for data that is not a set of names. A union's discriminant is an enum member when the enum owns the vocabulary, and a string literal otherwise. A union of literals given to a key utility — `Omit<Props, 'onSubmit' | 'disabled'>`, `Pick`, `Exclude`, `Extract` — names keys, not a set, and a type that describes another system's data keeps that system's literals.

| Why | Tags |
|---|---|
| an enum is one declaration of a closed set that the compiler checks everywhere it is used. | [] |

### strict-equality-only · MUST
Comparisons are strict — `===` and `!==`, with `null` too; never `==`.

| Why | Tags |
|---|---|
| loose equality converts its operands by rules few remember, and hides a second absent value behind the first. | [] |

### nullish-operators-for-absence · SHOULD
`??` gives a default and `?.` reaches through an absent value; `!value` is never a check for absence on a value that is not boolean.

| Why | Tags |
|---|---|
| `!value` also treats `0` and the empty string as absent, which is a bug waiting for its input. | [] |

### no-any → unchecked-type-never-used · MUST
No `any`: not `: any`, `as any`, `Record<string, any>` or `Promise<any>`, and no parameter left without a type for the compiler to read as `any`.

| Why | Tags |
|---|---|
| these are the places `any` is written, and a parameter without a type is an `any` nobody wrote. | [] |

### no-unchecked-escape-hatches → suppression-states-its-reason · MUST
No `as` cast except `as const`, no `!` non-null assertion, no `@ts-ignore` or `@ts-nocheck`. `@ts-expect-error` and any other exception carry a suppression that states why.

| Why | Tags |
|---|---|
| each escape hatch is a place where the code tells the compiler it knows better; without a reason nobody can check whether it still does. | [] |

### overrides-marked-by-keyword → override-marked-where-declared · MUST
A method that overrides one of its base class carries `override`.

| Why | Tags |
|---|---|
| an override then says so where it is declared, and a base method renamed or removed leaves no method that silently overrides nothing. | [] |

### boundary-values-unknown-until-parsed → outside-value-untyped-until-parsed · MUST
A value from outside the program — `JSON.parse`'s result included — is `unknown`, and its plain checks are `typeof`, `in` and `Array.isArray`; `.json<T>()` and `as Promise<T>` are casts.

| Why | Tags |
|---|---|
| the compiler refuses every use of an `unknown` value until a check narrows it. | [] |

### exhaustive-branching-over-unions → closed-set-branched-exhaustively · MUST
A branch over a union handles every member: a `switch` whose default proves `never`, or an `if` chain that ends in a `never` check.

| Why | Tags |
|---|---|
| a new member then fails to compile at every branch that forgot it. | [] |

### satisfies-to-check-conformance · SHOULD
Conformance to a type is checked with `satisfies`, which keeps the narrow type, not with `as` or a widening annotation.

| Why | Tags |
|---|---|
| `satisfies` catches a missing or wrong field and still lets the compiler know the exact value. | [] |

### derivable-types-derived-inline · SHOULD
A type derivable from an exported parent in one or two indexed accesses is derived where it is used, not exported under a name of its own.

| Why | Tags |
|---|---|
| an exported copy of a derivable type is one more name to keep in sync with its parent. | [] |

### business-types-readonly → value-immutable-by-default · SHOULD
The fields of a type of the program's business data are `readonly`, its lists `readonly T[]` and its maps `ReadonlyMap`.

| Why | Tags |
|---|---|
| the compiler then refuses a mutation the domain never meant. | [] |

### no-mutable-export → state-never-global-and-mutable · MUST
No module declares an export with `export let` or `export var`.

| Why | Tags |
|---|---|
| an exported binding that is reassigned is state every importer shares without seeing who changes it, and it leaks from one spec into the next. | [] |

### type-parameter-appears-twice · SHOULD
A type parameter appears at least twice in its signature; one that appears once is its constraint written out.

| Why | Tags |
|---|---|
| a parameter used once relates nothing, and only lets a caller claim a type the function never checks. | [] |

### text-made-deliberately · SHOULD
A value becomes text through a function that names its form — a formatter, `String` of a primitive, a template of strings — never by `+` with a value that is not a string, or by an object's default `toString`. `+` never mixes a `bigint` with a `number`.

| Why | Tags |
|---|---|
| `'Total: ' + order` prints `[object Object]`, and a number joined to a string is printed in no locale's form. | [] |

### dates-through-temporal → instant-is-an-exact-time · MUST
A date, a time, a duration or a time zone is a `Temporal` value; a `Date` appears only where an API demands one, converted at that call; no date library is used. A runtime the program supports that lacks `Temporal` loads its polyfill once, in the entry file, before any code reads a date.

| Why | Tags |
|---|---|
| `Date` mixes an instant with the machine's time zone and mutates in place, which is where date bugs come from; `Temporal` keeps each meaning in its own immutable type. | [data] |

### return-type-no-wider-than-returned · SHOULD
A declared return type is no wider than what the function returns.

| Why | Tags |
|---|---|
| a wider annotation throws away what the compiler knew, and every caller narrows again. | [] |

### no-literal-thrown → thrown-value-is-an-error · MUST
No literal, template or object literal is thrown.

| Why | Tags |
|---|---|
| these are the thrown non-errors the linter can see without types; a variable holding one is left to review. | [] |

### return-awaited-inside-try → catch-handles-only-what-it-recognises · MUST
Inside a `try`, a returned promise is awaited — `return await` — so its rejection reaches the `catch`.

| Why | Tags |
|---|---|
| without the `await`, the function has returned before the promise rejects, so its `catch` never runs and the raw failure passes unmapped. | [errors] |

### named-exports-only · MUST
A module exports by name. A default export appears only in a configuration file a tool reads — `*.config.*`, `.*rc.*` — or where a framework or a tool reads one, and then its suppression, or the tool's part of the presets, says which.

| Why | Tags |
|---|---|
| one name for one thing in every import, so a rename reaches every place it is used. | [] |

### cancellation-by-abort-signal → outside-call-can-be-cancelled · SHOULD
An operation that can be cancelled takes an `AbortSignal` in its options object and hands it to every I/O call it makes.

| Why | Tags |
|---|---|
| one signal from the caller stops all the work below it, and every API of the platform takes one. | [] |

### resources-released-by-using → resource-released-on-every-path · MUST
A resource that must be released — a file handle, a lock, a subscription, a temporary folder — is held by `using` or `await using`, so it is released on every path.

| Why | Tags |
|---|---|
| a `finally` is forgotten on the next path added; `using` releases at the end of the scope whatever the path. | [] |

### options-object-has-a-named-type → function-takes-at-most-three-positions · SHOULD
An object of values that travel together is typed by a named type, never by an object type written inline in the signature.

| Why | Tags |
|---|---|
| the type names the whole the values make, and the call site reads each of them by name. | [] |

### jsdoc-only-for-non-obvious-public-entry → export-documented-only-where-not-obvious · SHOULD
JSDoc documents only a public entry whose use is not obvious, never a self-describing property or parameter; a `@deprecated` tag aside.

| Why | Tags |
|---|---|
| JSDoc that repeats a signature drifts from it, and the editor already shows the types. | [] |

### deprecated-by-jsdoc-tag → retired-code-marked-deprecated · SHOULD
Code kept only for its old callers is marked by a JSDoc `@deprecated` tag that names its replacement.

| Why | Tags |
|---|---|
| editors strike the call through, and the tooling reads the tag. | [] |

### no-deprecated-import → deprecated-form-never-used · MUST
No new import names an export marked `@deprecated`.

| Why | Tags |
|---|---|
| the tag is where TypeScript marks a deprecated export, and the linter reads it at the import. | [] |

## Dependencies

### tools-are-dev-dependencies → tool-pinned-exactly-by-the-repository · MUST
The tools are `devDependencies` of `package.json`. Production code imports no development dependency.

| Why | Tags |
|---|---|
| a package's `devDependencies` are installed in its repository and never with the package. | [] |

### tools-pinned-without-a-range → tool-pinned-exactly-by-the-repository · MUST
Every tool in `devDependencies` is an exact version, with no range.

| Why | Tags |
|---|---|
| a range lets the lockfile move a tool to a new version without a change to the manifest. | [] |

### dependency-declared-with-a-caret · SHOULD
The range of a dependency of the program is a caret range.

| Why | Tags |
|---|---|
| a caret takes every release of the same major, which promises to keep the dependency compatible. | [security] |

### shared-state-packages-once-in-lockfile · SHOULD
A package that holds state or types across the program — the schema engine, the user-interface framework — resolves to one version in the lockfile.

| Why | Tags |
|---|---|
| two copies of such a package split its state, and its types stop matching across the split. | [] |

### manifest-fields-in-shared-order · SHOULD
The fields of `package.json` follow the shared order.

| Why | Tags |
|---|---|
| every manifest reads the same way, and a diff shows a change of content, not of order. | [] |

### test-folder-files-in-test-forms → file-named-for-its-kind · MUST
A `.ts` or `.tsx` file in `__tests__/` or `tests/` is a `.test`, `.<kind>.test`, `.fake` or `.fixtures` file.

| Why | Tags |
|---|---|
| a spec named otherwise would not run, and a helper named like a spec would. | [testing] |
