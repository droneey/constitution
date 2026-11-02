import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { hexadecimalDigest } from '../../shared/constants';
import { SessionValueFailure } from '../../shared/errors';

type RefusalKey = Brand<string, 'RefusalKey'>;

const RefusalKey: PatternedText<'RefusalKey'> = patternedTextOf({
  code: SessionValueFailure.RefusalKey,
  pattern: hexadecimalDigest,
});

export { RefusalKey };
