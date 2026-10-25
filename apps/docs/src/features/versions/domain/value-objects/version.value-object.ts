import type { Brand } from '#/kernel/types';

import { VersionError } from '../errors';

type Version = Brand<string, 'Version'>;

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const is = (candidate: unknown): candidate is Version =>
  typeof candidate === 'string' && VERSION_PATTERN.test(candidate);

/** @throws {@link VersionError} when the text is no `<major>.<minor>.<patch>` */
const create = (text: string): Version => {
  if (!is(text)) {
    throw new VersionError({
      text,
    });
  }

  return text;
};

const Version = {
  create,
  is,
} as const;

export { Version };
