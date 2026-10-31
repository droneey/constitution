import { randomUUID } from 'node:crypto';
import { closeSync, constants, openSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

import { attempted } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

const PRIVATE_FILE_MODE = 0o600;

interface OpenInput {
  readonly flags: number;
  readonly path: string;
}

// Why: a try and finally, not `using`: constitution.yaml lowers scoped-resource-held-by-using here.
// The mode applies only to a file the open makes; one that exists keeps its own.
const withOpened = <TOutcome>(
  input: OpenInput,
  work: (descriptor: number) => TOutcome,
): TOutcome => {
  const descriptor = openSync(input.path, input.flags, PRIVATE_FILE_MODE);

  try {
    return work(descriptor);
  } finally {
    closeSync(descriptor);
  }
};

interface FileText {
  readonly path: string;
  readonly text: string;
}

type OpenedWrite = FileText & OpenInput;

const readUnfollowed = (path: string): string | undefined =>
  attempted({
    effect: () =>
      withOpened(
        {
          flags: constants.O_RDONLY | constants.O_NOFOLLOW,
          path,
        },
        // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well; the rule asks that it be named
        (descriptor) => readFileSync(descriptor, 'utf8'),
      ),
    isRecognised: isSystemError,
  });

const writeOpened = (input: OpenedWrite): void => {
  withOpened(input, (descriptor) => {
    // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well; the rule asks that it be named
    writeFileSync(descriptor, input.text, 'utf8');
  });
};

const appendPrivately = (input: FileText): void => {
  writeOpened({
    ...input,
    flags: constants.O_WRONLY | constants.O_APPEND | constants.O_CREAT | constants.O_NOFOLLOW,
  });
};

// Why: another hook may read the file, so it lands whole: written private beside it, under a fresh
// name no file or link holds yet, then renamed over it.
const writeWhole = (input: FileText): void => {
  const pending = `${input.path}.${randomUUID()}.tmp`;

  writeOpened({
    flags: constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    path: pending,
    text: input.text,
  });
  renameSync(pending, input.path);
};

const writeOrDrop = (write: () => void): void => {
  attempted({
    effect: write,
    isRecognised: isSystemError,
  });
};

export { appendPrivately, readUnfollowed, writeOrDrop, writeWhole };
