import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { notingGateWritesOf } from '../../../../../__tests__/gate.fixtures';
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { TreeStateStatus } from '../../../../contracts';
import { DebtKind } from '../../../../entities';
import { AgentId, FileSignature, ToolUseId } from '../../../../value-objects';
import { settleShell } from '../settle-shell.use-case';

const call = ToolUseId.create('toolu_1');
const agent = AgentId.create('agent-1');

const settleOf = (input: {
  after: Readonly<Record<string, string>>;
  isKept: boolean;
  isReadAfter: boolean;
}) => {
  const store = createFakeGateCommandRepository();
  const noted = notingGateWritesOf(store);

  if (input.isKept) {
    store.keepShellTree({
      call,
      session: keptSession,
      tree: {
        fileSignatures: new Map([
          [
            AbsolutePath.create('/work/project/src/a.ts'),
            FileSignature.create('10:1'),
          ],
          [
            AbsolutePath.create('/work/project/src/b.ts'),
            FileSignature.create('20:1'),
          ],
        ]),
        repositoryFolderPath: AbsolutePath.create('/work/project'),
      },
    });
  }

  const changed = settleShell({
    agent,
    call,
    gates: noted.store,
    session: keptSession,
    workingTree: createFakeWorkingTree({
      fileSignatures: input.after,
      ...(input.isReadAfter
        ? {}
        : {
            state: {
              reason: 'git failed',
              status: TreeStateStatus.Failed,
            },
          }),
    }),
  });

  return {
    changed,
    debts: store.debts({
      agent,
      session: keptSession,
    }),
    writes: noted.writes,
  };
};

describe('settleShell', () => {
  it('should owe the rules of each file the command changed, added or removed', () => {
    // Act
    const { debts } = settleOf({
      after: {
        'src/a.ts': '11:2',
        'src/c.ts': '5:2',
      },
      isKept: true,
      isReadAfter: true,
    });

    // Assert
    expect(debts).toStrictEqual([
      {
        kind: DebtKind.Changed,
        path: AbsolutePath.create('/work/project/src/a.ts'),
      },
      {
        kind: DebtKind.Changed,
        path: AbsolutePath.create('/work/project/src/b.ts'),
      },
      {
        kind: DebtKind.Changed,
        path: AbsolutePath.create('/work/project/src/c.ts'),
      },
    ]);
  });

  it.each([
    {
      after: {
        'src/a.ts': '11:2',
      },
      condition: 'git cannot report the tree after the command',
      isKept: true,
      isReadAfter: false,
    },
    {
      after: {
        'src/a.ts': '10:1',
        'src/b.ts': '20:1',
      },
      condition: 'every file kept its signature',
      isKept: true,
      isReadAfter: true,
    },
    {
      after: {
        'src/a.ts': '11:2',
      },
      condition: 'no tree was kept before the command',
      isKept: false,
      isReadAfter: true,
    },
  ])('should owe nothing and write nothing when $condition', ({ after, isKept, isReadAfter }) => {
    // Act
    const settled = settleOf({
      after,
      isKept,
      isReadAfter,
    });

    // Assert
    expect({
      changed: settled.changed,
      writes: settled.writes,
    }).toStrictEqual({
      changed: [],
      writes: [],
    });
  });
});
