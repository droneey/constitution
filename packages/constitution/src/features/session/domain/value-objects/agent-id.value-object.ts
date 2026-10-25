import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';

import { PLAIN_NAME } from '../constants';
import { SessionValueFailure } from '../errors';

type AgentId = Brand<string, 'AgentId'>;

const is = (candidate: unknown): candidate is AgentId =>
  typeof candidate === 'string' && PLAIN_NAME.test(candidate);

/** @throws {@link InvalidValueError} when the text is no plain name */
const create = (text: string): AgentId => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: SessionValueFailure.AgentId,
      details: {
        text,
      },
    });
  }

  return text;
};

const equals = (left: AgentId, right: AgentId): boolean => left === right;

const AgentId = {
  create,
  equals,
  is,
} as const;

export { AgentId };
