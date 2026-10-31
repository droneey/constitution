import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { ONE_LINE } from '../constants';
import { SessionValueFailure } from '../errors';

type FileSignature = Brand<string, 'FileSignature'>;

const FileSignature: PatternedText<'FileSignature'> = patternedTextOf({
  code: SessionValueFailure.FileSignature,
  pattern: ONE_LINE,
});

export { FileSignature };
