# NestJS with Bun test

> Specs of a NestJS program that run on Bun.

## decorator-options-where-bun-reads → compiler-keeps-decorator-metadata
`experimentalDecorators` and `emitDecoratorMetadata` are written in the `tsconfig.json` of the folder `bun test` runs from — a unit's own when its specs run from its folder — and not only in a part it extends.

| Why | Check | Tags |
|---|---|---|
| Bun takes its transpiler's options from the `tsconfig.json` of the folder it runs in, not from the one nearest each file, and follows a single `extends` but ignores an array of them (oven-sh/bun#43097), so a spec run elsewhere, or through the presets alone, runs without the options and fails at its first decorated member, while tsc passes. | review | [] |
