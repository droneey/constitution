import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { SessionValueFailure } from '../../shared/errors';
import { PLAIN_NAME } from '../constants';

type SessionId = Brand<string, 'SessionId'>;

const SessionId: PatternedText<'SessionId'> = patternedTextOf({
  code: SessionValueFailure.SessionId,
  pattern: PLAIN_NAME,
});

export { SessionId };
