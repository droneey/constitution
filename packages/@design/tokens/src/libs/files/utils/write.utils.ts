import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

interface FileText {
  readonly path: string;
  readonly text: string;
}

// Why: another build may write or read the file at the same time, so it is written under a fresh
// name beside it and renamed over it to land whole.
const writeWholeWhenChanged = ({ path, text }: FileText): void => {
  if (existsSync(path) && readFileSync(path, 'utf8') === text) {
    return;
  }

  const pendingPath = `${path}.${randomUUID()}.tmp`;

  mkdirSync(dirname(path), {
    recursive: true,
  });

  try {
    // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well; the rule asks that it be named
    writeFileSync(pendingPath, text, 'utf8');
    renameSync(pendingPath, path);
  } finally {
    rmSync(pendingPath, {
      force: true,
    });
  }
};

export { writeWholeWhenChanged };
