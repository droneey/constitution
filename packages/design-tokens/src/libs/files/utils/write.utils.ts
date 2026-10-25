import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { FileText } from '../types';

/**
 * Writes a file that another build may write or read at the same time so it lands whole: under a
 * fresh name beside it, then renamed over it. A file that already holds the text is left untouched.
 */
const writeWholeWhenChanged = ({ path, text }: FileText): void => {
  if (existsSync(path) && readFileSync(path, 'utf8') === text) {
    return;
  }

  const pending = `${path}.${randomUUID()}.tmp`;

  mkdirSync(dirname(path), {
    recursive: true,
  });
  // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well; the rule asks that it be named
  writeFileSync(pending, text, 'utf8');
  renameSync(pending, path);
};

export { writeWholeWhenChanged };
