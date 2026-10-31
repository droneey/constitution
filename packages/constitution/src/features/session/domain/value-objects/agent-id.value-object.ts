import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { PLAIN_NAME } from '../constants';
import { SessionValueFailure } from '../errors';

type AgentId = Brand<string, 'AgentId'>;

const AgentId: PatternedText<'AgentId'> = patternedTextOf({
  code: SessionValueFailure.AgentId,
  pattern: PLAIN_NAME,
});

export { AgentId };
