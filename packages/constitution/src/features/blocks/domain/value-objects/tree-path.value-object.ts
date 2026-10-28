import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';
import { isInnerPath } from '#/kernel/utils';

import { BlockValueFailure } from '../errors';

/**
 * A file's path from the root of the tree that lists it — the folder checked, its repository or an
 * unpacked release — written one way.
 */
type TreePath = Brand<string, 'TreePath'>;

const is = (candidate: unknown): candidate is TreePath =>
  typeof candidate === 'string' && candidate !== '' && isInnerPath(candidate);

/** @throws {@link InvalidValueError} when the text is empty, absolute, not written one way, or leaves the root */
const create = (text: string): TreePath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: BlockValueFailure.TreePath,
      details: {
        text,
      },
    });
  }

  return text;
};

const TreePath = {
  create,
  is,
} as const;

export { TreePath };
