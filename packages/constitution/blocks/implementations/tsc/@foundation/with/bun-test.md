# Bun test

> Governs specs that run on Bun inside a program that does not.

## General

### specs-checked-by-their-own-config · MUST

Where the program's configuration gives no Bun types, the specs are checked by a configuration of their own. The program's configuration is then `tsconfig.src.json`, which leaves the specs out — a browser program's, say — and the specs and their fixtures are checked by `tsconfig.test.json`, which extends it, adds `types: ["bun"]`, includes only `__tests__/` and `tests/`, and references `tsconfig.src.json` where that is `composite`, as a unit of a workspace is.

#### Why

One configuration cannot give the specs Bun's globals and keep them out of the code that ships to a browser; a `composite` project must list every file it compiles, so the specs reach the program's files through its declarations, by the reference, or fail with TS6307.

#### Examples

```json title="Avoid"
{
  "compilerOptions": {
    "lib": ["ES2023", "DOM"],
    "types": ["bun"]
  },
  "include": ["src", "__tests__"]
}
```

```json title="Prefer"
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "types": ["bun"]
  },
  "include": ["__tests__", "tests"],
  "references": [{ "path": "./tsconfig.src.json" }]
}
```

### tsconfig-json-joins-the-split-configs · MUST

Where the specs have a configuration of their own, `tsconfig.json` extends `tsconfig.src.json`, holds no files (`files` and `include` empty) and references both.

#### Why

An editor reads only `tsconfig.json`, and through its references opens each file with its own configuration; Bun's transpiler reads only `tsconfig.json` too, so without the `extends` a spec loses the program's transpiler options, such as its decorators.

#### Examples

```json title="Avoid"
{
  "extends": "./tsconfig.src.json",
  "include": ["src", "__tests__"]
}
```

```json title="Prefer"
{
  "extends": "./tsconfig.src.json",
  "files": [],
  "include": [],
  "references": [{ "path": "./tsconfig.src.json" }, { "path": "./tsconfig.test.json" }]
}
```
