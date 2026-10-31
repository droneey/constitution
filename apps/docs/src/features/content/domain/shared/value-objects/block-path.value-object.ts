import type { Brand } from '#/kernel/types';

import { MARKDOWN_EXTENSION, PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';

type BlockPath = Brand<string, 'BlockPath'>;

const is = (candidate: unknown): candidate is BlockPath =>
  typeof candidate === 'string' &&
  !candidate.startsWith(PATH_SEPARATOR) &&
  candidate.endsWith(MARKDOWN_EXTENSION);

/** @throws {InvalidValueError} when the text opens with "/" or names no Markdown file */
const create = (text: string): BlockPath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.BlockPathInvalid,
      details: {
        value: text,
      },
    });
  }

  return text;
};

const BlockPath = {
  create,
  is,
} as const;

export { BlockPath };
