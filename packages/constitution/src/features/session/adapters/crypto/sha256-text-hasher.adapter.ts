import { createHash } from 'node:crypto';

import type { TextHasher } from '../../domain/contracts';

// Why: 64 bits of SHA-256 tell apart the few thousand rules a project reads, and keep the files
// short.
const HASH_LENGTH = 16;

const createSha256TextHasher = (): TextHasher => ({
  hashOf: (text: string): string =>
    // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well; the rule asks that it be named
    createHash('sha256').update(text, 'utf8').digest('hex').slice(0, HASH_LENGTH),
});

export { createSha256TextHasher };
