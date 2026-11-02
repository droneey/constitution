import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { GateCause, GateCauseKind } from '../gate-cause.entity';

describe('GateCause.keyOf', () => {
  it.each([
    {
      cause: {
        kind: GateCauseKind.Failed,
        reason: 'git failed',
      },
      condition: 'git failed',
      key: '{"kind":"failed","reason":"git failed"}',
    },
    {
      cause: {
        folder: AbsolutePath.create('/work/project'),
        kind: GateCauseKind.Unwritable,
      },
      condition: 'the parts folder cannot be written',
      key: '{"folder":"/work/project","kind":"unwritable"}',
    },
  ] as const)('should key the cause by all it holds when $condition', ({ cause, key }) => {
    // Act
    const keyed = GateCause.keyOf(cause);

    // Assert
    expect(keyed).toBe(key);
  });
});
