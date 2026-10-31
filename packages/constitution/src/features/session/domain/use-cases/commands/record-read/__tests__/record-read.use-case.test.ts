import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import { notingGateWritesOf, StoreWrite } from '../../../../../__tests__/gate.fixtures';
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import type { AgentInSession, RuleDebt } from '../../../../entities';
import { DebtKind, SessionAgent } from '../../../../entities';
import { RuleHash, RuleSetHash } from '../../../../value-objects';
import type { ReadRange } from '../record-read.use-case';
import { recordRead } from '../record-read.use-case';

const rule = {
  hash: RuleHash.create('0123456789abcdef'),
  slug: RuleSlug.create('name-reveals-intent'),
};

const readDebt: RuleDebt = {
  kind: DebtKind.Read,
  path: AbsolutePath.create('/work/project/src/a.ts'),
};
const otherDebt: RuleDebt = {
  kind: DebtKind.Read,
  path: AbsolutePath.create('/work/project/src/b.ts'),
};
const changedDebt: RuleDebt = {
  kind: DebtKind.Changed,
  path: AbsolutePath.create('/work/project/src/a.ts'),
};

const part = AbsolutePath.create(
  '/work/project/.droneey/constitution-sessions/session-1/parts/fedcba9876543210.1.md',
);

const storeOf = () => {
  const store = createFakeGateCommandRepository();

  store.writeParts({
    projectFolderPath: AbsolutePath.create('/work/project'),
    rules: [
      {
        ...rule,
        file: AbsolutePath.create('/work/project/names.md'),
        level: Level.Must,
        statement: 'A name reveals intent.',
        why: 'Readers.',
      },
    ],
    session: keptSession,
    set: RuleSetHash.create('fedcba9876543210'),
  });

  return store;
};

const recordOf = (input: {
  links?: Readonly<Record<string, AbsolutePath>>;
  path: AbsolutePath;
  range?: ReadRange;
}) => {
  const store = storeOf();

  recordRead({
    agent: SessionAgent.main,
    gates: store,
    path: input.path,
    range: input.range ?? {},
    session: keptSession,
    source: createFakeActiveRulesSource({
      links: input.links ?? {},
    }),
  });

  return {
    debts: store.debts({
      agent: SessionAgent.main,
      session: keptSession,
    }),
    read: store.rulesRead({
      agent: SessionAgent.main,
      session: keptSession,
    }),
  };
};

describe('recordRead', () => {
  it.each<{
    condition: string;
    range: ReadRange;
  }>([
    {
      condition: 'it names no range',
      range: {},
    },
    {
      condition: 'it starts at line 1 and reaches the last',
      range: {
        limit: 8,
        offset: 1,
      },
    },
  ])('should record the rules of a part read whole when $condition', ({ range }) => {
    // Act
    const recorded = recordOf({
      path: part,
      range,
    });

    // Assert
    expect(recorded).toStrictEqual({
      debts: [],
      read: new Map([
        [
          rule.slug,
          new Set([
            rule.hash,
          ]),
        ],
      ]),
    });
  });

  it.each<{
    condition: string;
    range: ReadRange;
  }>([
    {
      condition: 'it starts after line 1',
      range: {
        offset: 2,
      },
    },
    {
      condition: 'it stops before the last line',
      range: {
        limit: 7,
      },
    },
  ])('should record nothing of a part when $condition', ({ range }) => {
    // Act
    const recorded = recordOf({
      path: part,
      range,
    });

    // Assert
    expect(recorded).toStrictEqual({
      debts: [],
      read: new Map(),
    });
  });

  it.each<{
    condition: string;
    debts: readonly RuleDebt[];
    owed: readonly RuleDebt[];
    writes: readonly StoreWrite[];
  }>([
    {
      condition: 'the agent owes nothing yet',
      debts: [
        readDebt,
      ],
      owed: [],
      writes: [
        StoreWrite.AddDebts,
      ],
    },
    {
      condition: 'the agent owes the rules of another file',
      debts: [
        otherDebt,
        readDebt,
      ],
      owed: [
        otherDebt,
      ],
      writes: [
        StoreWrite.AddDebts,
      ],
    },
    {
      condition: 'a command changed the file',
      debts: [
        changedDebt,
        readDebt,
      ],
      owed: [
        changedDebt,
      ],
      writes: [
        StoreWrite.AddDebts,
      ],
    },
    {
      condition: 'the agent owes its rules already',
      debts: [
        readDebt,
      ],
      owed: [
        readDebt,
      ],
      writes: [],
    },
  ])(
    'should owe the rules of a file of the project once when $condition',
    ({ debts, owed, writes }) => {
      // Arrange
      const store = storeOf();
      const agent: AgentInSession = {
        agent: SessionAgent.main,
        session: keptSession,
      };

      store.addDebts({
        ...agent,
        debts: owed,
      });

      const noted = notingGateWritesOf(store);

      // Act
      recordRead({
        ...agent,
        gates: noted.store,
        path: readDebt.path,
        range: {},
        source: createFakeActiveRulesSource(),
      });

      // Assert
      expect({
        debts: store.debts(agent),
        writes: noted.writes,
      }).toStrictEqual({
        debts,
        writes,
      });
    },
  );

  it.each([
    {
      condition: 'a file in no project',
      debts: [],
      path: '/tmp/notes.txt',
    },
    {
      condition: "a rule file of the project's release",
      debts: [],
      path: '/work/project/.droneey/constitution/blocks/core/core.md',
    },
    {
      condition: "a link into the project's release",
      debts: [],
      path: '/work/project/rules.md',
    },
    {
      condition: "a file reached through the release's folder that lies elsewhere in the project",
      debts: [],
      path: '/work/project/.droneey/constitution/blocks/ui/ui.md',
    },
    {
      condition: 'a part the gate wrote for another session',
      debts: [],
      path: '/work/project/.droneey/constitution-sessions/other/parts/0123456789abcdef.1.md',
    },
    {
      condition: 'another file of the droneey folder, owing its rules',
      debts: [
        {
          kind: DebtKind.Read,
          path: AbsolutePath.create('/work/project/.droneey/kit/notes.md'),
        },
      ],
      path: '/work/project/.droneey/kit/notes.md',
    },
  ])('should owe what the gate asks for when the agent reads $condition', ({ debts, path }) => {
    // Act
    const recorded = recordOf({
      links: {
        '/work/project/.droneey/constitution/blocks/ui/ui.md': AbsolutePath.create(
          '/work/project/packages/constitution/blocks/ui/ui.md',
        ),
        '/work/project/rules.md': AbsolutePath.create(
          '/work/project/.droneey/constitution/blocks/core/core.md',
        ),
      },
      path: AbsolutePath.create(path),
    });

    // Assert
    expect(recorded.debts).toStrictEqual(debts);
  });
});
