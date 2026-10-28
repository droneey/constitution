import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';

import { SessionValueFailure } from '../errors';

type TreeFingerprint = Brand<string, 'TreeFingerprint'>;

const ONE_LINE = /^[^\n\r]+$/;

const is = (candidate: unknown): candidate is TreeFingerprint =>
  typeof candidate === 'string' && ONE_LINE.test(candidate);

/** @throws {InvalidValueError} when the text is empty or breaks a line */
const create = (text: string): TreeFingerprint => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: SessionValueFailure.TreeFingerprint,
      details: {
        text,
      },
    });
  }

  return text;
};

const TreeFingerprint = {
  create,
  is,
} as const;

export { TreeFingerprint };
