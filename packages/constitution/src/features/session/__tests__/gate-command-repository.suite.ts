import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type { GateCommandRepository, PartInput } from '../domain/contracts/repositories/commands';
import type { GatedRule, RuleDebt, SessionAgent } from '../domain/entities';
import { SessionAgent as Agents, DebtKind, GateEntryKind } from '../domain/entities';
import {
  AgentId,
  FileSignature,
  RefusalKey,
  RuleHash,
  RuleSetHash,
  SessionId,
  ToolUseId,
} from '../domain/value-objects';

interface GateCommandRepositorySuiteInput {
  readonly name: string;
  readonly projectOf: () => AbsolutePath;
  readonly repositoryOf: () => GateCommandRepository;
}

const session = SessionId.create('gate-session');
const agent = AgentId.create('agent-7');
const set = RuleSetHash.create('00112233445566778899aabbccddeeff');
const key = RefusalKey.create('ffeeddccbbaa99887766554433221100');
const call = ToolUseId.create('toolu_1');

const ruleOf = (slug: string, hash: string): GatedRule => ({
  file: AbsolutePath.create('/work/blocks/core/foundation/names.md'),
  hash: RuleHash.create(hash),
  level: Level.Must,
  lowered: {
    level: Level.May,
    reason: 'generated names',
  },
  slug: RuleSlug.create(slug),
  statement: 'A name reveals intent.',
  why: 'Readers learn from names.',
});

const namesRule = ruleOf('name-reveals-intent', '0123456789abcdef');
const functionsRule = ruleOf('function-does-one-thing', 'fedcba9876543210');
const rules = [
  namesRule,
  functionsRule,
];

const firstPartIn = (project: AbsolutePath): AbsolutePath =>
  AbsolutePath.create(
    `${project}/.droneey/constitution-sessions/gate-session/parts/00112233445566778899aabbccddeeff.1.md`,
  );

const read: RuleDebt = {
  kind: DebtKind.Read,
  path: AbsolutePath.create('/work/src/a.ts'),
};
const changed: RuleDebt = {
  kind: DebtKind.Changed,
  path: AbsolutePath.create('/work/src/b.ts'),
};

const tree = {
  fileSignatures: new Map([
    [
      AbsolutePath.create('/work/src/a.ts'),
      FileSignature.create('10:1'),
    ],
  ]),
  repositoryFolderPath: AbsolutePath.create('/work'),
};

const runGateCommandRepositorySuite = (input: GateCommandRepositorySuiteInput): void => {
  describe(`${input.name}: the gate repository contract`, () => {
    it('should read back the rules an agent read', () => {
      // Arrange
      const gates = input.repositoryOf();

      gates.addRulesRead({
        agent: Agents.main,
        rules,
        session,
      });

      // Act
      const known = gates.rulesRead({
        agent: Agents.main,
        session,
      });

      // Assert
      expect(known).toStrictEqual(
        new Map([
          [
            RuleSlug.create('name-reveals-intent'),
            new Set([
              RuleHash.create('0123456789abcdef'),
            ]),
          ],
          [
            RuleSlug.create('function-does-one-thing'),
            new Set([
              RuleHash.create('fedcba9876543210'),
            ]),
          ],
        ]),
      );
    });

    it.each<{
      asked: SessionAgent;
      condition: string;
      expected: number;
    }>([
      {
        asked: Agents.main,
        condition: 'the agent whose context started afresh',
        expected: 0,
      },
      {
        asked: agent,
        condition: 'another agent',
        expected: 1,
      },
    ])(
      'should read $expected rules read, after the main context starts afresh, for $condition',
      ({ asked, expected }) => {
        // Arrange
        const gates = input.repositoryOf();

        gates.addRulesRead({
          agent: Agents.main,
          rules: [
            namesRule,
          ],
          session,
        });
        gates.addRulesRead({
          agent,
          rules: [
            namesRule,
          ],
          session,
        });
        gates.resetReading({
          agent: Agents.main,
          session,
        });

        // Act
        const known = gates.rulesRead({
          agent: asked,
          session,
        });

        // Assert
        expect(known.size).toBe(expected);
      },
    );

    it.each<{
      asked: SessionAgent;
      condition: string;
      expected: readonly AbsolutePath[];
      reset: (gates: GateCommandRepository) => void;
    }>([
      {
        asked: Agents.main,
        condition: 'it was shown them',
        expected: [
          read.path,
        ],
        reset: () => undefined,
      },
      {
        asked: Agents.main,
        condition: 'its context started afresh since',
        expected: [],
        reset: (gates) => {
          gates.resetReading({
            agent: Agents.main,
            session,
          });
        },
      },
      {
        asked: agent,
        condition: 'another agent was shown them',
        expected: [],
        reset: () => undefined,
      },
    ])(
      'should read back the files whose hot rules an agent was shown when $condition',
      ({ asked, expected, reset }) => {
        // Arrange
        const gates = input.repositoryOf();

        gates.addHotReminded({
          agent: Agents.main,
          paths: [
            read.path,
            read.path,
          ],
          session,
        });

        reset(gates);

        // Act
        const shown = gates.hotReminded({
          agent: asked,
          session,
        });

        // Assert
        expect(shown).toStrictEqual(new Set(expected));
      },
    );

    it.each<{
      condition: string;
      expected: readonly RuleDebt[];
      write: (gates: GateCommandRepository) => void;
    }>([
      {
        condition: 'it owes them, once each and in the order owed',
        expected: [
          read,
          changed,
        ],
        write: (gates) => {
          gates.addDebts({
            agent,
            debts: [
              read,
              changed,
              read,
            ],
            session,
          });
        },
      },
      {
        condition: 'one of them is settled',
        expected: [
          changed,
        ],
        write: (gates) => {
          gates.addDebts({
            agent,
            debts: [
              read,
              changed,
            ],
            session,
          });
          gates.settleDebts({
            agent,
            debts: [
              read,
            ],
            session,
          });
        },
      },
      {
        condition: 'a debt is owed again after it was settled',
        expected: [
          read,
        ],
        write: (gates) => {
          gates.addDebts({
            agent,
            debts: [
              read,
            ],
            session,
          });
          gates.settleDebts({
            agent,
            debts: [
              read,
            ],
            session,
          });
          gates.addDebts({
            agent,
            debts: [
              read,
            ],
            session,
          });
        },
      },
      {
        condition: 'its context starts afresh, keeping them',
        expected: [
          read,
        ],
        write: (gates) => {
          gates.addDebts({
            agent,
            debts: [
              read,
            ],
            session,
          });
          gates.resetReading({
            agent,
            session,
          });
        },
      },
      {
        condition: 'another agent settles the same debt',
        expected: [
          read,
        ],
        write: (gates) => {
          gates.addDebts({
            agent,
            debts: [
              read,
            ],
            session,
          });
          gates.settleDebts({
            agent: Agents.main,
            debts: [
              read,
            ],
            session,
          });
        },
      },
    ])('should read back the debts of an agent when $condition', ({ expected, write }) => {
      // Arrange
      const gates = input.repositoryOf();

      write(gates);

      // Act
      const debts = gates.debts({
        agent,
        session,
      });

      // Assert
      expect(debts).toStrictEqual(expected);
    });

    it('should read back the gate entries in order, a reset among them', () => {
      // Arrange
      const gates = input.repositoryOf();

      gates.addGateEntry({
        agent: Agents.main,
        entry: {
          key,
          kind: GateEntryKind.Refused,
        },
        session,
      });
      gates.addGateEntry({
        agent: Agents.main,
        entry: {
          key,
          kind: GateEntryKind.Passed,
        },
        session,
      });
      gates.addGateEntry({
        agent: Agents.main,
        entry: {
          kind: GateEntryKind.Told,
        },
        session,
      });
      gates.resetReading({
        agent: Agents.main,
        session,
      });

      // Act
      const entries = gates.gateEntries({
        agent: Agents.main,
        session,
      });

      // Assert
      expect(entries).toStrictEqual([
        {
          key,
          kind: GateEntryKind.Refused,
        },
        {
          key,
          kind: GateEntryKind.Passed,
        },
        {
          kind: GateEntryKind.Told,
        },
        {
          kind: GateEntryKind.Reset,
        },
      ]);
    });

    it('should write the parts into the project, under .droneey/constitution-sessions, the session and parts, named by the set and their number', () => {
      // Arrange
      const gates = input.repositoryOf();
      const project = input.projectOf();

      // Act
      const parts = gates.writeParts({
        projectFolderPath: project,
        rules,
        session,
        set,
      });

      // Assert
      expect(parts).toStrictEqual([
        firstPartIn(project),
      ]);
    });

    it.each<{
      askedOf: (part: AbsolutePath) => PartInput;
      condition: string;
      expected: readonly RuleSlug[] | undefined;
    }>([
      {
        askedOf: (part) => ({
          path: part,
          session,
        }),
        condition: 'it wrote the part for the session',
        expected: [
          RuleSlug.create('name-reveals-intent'),
          RuleSlug.create('function-does-one-thing'),
        ],
      },
      {
        askedOf: () => ({
          path: AbsolutePath.create('/work/src/a.ts'),
          session,
        }),
        condition: 'the file is no part',
        expected: undefined,
      },
      {
        askedOf: (part) => ({
          path: part,
          session: SessionId.create('another-session'),
        }),
        condition: 'the part is of another session',
        expected: undefined,
      },
    ])('should give back the rules of a part when $condition', ({ askedOf, expected }) => {
      // Arrange
      const gates = input.repositoryOf();
      const project = input.projectOf();

      gates.writeParts({
        projectFolderPath: project,
        rules,
        session,
        set,
      });

      // Act
      const found = gates.partOf(askedOf(firstPartIn(project)));

      // Assert
      expect<readonly RuleSlug[] | undefined>(found?.rules.map((rule) => rule.slug)).toStrictEqual(
        expected,
      );
    });

    it.each([
      {
        condition: 'the session ended',
        ended: session,
        expected: undefined,
      },
      {
        condition: 'another session ended',
        ended: SessionId.create('another-session'),
        expected: [
          RuleSlug.create('name-reveals-intent'),
          RuleSlug.create('function-does-one-thing'),
        ],
      },
    ])('should give back the rules of a part after $condition', ({ ended, expected }) => {
      // Arrange
      const gates = input.repositoryOf();
      const project = input.projectOf();

      gates.writeParts({
        projectFolderPath: project,
        rules,
        session,
        set,
      });
      gates.removeSessionFolders(ended);

      // Act
      const found = gates.partOf({
        path: firstPartIn(project),
        session,
      });

      // Assert
      expect<readonly RuleSlug[] | undefined>(found?.rules.map((rule) => rule.slug)).toStrictEqual(
        expected,
      );
    });

    it('should read back the debts of a session that ended, for the session resumed', () => {
      // Arrange
      const gates = input.repositoryOf();

      gates.addDebts({
        agent,
        debts: [
          read,
        ],
        session,
      });
      gates.removeSessionFolders(session);

      // Act
      const debts = gates.debts({
        agent,
        session,
      });

      // Assert
      expect(debts).toStrictEqual([
        read,
      ]);
    });

    it('should name the same parts when the same set is written again', () => {
      // Arrange
      const gates = input.repositoryOf();
      const written = {
        projectFolderPath: input.projectOf(),
        rules,
        session,
        set,
      };
      const first = gates.writeParts(written);

      // Act
      const again = gates.writeParts(written);

      // Assert
      expect(again).toStrictEqual(first);
    });

    it('should take no tree for a call it kept none for', () => {
      // Arrange
      const gates = input.repositoryOf();

      gates.keepShellTree({
        call,
        session,
        tree,
      });

      // Act
      const taken = gates.takeShellTree({
        call: ToolUseId.create('toolu_2'),
        session,
      });

      // Assert
      expect(taken).toBeUndefined();
    });

    it('should take the tree kept before a shell command once', () => {
      // Arrange
      const gates = input.repositoryOf();
      const asked = {
        call,
        session,
      };

      gates.keepShellTree({
        ...asked,
        tree,
      });

      // Act
      const first = gates.takeShellTree(asked);

      // Assert
      expect(first).toStrictEqual(tree);

      // Act
      const second = gates.takeShellTree(asked);

      // Assert
      expect(second).toBeUndefined();
    });
  });
};

export { runGateCommandRepositorySuite };
