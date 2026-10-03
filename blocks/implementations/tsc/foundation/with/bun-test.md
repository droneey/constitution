# tsc with Bun test

> Specs that run on Bun inside a program that does not.

## specs-checked-by-their-own-config → compiler-is-the-type-gate
Where the program's configuration gives no Bun types — a browser program — the specs and their fixtures are checked by `tsconfig.test.json`, which extends it, adds `types: ["bun"]` and includes only `__tests__/` and `tests/`; the main configuration leaves them out, and the type check runs both.

| Why | Check | Tags |
|---|---|---|
| one configuration cannot give the specs Bun's globals and keep them out of the code that ships to a browser. | review | [] |
