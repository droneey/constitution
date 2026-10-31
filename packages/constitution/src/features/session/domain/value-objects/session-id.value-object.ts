import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { PLAIN_NAME } from '../constants';
import { SessionValueFailure } from '../errors';

type SessionId = Brand<string, 'SessionId'>;

const SessionId: PatternedText<'SessionId'> = patternedTextOf({
  code: SessionValueFailure.SessionId,
  pattern: PLAIN_NAME,
});

export { SessionId };
