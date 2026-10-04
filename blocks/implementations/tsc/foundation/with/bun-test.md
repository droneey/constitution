# tsc with Bun test

> Specs that run on Bun inside a program that does not.

## specs-checked-by-their-own-config → compiler-is-the-type-gate
Where the program's configuration gives no Bun types — a browser program — it is `tsconfig.src.json`, which leaves the specs out, and the specs and their fixtures are checked by `tsconfig.test.json`, which extends it, adds `types: ["bun"]` and includes only `__tests__/` and `tests/`. `tsconfig.json` extends `tsconfig.src.json`, holds no files (`files` and `include` empty) and references both, and the type check runs both.

| Why | Check | Tags |
|---|---|---|
| one configuration cannot give the specs Bun's globals and keep them out of the code that ships to a browser; an editor reads only `tsconfig.json`, and through its references opens each file with its own configuration; Bun's transpiler reads only `tsconfig.json` too, and without them a spec loses the program's transpiler options, such as its decorators. | review | [] |
