import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';

import { SessionValueFailure } from '../../shared/errors';
import { PLAIN_NAME } from '../constants';

type SessionId = Brand<string, 'SessionId'>;

const is = (candidate: unknown): candidate is SessionId =>
  typeof candidate === 'string' && PLAIN_NAME.test(candidate);

/** @throws {InvalidValueError} when the text is no plain name */
const create = (text: string): SessionId => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: SessionValueFailure.SessionId,
      details: {
        text,
      },
    });
  }

  return text;
};

const SessionId = {
  create,
  is,
} as const;

export { SessionId };
