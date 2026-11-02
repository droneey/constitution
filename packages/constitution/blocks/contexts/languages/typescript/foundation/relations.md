# Relations

> Governs how a TypeScript unit is built, holds state and depends on or extends another: modules, imports, exports, module-level values, overrides and deprecation.

## Modules

### package-is-an-es-module · MUST

Every package is an ES module. No file uses `require`, `module.exports`, `__dirname`, `import … = require()` or `export =`.

| Why |
|---|
| one module system gives every import one meaning and one resolution in the program, its specs and its tools; CommonJS brings a second loader whose interop changes what an import returns. |

### namespace-never-written · MUST

No `namespace` or `module` block is written, an ambient one included. A library's types are described by `declare module '<name>'` and the program's globals by `declare global`, save a `namespace` inside it that merges into one a library or the runtime declares, such as `NodeJS.ProcessEnv`, under a suppression that names it.

| Why |
|---|
| a namespace is an older second way to group what a module already groups; one that holds values compiles to an object no import rule can see into, and a declared one types a global that no import names, so no reader can trace it to its source. |

### type-only-import-written-as-import-type · MUST

A name used only as a type is imported in an `import type` of its own. An import or a re-export writes the names it uses only as types in an `import type` or `export type` apart from the names used as values, save a class a framework reads from a decorator's metadata, which its block names, and no name is marked `type` inside the braces.

| Why |
|---|
| a type imported among values loads its module at run time, for side effects nobody wanted, and can close an import cycle that only types formed. |

### module-exports-by-name · MUST

A module exports by name, never by `export default`. The exception is a module whose default export a framework or a tool reads — a configuration file such as `*.config.ts` included — and there a suppression names which.

| Why |
|---|
| a default export takes whatever name each import gives it, so a search misses the uses under other names and a rename does not reach them. |

## Construction and state

### module-level-value-never-changed → state-never-global-and-mutable · MUST

A value held at module level never changes. Every variable declared at module level is `const`, no `Map`, `Set`, array or object it holds is changed after the module loads, and no class's static field holds such a value; the diagnostics facades configured once at start and a spec's setup that its hooks set for each case are exempt.

| Why |
|---|
| a module loads once per process, so what it holds is shared by every caller and carries over from one spec into the next. |

## Inheritance and patterns

### overrides-marked-by-keyword → override-marked-where-declared · MUST

A method that overrides one of its base class carries `override`.

| Why |
|---|
| an override without the keyword silently overrides nothing once its base method is renamed or removed, and a new method that overrides one by accident passes unnoticed. |

## Deprecation

### deprecated-by-jsdoc-tag → retired-code-marked-deprecated · SHOULD

Code kept only for its old callers carries a JSDoc `@deprecated` tag. The tag names its replacement.

| Why |
|---|
| a mark in any other form is not shown at the uses, so a new caller builds on the code without seeing that it is going. |
