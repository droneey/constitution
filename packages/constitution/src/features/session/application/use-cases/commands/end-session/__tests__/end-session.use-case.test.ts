import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeGateRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { RuleSetHash } from '../../../../../domain/gate/value-objects';
import { endSession } from '../end-session.use-case';

const part = AbsolutePath.create(
  '/work/project/.droneey/constitution-sessions/session-1/parts/fedcba9876543210.1.md',
);

describe('endSession', () => {
  it('should remove the parts the session wrote', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    gateRepository.writeParts({
      projectFolderPath: AbsolutePath.create('/work/project'),
      rules: [],
      session: keptSession,
      set: RuleSetHash.create('fedcba9876543210'),
    });

    // Act
    endSession({
      gateRepository,
      session: keptSession,
    });

    // Assert
    expect(
      gateRepository.partOf({
        path: part,
        session: keptSession,
      }),
    ).toBeUndefined();
  });
});
