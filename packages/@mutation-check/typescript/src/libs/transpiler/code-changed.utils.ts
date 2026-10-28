import { recognise } from '#/libs/errors';

import { loaderOf } from './imports.utils.ts';

interface HasCodeChangedInput {
  readonly after: string;
  readonly before?: string;
  readonly filePath: string;
}

const NO_CODE = '';

// Why: Bun throws one BuildMessage for a text it cannot parse, or an AggregateError gathering
// several.
const isTranspileFailure = (caught: unknown): boolean =>
  // Stryker disable next-line ConditionalExpression: no text makes the transpiler throw anything else
  caught instanceof BuildMessage || caught instanceof AggregateError;

// Why: a change that only reformats leaves the transpiled code as it was, so it needs no mutants; a
// file Bun cannot transpile, by its extension or its text, counts as changed so it is never left out.
const hasCodeChanged = (input: HasCodeChangedInput): boolean => {
  const loader = loaderOf(input.filePath);

  if (loader === undefined) {
    return true;
  }

  const transpiler = new Bun.Transpiler({
    loader,
  });

  try {
    return (
      (input.before === undefined ? NO_CODE : transpiler.transformSync(input.before)) !==
      transpiler.transformSync(input.after)
    );
  } catch (error) {
    recognise({
      caught: error,
      isRecognised: isTranspileFailure,
    });

    return true;
  }
};

export { hasCodeChanged };
