import { existsSync, readFileSync } from 'node:fs';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

import { LOCK_FILE } from '../../domain/constants';
import type { LockCommandRepository } from '../../domain/contracts/repositories/commands';
import type { LockRead } from '../../domain/entities';
import { LockReadStatus } from '../../domain/entities';
import { lockOfWire } from './lock-text.utils';
import { lockModel } from './models';

const unparsed: LockRead = {
  status: LockReadStatus.Unparsed,
};

// A lock that is not there is empty; one that cannot be read or does not parse, as a merge's
// conflict leaves it, is unparsed.
const read = (folder: string): LockRead => {
  const path = `${folder}/${LOCK_FILE}`;

  if (!existsSync(path)) {
    return {
      lock: {},
      status: LockReadStatus.Read,
    };
  }

  const text = attempted({
    // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well
    effect: () => readFileSync(path, 'utf8'),
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

const createFileLockRepository = (): LockCommandRepository => ({
  read,
});

export { createFileLockRepository };
