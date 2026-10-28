import type { Brand } from '#/kernel/types';

import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import { withoutMarkdownExtension } from '../utils';

/** the segments of a page's address under the docs route: at most six slugs, an abstract block's opening with `_` */
type PageSlugs = Brand<readonly string[], 'PageSlugs'>;

const MAX_DEPTH = 6;

const SLUG = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** the overview's name in its Markdown address, `index.md` */
const OVERVIEW_NAME = 'index';

const is = (candidate: unknown): candidate is PageSlugs =>
  Array.isArray(candidate) &&
  candidate.length <= MAX_DEPTH &&
  candidate.every((segment: unknown) => typeof segment === 'string' && SLUG.test(segment));

/** @throws {@link InvalidValueError} when a segment is no slug or there are more than six */
const create = (segments: readonly string[]): PageSlugs => {
  if (!is(segments)) {
    throw new InvalidValueError({
      code: ValueFailure.PageSlugsInvalid,
      details: {
        value: segments.join(PATH_SEPARATOR),
      },
    });
  }

  return segments;
};

/** `core/foundation/code`; undefined when no page can have the address */
const ofAddress = (address: string): PageSlugs | undefined => {
  const segments = address.split(PATH_SEPARATOR).filter((segment) => segment !== '');

  return is(segments) ? segments : undefined;
};

/** `core/foundation/code.md`, and `index.md` for the overview; undefined when no page can have the address */
const ofMarkdownAddress = (address: string): PageSlugs | undefined => {
  const pageAddress = withoutMarkdownExtension(address);

  return ofAddress(pageAddress === OVERVIEW_NAME ? '' : pageAddress);
};

const PageSlugs = {
  create,
  is,
  ofAddress,
  ofMarkdownAddress,
} as const;

export { PageSlugs };
