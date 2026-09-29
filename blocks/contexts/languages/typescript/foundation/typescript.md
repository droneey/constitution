# TypeScript

## Modules and files

## hash-alias-from-package-imports · MUST
`#/` is declared in `imports` of `package.json` (`"#/*": "./src/*"`), the source the runtime reads. `paths` in `tsconfig.json` repeats it word for word, only because the compiler does not resolve a folder's `index.ts` through `imports`. No alias in a bundler.

| Why | Check | Tags |
|---|---|---|
| one declaration is the source and the mirror is checked against it on sight; a third alias elsewhere drifts unseen. | review | [] |

## file-named-after-its-export → file-is-one-semantic-unit
A file with one export is named after it — `order-status.ts` exports `OrderStatus`; a file with several exports names the unit they form.

| Why | Check | Tags |
|---|---|---|
| a reader who knows the name of a thing knows the name of its file. | review | [] |

## typescript-file-forms → kebab-case-file-names
Source files are kebab-case `.ts` or `.tsx`. In `__tests__/`, a spec is `<file name>.test.ts`, `<name>.integration.test.ts` or `<name>.e2e.test.ts`, a fake `<contract>.fake.ts`, fixtures `<name>.fixtures.ts`.

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
Code spells absence as `undefined`: `?: T` for what may be absent, `T | undefined` only where an explicit `undefined` means something, `return;` for no result. `null` appears only in a comparison with what a platform API returns, and in the type of an external format that uses it. The compiler runs with `exactOptionalPropertyTypes`.

| Why | Check | Tags |
|---|---|---|
| one spelling of absence means one check, and the compiler option stops an absent field from being set to `undefined` by accident. | tool/lint | [] |

## brand-is-an-intersection-or-unique-symbol → identifiers-branded-by-entity
An identifier's brand is `string & { readonly __brand: 'OrderId' }` or a unique symbol. An alias of the vocabulary stays a plain name, never branded.

| Why | Check | Tags |
|---|---|---|
| one form of brand reads the same in every file, and an alias of the vocabulary names a meaning, not a proof of where a value came from. | review | [] |

## semantic-alias-names-a-shared-meaning · SHOULD
A semantic alias — `type Email = string` — is declared only when the code uses it, for a meaning found in two or more places, never for a string that is just a string.

| Why | Check | Tags |
|---|---|---|
| an alias names a meaning the program shares; one per string turns vocabulary into noise. | review | [] |

## enums-for-named-value-groups · MUST
A closed set of named values is a string `enum` — never a union of string literals, and never an `as const` array or object whose type names the set. Numbers another system defines — exit statuses, HTTP statuses — are a numeric `enum` with every value written, and an incoming number stays `number`, compared with the members. `as const` is for a single literal and for data that is not a set of names. A union's discriminant is an enum member when the enum owns the vocabulary, and a string literal otherwise.

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

## no-any · MUST
No `any`: not `: any`, `as any`, `Record<string, any>` or `Promise<any>`, in tests too; `noImplicitAny` is never turned off.

| Why | Check | Tags |
|---|---|---|
| `any` switches the type checker off for everything it touches, and it spreads. | tool/lint | [] |

## no-unchecked-escape-hatches → suppression-states-its-reason
No `as` cast except `as const`, no `!` non-null assertion, no `@ts-ignore` or `@ts-nocheck`. `@ts-expect-error` and any other exception carry a suppression that states why.

| Why | Check | Tags |
|---|---|---|
| each escape hatch is a place where the code tells the compiler it knows better; without a reason nobody can check whether it still does. | review | [] |

## casts-and-assertions-refused → no-unchecked-escape-hatches
No `as` cast except `as const`, no `!` non-null assertion and no `@ts-ignore`.

| Why | Check | Tags |
|---|---|---|
| each is a place where the code tells the compiler it knows better. | tool/lint | [] |

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
type Payment = { status: 'pending' } | { status: 'paid'; at: Date } | { status: 'failed'; reason: string };

const label = (payment: Payment): string => {
  switch (payment.status) {
    case 'pending': return 'Waiting';
    case 'paid': return `Paid ${payment.at.toISOString()}`;
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

## options-object-typed-as-function-input → at-most-three-positional-arguments
An object of values that travel together is typed by an interface named `<Function>Input`.

| Why | Check | Tags |
|---|---|---|
| the interface names the whole the values make, and the call site reads each of them by name. | review | [] |

## jsdoc-only-for-non-obvious-public-entry → docs-only-for-non-obvious-public-entry
JSDoc documents only a public entry whose use is not obvious, never a self-describing property or parameter.

| Why | Check | Tags |
|---|---|---|
| JSDoc that repeats a signature drifts from it, and the editor already shows the types. | review | [] |

## Dependencies

## tools-are-dev-dependencies · MUST
Build, test and lint tools are development dependencies, and production code imports none of them.

| Why | Check | Tags |
|---|---|---|
| a tool in production dependencies ships to every installation, and one imported by production code ships inside it. | review | [security] |

## production-imports-no-development-dependency → tools-are-dev-dependencies
Production code imports no development dependency.

| Why | Check | Tags |
|---|---|---|
| a tool imported by production code ships inside it. | tool/architecture | [security] |

## one-version-per-dependency · MUST
Each dependency has one version across every manifest of the repository.

| Why | Check | Tags |
|---|---|---|
| two versions of one dependency behave differently in two places, and the difference is found in production. | tool/versions | [] |

## caret-ranges-lockfile-pins · SHOULD
A manifest's ranges are caret ranges; the lockfile pins the exact versions.

| Why | Check | Tags |
|---|---|---|
| the manifest says what is compatible, the lockfile what is installed; pinning in both makes every update touch two files. | tool/versions | [security] |

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
