import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';

import { SessionValueFailure } from '../errors';

/** A working tree's fingerprint as a session's mark keeps it: one line, never empty. */
type TreeFingerprint = Brand<string, 'TreeFingerprint'>;

const ONE_LINE = /^[^\n\r]+$/;

const is = (candidate: unknown): candidate is TreeFingerprint =>
  typeof candidate === 'string' && ONE_LINE.test(candidate);

/** @throws {@link InvalidValueError} when the text is empty or breaks a line */
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
