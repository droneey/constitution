import { existsSync, readFileSync } from 'node:fs';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import { LOCK_FILE_NAME } from '../../domain/constants';
import type { LockQueryRepository } from '../../domain/contracts/repositories/queries';
import type { LockRead } from '../../domain/entities';
import { LockReadStatus } from '../../domain/entities';
import { lockOfWire } from './lock-text.utils';
import { lockModel } from './models';

const unparsed: LockRead = {
  status: LockReadStatus.Unparsed,
};

// A lock that is not there is empty; one that cannot be read or does not parse, as a merge's
// conflict leaves it, is unparsed.
const read = (unitFolderPath: AbsolutePath): LockRead => {
  const lockFilePath = AbsolutePath.join(unitFolderPath, LOCK_FILE_NAME);

  if (!existsSync(lockFilePath)) {
    return {
      lock: {},
      status: LockReadStatus.Read,
    };
  }

  const text = attempted({
    // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well
    effect: () => readFileSync(lockFilePath, 'utf8'),
    isRecognised: isSystemError,
  });
  const parsed =
    // Stryker disable next-line ConditionalExpression: a lock left unread parses as no JSON either
    text === undefined
      ? undefined
      : lockModel.safeParse(
          attempted<unknown>({
            effect: () => JSON.parse(text),
            isRecognised: isSyntaxError,
          }),
        );

  return parsed?.success === true
    ? {
        lock: lockOfWire(parsed.data),
        status: LockReadStatus.Read,
      }
    : unparsed;
};

const createFileLockRepository = (): LockQueryRepository => ({
  read,
});

export { createFileLockRepository };
