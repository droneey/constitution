import { InvalidValueError } from '#/kernel/errors';
import type { Brand } from '#/kernel/types';

import { SessionValueFailure } from '../../shared/errors';
import { PLAIN_NAME } from '../constants';

type AgentId = Brand<string, 'AgentId'>;

const is = (candidate: unknown): candidate is AgentId =>
  typeof candidate === 'string' && PLAIN_NAME.test(candidate);

/** @throws {InvalidValueError} when the text is no plain name */
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

const AgentId = {
  create,
  is,
} as const;

export { AgentId };
