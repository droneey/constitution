# Transpiler

> Governs the compiler options Bun's transpiler reads.

## General

### transpiler-options-where-bun-reads · MUST

The compiler options Bun's transpiler must apply — such as `experimentalDecorators` and `emitDecoratorMetadata` where the program's decorators need them — are written in the `tsconfig.json` of the folder Bun runs from, a unit's own when its specs run from its folder, and not only in a part it extends.

| Why | Tags |
|---|---|
| Bun takes its transpiler's options from the `tsconfig.json` of the folder it runs in, not from the one nearest each file, and follows a single `extends` but ignores an array of them (oven-sh/bun#43097), so code run elsewhere, or through the presets alone, runs without the options and fails at its first decorated member. | [errors] |
