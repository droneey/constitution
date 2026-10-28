import { readFileSync } from 'node:fs';

import type { ZodType } from 'zod';

import { isSystemError } from '#/libs/system-error';

interface ReadModelFileInput<TModel> {
  readonly model: ZodType<TModel>;
  /** the file's text as data; throws a SyntaxError on text of no form it reads */
  readonly parse: (text: string) => unknown;
  readonly path: string;
}

/**
 * The file's data as the model reads it; undefined when the file is missing, unreadable or
 * unparsed, or its data is not of the model's shape.
 */
const readModelFile = <TModel>(input: ReadModelFileInput<TModel>): TModel | undefined => {
  let parsed: unknown;

  try {
    parsed = input.parse(readFileSync(input.path, 'utf8'));
  } catch (error) {
    if (!(isSystemError(error) || error instanceof SyntaxError)) {
      throw error;
    }
  }

  const read = input.model.safeParse(parsed);

  return read.success ? read.data : undefined;
};

export type { ReadModelFileInput };
export { readModelFile };
