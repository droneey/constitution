import { expect } from 'bun:test';

import type { ProjectWarning, WarningCode } from '#/kernel/entities';

interface WarningFixture {
  code: WarningCode;
  // The parts of the message the case proves, such as the id, the key or the file it names.
  names?: readonly string[] | undefined;
}

/** whatever its wording, the message is never empty and names each of `names` */
const warningOf = (input: WarningFixture): ProjectWarning => ({
  code: input.code,
  message: expect.stringMatching(
    new RegExp(
      `^${(input.names ?? []).map((name) => `(?=[\\s\\S]*${RegExp.escape(name)})`).join('')}[\\s\\S]`,
    ),
  ),
});

export { warningOf };
