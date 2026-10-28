import { readFileSync } from 'node:fs';

import type { ZodType } from 'zod';

import { isSystemError } from '#/libs/system-error';

interface ReadModelFileInput<TModel> {
  readonly model: ZodType<TModel>;
  readonly parse: (text: string) => unknown;
  readonly path: string;
}

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
