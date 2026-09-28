# TypeScript

## Modules and files

## hash-alias-from-package-imports · MUST
`#/` is declared in `imports` of `package.json` (`"#/*": "./src/*"`), the source the runtime reads. `paths` in `tsconfig.json` repeats it word for word, only because the compiler does not resolve a folder's surface through `imports`. No alias in a bundler.
**Why:** one declaration is the source and the mirror is checked against it on sight; a third alias elsewhere drifts unseen.
**Check:** review
**Tags:** architecture

## file-named-after-its-export · SHOULD
A file with one export is named after it — `order-status.ts` exports `OrderStatus`; a file with several exports names the unit they form.
**Why:** a reader who knows the name of a thing knows the name of its file.
**Check:** review
**Tags:** naming
**Implements:** `file-is-one-semantic-unit`

## Names

## identifier-case-by-kind · SHOULD
PascalCase for types, classes, enums and their members; camelCase for functions, variables and instances; SCREAMING_SNAKE_CASE for a constant value, camelCase for a constant object or function. An enum is named in the singular.
**Why:** the case tells what kind of thing a name is before its declaration is read.
**Check:** tool — lint
**Tags:** naming

## type-names-undecorated · SHOULD
A type is a noun, undecorated: no `I` prefix, on ports too, and no `Type` or `Interface` suffix.
**Why:** a decoration repeats what the language already shows and makes every name longer.
**Check:** tool — lint
**Tags:** naming

## Values and types

## enums-for-named-value-groups · MUST
A closed set of named values is a string `enum` — never a union of string literals, and never an `as const` array or object whose type names the set. Numbers another system defines — exit statuses, HTTP statuses — are a numeric `enum` with every value written, and an incoming number stays `number`, compared with the members. `as const` is for a single literal and for data that is not a set of names. A union's discriminant is an enum member when the enum owns the vocabulary, and a string literal otherwise.
**Why:** an enum is one declaration of a closed set that the compiler checks everywhere it is used.
**Check:** tool — lint
**Tags:** types

## strict-equality-only · MUST
Comparisons are strict — `===` and `!==`, with `null` too; never `==`.
**Why:** loose equality converts its operands by rules few remember, and hides a second absent value behind the first.
**Check:** tool — lint
**Tags:** types

## nullish-operators-for-absence · SHOULD
`??` gives a default and `?.` reaches through an absent value; `!value` is never a check for absence on a value that is not boolean.
**Why:** `!value` also treats `0` and the empty string as absent, which is a bug waiting for its input.
**Check:** tool — lint
**Tags:** types

## no-any · MUST
No `any`: not `: any`, `as any`, `Record<string, any>` or `Promise<any>`, in tests too; `noImplicitAny` is never turned off.
**Why:** `any` switches the type checker off for everything it touches, and it spreads.
**Check:** tool — lint
**Tags:** types

## no-unchecked-escape-hatches · MUST
No `as` cast except `as const`, no `!` non-null assertion, no `@ts-ignore` or `@ts-nocheck`. `@ts-expect-error` and any other exception carry a suppression that states why.
**Why:** each escape hatch is a place where the code tells the compiler it knows better; without a reason nobody can check whether it still does.
**Check:** tool — lint
**Tags:** types
**Implements:** `suppression-states-its-reason`

## exhaustive-branching-over-unions · SHOULD
A branch over a union handles every member: a `switch` whose default proves `never`, or an `if` chain that ends in a `never` check.
**Why:** a new member then fails to compile at every branch that forgot it.
**Check:** tool — lint
**Tags:** types
**Implements:** `illegal-states-unrepresentable`
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
**Why:** `satisfies` catches a missing or wrong field and still lets the compiler know the exact value.
**Check:** review
**Tags:** types

## derivable-types-derived-inline · SHOULD
A type derivable from an exported parent in one or two indexed accesses is derived where it is used, not exported under a name of its own.
**Why:** an exported copy of a derivable type is one more name to keep in sync with its parent.
**Check:** review
**Tags:** types

## options-object-typed-as-function-input · SHOULD
An object of values that travel together is typed by an interface named `<Function>Input`.
**Why:** the interface names the whole the values make, and the call site reads each of them by name.
**Check:** review
**Tags:** naming
**Implements:** `at-most-three-positional-arguments`

## jsdoc-only-for-non-obvious-api · SHOULD
JSDoc documents only a public API whose use is not obvious, never a self-describing property or parameter.
**Why:** JSDoc that repeats a signature drifts from it, and the editor already shows the types.
**Check:** review
**Tags:** naming
**Implements:** `interface-docs-only-for-non-obvious-public-api`

## compiler-is-the-type-gate · MUST
The compiler, not a bundler or the runtime, is the type gate: `tsc --noEmit` runs in the check with the strict options — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.
**Why:** a bundler strips the types without checking them, so a build can pass with every type wrong.
**Check:** tool — types
**Tags:** types
**Implements:** `rules-held-by-tools`

## Dependencies

## tools-are-dev-dependencies · MUST
Build, test and lint tools are development dependencies, and production code imports none of them.
**Why:** a tool in production dependencies ships to every installation, and one imported by production code ships inside it.
**Check:** tool — architecture
**Tags:** security, architecture

## one-version-per-dependency · MUST
Each dependency has one version across every manifest of the repository.
**Why:** two versions of one dependency behave differently in two places, and the difference is found in production.
**Check:** tool — versions
**Tags:** workflow

## caret-ranges-lockfile-pins · SHOULD
A manifest's ranges are caret ranges; the lockfile pins the exact versions.
**Why:** the manifest says what is compatible, the lockfile what is installed; pinning in both makes every update touch two files.
**Check:** tool — versions
**Tags:** security
**Implements:** `dependencies-pinned-by-lockfile`

## shared-state-packages-once-in-lockfile · SHOULD
A package that holds state or types across the program — the schema engine, the interface framework — resolves to one version in the lockfile.
**Why:** two copies of such a package split its state, and its types stop matching across the split.
**Check:** tool — versions
**Tags:** types

## manifest-fields-in-shared-order · SHOULD
The fields of `package.json` follow the shared order.
**Why:** every manifest reads the same way, and a diff shows a change of content, not of order.
**Check:** tool — format
**Tags:** workflow
