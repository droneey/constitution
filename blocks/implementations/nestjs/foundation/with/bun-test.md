# NestJS with Bun test

> Specs of a NestJS program that run on Bun.

## decorator-options-where-bun-reads → compiler-keeps-decorator-metadata
`experimentalDecorators` and `emitDecoratorMetadata` are written in the `tsconfig.json` that `bun test` runs from — the root's in a repository of packages — and not only in a part it extends.

| Why | Check | Tags |
|---|---|---|
| Bun's transpiler follows a single `extends` and ignores an array of them (oven-sh/bun#43097), so through the presets alone a spec runs without the options and fails at its first decorated member, while tsc passes. | review | [] |
