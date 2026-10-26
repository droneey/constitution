import { loaderOf } from './imports.ts';

interface CodeChangedInput {
  readonly after: string;
  readonly before: string;
  // the file's path, whose extension names its loader
  readonly path: string;
}

// A change that only reformats leaves the transpiled code as it was; a file Bun cannot transpile
// counts as changed.
const codeChanged = (input: CodeChangedInput): boolean => {
  const loader = loaderOf(input.path);

  if (loader === undefined) {
    return true;
  }

  const transpiler = new Bun.Transpiler({
    loader,
  });

  return transpiler.transformSync(input.before) !== transpiler.transformSync(input.after);
};

export type { CodeChangedInput };
export { codeChanged };
