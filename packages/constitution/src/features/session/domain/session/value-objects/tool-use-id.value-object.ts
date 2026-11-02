import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { SessionValueFailure } from '../../shared/errors';
import { PLAIN_NAME } from '../constants';

type ToolUseId = Brand<string, 'ToolUseId'>;

const ToolUseId: PatternedText<'ToolUseId'> = patternedTextOf({
  code: SessionValueFailure.ToolUseId,
  pattern: PLAIN_NAME,
});

export { ToolUseId };
