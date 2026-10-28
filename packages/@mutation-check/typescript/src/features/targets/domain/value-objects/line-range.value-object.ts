import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';

import { TargetsValueFailure } from '../errors';

interface LineBounds {
  readonly endLine: number;
  readonly startLine: number;
}

/** Lines of a file, counted from one, both ends included. */
type LineRange = Brand<LineBounds, 'LineRange'>;

const FIRST_LINE = 1;

const isLineRange = (bounds: LineBounds): bounds is LineRange =>
  Number.isInteger(bounds.startLine) &&
  Number.isInteger(bounds.endLine) &&
  bounds.startLine >= FIRST_LINE &&
  bounds.endLine >= bounds.startLine;

/** @throws InvalidValueError when the range does not run forward from line one or later */
const create = (bounds: LineBounds): LineRange => {
  if (!isLineRange(bounds)) {
    throw new InvalidValueError({
      code: TargetsValueFailure.LineRange,
      text: `${bounds.startLine}-${bounds.endLine}`,
    });
  }

  return bounds;
};

const LineRange = {
  create,
} as const;

export { LineRange };
