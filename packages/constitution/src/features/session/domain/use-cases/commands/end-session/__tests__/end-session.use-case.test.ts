import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { RuleSetHash } from '../../../../value-objects';
import { endSession } from '../end-session.use-case';

const part = AbsolutePath.create(
  '/work/project/.droneey/constitution-sessions/session-1/parts/fedcba9876543210.1.md',
);

describe('endSession', () => {
  it('should remove the parts the session wrote', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    gates.writeParts({
      projectFolderPath: AbsolutePath.create('/work/project'),
      rules: [],
      session: keptSession,
      set: RuleSetHash.create('fedcba9876543210'),
    });

    // Act
    endSession({
      gates,
      session: keptSession,
    });

    // Assert
    expect(
      gates.partOf({
        path: part,
        session: keptSession,
      }),
    ).toBeUndefined();
  });
});
