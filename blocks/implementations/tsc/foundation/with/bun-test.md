# tsc with Bun test

> Specs that run on Bun inside a program that does not.

### specs-checked-by-their-own-config → compiler-is-the-type-gate
Where the program's configuration gives no Bun types — a browser program — it is `tsconfig.src.json`, which leaves the specs out, and the specs and their fixtures are checked by `tsconfig.test.json`, which extends it, adds `types: ["bun"]`, includes only `__tests__/` and `tests/`, and references `tsconfig.src.json` where that is `composite`, as a unit of a workspace is. `tsconfig.json` extends `tsconfig.src.json`, holds no files (`files` and `include` empty) and references both.

| Why | Tags |
|---|---|
| one configuration cannot give the specs Bun's globals and keep them out of the code that ships to a browser; an editor reads only `tsconfig.json`, and through its references opens each file with its own configuration; Bun's transpiler reads only `tsconfig.json` too, and without them a spec loses the program's transpiler options, such as its decorators; a `composite` project must list every file it compiles, so the specs reach the program's files through its declarations, by the reference, or fail with TS6307. | [] |
