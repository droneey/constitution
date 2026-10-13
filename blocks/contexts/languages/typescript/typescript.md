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
Types, classes, enums and enum members are PascalCase; functions, variables and instances camelCase; a module-level constant holding a primitive or a regular expression SCREAMING_SNAKE_CASE, and one holding an object, an array or a function camelCase. A function a framework renders by the case of its name takes the case that framework's block names.

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
An import or a re-export whose every name is used only as a type is written `import type` or `export type`; a name marked `type` inside the braces stands only beside names used as values.

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
A call across a process boundary that its client does not bound by a timeout of its own is given `AbortSignal.timeout(ms)`, joined to its caller's signal by `AbortSignal.any` where it has one.

| Why | Tags |
|---|---|
| that signal is the timeout every API of the platform takes, and joining it to the caller's keeps one way to stop a call, whether the time ran out or the caller gave up. | [] |

### scoped-resource-held-by-using → resource-released-on-every-path · MUST
A resource whose life is one scope — a file handle, a lock, a temporary folder, a connection for one task — is held by `using` or `await using`.

| Why | Tags |
|---|---|
| the resource is then released at the end of its scope on every way out, a thrown failure included, where a `finally` is forgotten on the next path added. | [] |

### promise-awaited-returned-or-handed-to-a-scope → async-work-awaited-or-held-by-a-scope · MUST
Every promise is awaited, returned or handed to a scope that awaits it; `void` never discards one.

| Why | Tags |
|---|---|
| a promise nobody awaits fails where nobody sees it, and the work it stands for outlives the code that started it. | [errors] |

## Security

### child-process-started-without-a-shell → outside-input-reaches-interpreters-as-parameters · MUST
A process is started with its arguments as an array — `execFile`, `spawn` and the runtime's own forms of them — never through `exec`, `execSync` or the option `shell: true`.

| Why | Tags |
|---|---|
| a command line handed to a shell is parsed again, and a `;` or a `$(…)` in its input runs as a command of its own. | [security] |

### outside-path-checked-by-relative → outside-path-confined-to-its-root · MUST
A path built from outside input is resolved with `path.resolve(root, input)`, taken to its real path by `fs.realpath` — of its folder, for a file not yet made — and refused when `path.relative` from the root's real path is `..`, starts with `..` and a separator, or is absolute.

| Why | Tags |
|---|---|
| `path.join` keeps every `..` it is given, and a check on the string before it is resolved misses an encoded or nested one. | [security] |

### child-process-given-an-env-of-its-own → child-process-environment-built-for-it · MUST
A process the program starts — through `spawn`, `execFile` or the runtime's own forms of them — is passed an `env` built for it, never left to inherit `process.env` and never given a copy of it.

| Why | Tags |
|---|---|
| each of these calls copies the whole of `process.env` into the child when `env` is left out, a secret among it. | [security] |

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

### secret-compared-by-timing-safe-equal → security-primitive-from-a-vetted-library · MUST
A secret — a token, a signature, a key — is compared with `timingSafeEqual` from `node:crypto`, or the runtime's equivalent, over the HMACs or digests of both sides, never with `===`.

| Why | Tags |
|---|---|
| `===` stops at the first byte that differs, and the time it takes tells an attacker how much of a guess was right. | [security] |

## Dependencies

### exports-map-each-entry → dependency-reached-through-its-public-entry · MUST
The `package.json` of a package others import maps each of its entries in `exports`, so no path outside those entries can be imported.

| Why | Tags |
|---|---|
| a path `exports` does not map cannot be imported, so the entries listed are the whole of what a consumer can couple to. | [] |

### tools-pinned-in-dev-dependencies → tool-pinned-exactly-by-the-repository · MUST
Every tool the npm registry publishes is a `devDependencies` entry of `package.json` at an exact version, with no range; a unit of the repository itself, linked from its working tree, is no such tool.

| Why | Tags |
|---|---|
| `devDependencies` install with the repository and never with the package, and an exact version lets no lockfile update move a tool without a change to the manifest. | [] |

### stateful-package-resolved-once · SHOULD
A package that holds state or types across the program — the schema library, the user-interface framework — resolves to one version in the lockfile.

| Why | Tags |
|---|---|
| two copies of such a package split its state, and its types stop matching across the split. | [] |

### missing-built-in-polyfilled-by-the-entry · MUST
A built-in the code relies on that a runtime it supports lacks — `Temporal`, `Symbol.dispose`, `DisposableStack` — gets its polyfill once, imported by the entry file before any code uses it.

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

### source-file-named-in-kebab-case → file-name-in-its-owners-case · MUST
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
