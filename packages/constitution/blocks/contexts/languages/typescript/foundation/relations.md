# Relations

> Governs modules, imports, exports, module-level values and overrides.

## Modules

### package-is-an-es-module · MUST

Every package is an ES module: no file uses `require`, `module.exports`, `__dirname`, `import … = require()` or `export =`.

| Why | Tags |
|---|---|
| one module system gives every import one meaning and one resolution in the program, its specs and its tools; CommonJS brings a second loader whose interop changes what an import returns. | [] |

### namespace-never-written · MUST

No `namespace` or `module` block is written, an ambient one included: a library's types are described by `declare module '<name>'` and the program's globals by `declare global`, save a `namespace` inside it that merges into one a library or the runtime declares, such as `NodeJS.ProcessEnv`, under a suppression that names it.

| Why | Tags |
|---|---|
| a namespace is an older second way to group what a module already groups; one that holds values compiles to an object no import rule can see into, and a declared one types a global that no import names, so no reader can trace it to its source. | [] |

### type-only-import-written-as-import-type · MUST

The names an import or a re-export uses only as types are written in an `import type` or `export type` of their own, apart from the names used as values, save a class a framework reads from a decorator's metadata, which its block names; no name is marked `type` inside the braces.

| Why | Tags |
|---|---|
| the line then says it vanishes from the running program, so it never loads a module for its side effects nor closes a cycle at run time. | [] |

### module-exports-by-name · MUST

A module exports by name, never by `export default`, save where a framework or a tool reads a default export — a configuration file such as `*.config.ts` included — and there a suppression names which.

| Why | Tags |
|---|---|
| a thing then has one name in every import, so a search finds every use and a rename reaches them all. | [] |

## Construction and state

### module-level-value-never-changed → state-never-global-and-mutable · MUST

Save the diagnostics facades configured once at start and a spec's setup that its hooks set for each case, every variable declared at module level is `const`, no `Map`, `Set`, array or object it holds is changed after the module loads, and no class's static field holds such a value.

| Why | Tags |
|---|---|
| a module loads once per process, so what it holds is shared by every caller and carries over from one spec into the next. | [] |

## Inheritance and patterns

### overrides-marked-by-keyword → override-marked-where-declared · MUST

A method that overrides one of its base class carries `override`.

| Why | Tags |
|---|---|
| an override then says so where it is declared, and a base method renamed or removed leaves no method that silently overrides nothing. | [] |
