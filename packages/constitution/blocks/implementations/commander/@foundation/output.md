# Output

> Governs where commander writes its help and its errors.

## General

### commander-output-through-the-programs-writers → shared-resource-has-one-writer · MUST

commander writes only through the program's writers. The program gives them through `configureOutput`, as `writeOut`, `writeErr` and `outputError`, so commander writes nothing to a standard stream itself.

#### Why

Commander writes its help and errors straight to the process's streams unless told otherwise, beside the program's own writer of the same stream, so the two interleave in an order nobody chose and a spec cannot read commander's part.

#### Examples

```ts title="Avoid"
// src/root/program.ts
export const createProgram = (): Command => new Command('shop').exitOverride();
```

```ts title="Prefer"
// src/root/program.ts
export const createProgram = ({ terminal }: ShopDependencies): Command =>
  new Command('shop')
    .exitOverride()
    .configureOutput({
      writeOut: (text) => terminal.out(text),
      writeErr: (text) => terminal.err(text),
      outputError: (text, write) => write(terminal.styleError(text)),
    });
```
