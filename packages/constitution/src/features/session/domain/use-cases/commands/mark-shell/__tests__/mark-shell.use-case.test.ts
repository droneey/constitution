import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { TreeStateStatus } from '../../../../contracts';
import { FileSignature, ToolUseId } from '../../../../value-objects';
import { markShell } from '../mark-shell.use-case';

const call = ToolUseId.create('toolu_1');

const markOf = (input: { cwd: string; failed?: boolean }) => {
  const gates = createFakeGateCommandRepository();

  markShell({
    call,
    folderRunIn: AbsolutePath.create(input.cwd),
    gates,
    session: keptSession,
    source: createFakeActiveRulesSource(),
    workingTree: createFakeWorkingTree({
      fileSignatures: {
        'src/a.ts': '10:1',
      },
      ...(input.failed === true
        ? {
            state: {
              reason: 'git failed',
              status: TreeStateStatus.Failed,
            },
          }
        : {}),
    }),
  });

  return gates.takeShellTree({
    call,
    session: keptSession,
  });
};

describe('markShell', () => {
  it('should keep the tree of the project the command runs in, by its call', () => {
    // Act
    const kept = markOf({
      cwd: '/work/project/src',
    });

    // Assert
    expect(kept).toStrictEqual({
      fileSignatures: new Map([
        [
          AbsolutePath.create('/work/project/src/a.ts'),
          FileSignature.create('10:1'),
        ],
      ]),
      repositoryFolderPath: AbsolutePath.create('/work/project'),
    });
  });

  it.each([
    {
      condition: 'the command runs in no project',
      cwd: '/tmp',
      failed: false,
    },
    {
      condition: 'git cannot report the tree',
      cwd: '/work/project',
      failed: true,
    },
  ])('should keep nothing when $condition', ({ cwd, failed }) => {
    // Act
    const kept = markOf({
      cwd,
      failed,
    });

    // Assert
    expect(kept).toBeUndefined();
  });
});
