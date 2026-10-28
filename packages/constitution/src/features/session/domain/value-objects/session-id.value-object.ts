import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';

import { PLAIN_NAME } from '../constants';
import { SessionValueFailure } from '../errors';

type SessionId = Brand<string, 'SessionId'>;

const is = (candidate: unknown): candidate is SessionId =>
  typeof candidate === 'string' && PLAIN_NAME.test(candidate);

/** @throws {@link InvalidValueError} when the text is no plain name */
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
