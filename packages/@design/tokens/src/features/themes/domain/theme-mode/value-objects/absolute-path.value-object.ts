import { isAbsolute } from 'node:path';

import { RelativePathError } from '../errors';

declare const brand: unique symbol;

type AbsolutePath = string & {
  readonly [brand]: 'AbsolutePath';
};

const is = (candidate: unknown): candidate is AbsolutePath =>
  typeof candidate === 'string' && isAbsolute(candidate);

/** @throws {RelativePathError} when the text is no absolute path */
const create = (text: string): AbsolutePath => {
  if (!is(text)) {
    throw new RelativePathError(text);
  }

  return text;
};

const AbsolutePath = {
  create,
  is,
} as const;

export { AbsolutePath };
