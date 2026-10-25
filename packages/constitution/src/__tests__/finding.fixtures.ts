import { expect } from 'bun:test';

import type { Finding } from '#/kernel/types';

interface FindingFixture {
  code: string;
  // The parts of the message the case proves, such as the id or the slug it names.
  names?: readonly string[] | undefined;
  path: string;
}

/** whatever its wording, the message is never empty and names each of `names` */
const findingOf = (input: FindingFixture): Finding => ({
  code: input.code,
  message: expect.stringMatching(
    new RegExp(
      `^${(input.names ?? []).map((name) => `(?=[\\s\\S]*${RegExp.escape(name)})`).join('')}[\\s\\S]`,
    ),
  ),
  path: input.path,
});

export { findingOf };
