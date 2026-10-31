import { sessionsFolderInProject } from '#/kernel/constants';
import type { RuleSlug } from '#/kernel/value-objects';
import { AbsolutePath } from '#/kernel/value-objects';

import type { GateCommandRepository, RulesPart } from '../domain/contracts/repositories/commands';
import type {
  GateEntry,
  RuleDebt,
  RuleRead,
  RulesRead,
  SessionAgent,
  ShellTree,
} from '../domain/entities';
import { GateEntryKind } from '../domain/entities';
import type { RuleHash, SessionId, ToolUseId } from '../domain/value-objects';

interface HeldGate {
  readonly debts: Map<SessionAgent, Map<string, RuleDebt>>;
  readonly entries: Map<SessionAgent, GateEntry[]>;
  readonly hot: Map<SessionAgent, Set<AbsolutePath>>;
  readonly parts: Map<string, RulesPart>;
  readonly read: Map<SessionAgent, RuleRead[]>;
  readonly shells: Map<ToolUseId, ShellTree>;
}

const LINES_PER_RULE = 8;

const debtKeyOf = (debt: RuleDebt): string => `${debt.kind} ${debt.path}`;

const listOf = <TValue>(map: Map<SessionAgent, TValue[]>, agent: SessionAgent): TValue[] => {
  const held = map.get(agent) ?? [];

  map.set(agent, held);

  return held;
};

const rulesReadOf = (rules: readonly RuleRead[]): RulesRead => {
  const read = new Map<RuleSlug, Set<RuleHash>>();

  for (const rule of rules) {
    read.set(
      rule.slug,
      new Set([
        ...(read.get(rule.slug) ?? []),
        rule.hash,
      ]),
    );
  }

  return read;
};

const createFakeGateCommandRepository = (): GateCommandRepository => {
  const gates = new Map<SessionId, HeldGate>();

  const gateOf = (session: SessionId): HeldGate => {
    const held = gates.get(session) ?? {
      debts: new Map(),
      entries: new Map(),
      hot: new Map(),
      parts: new Map(),
      read: new Map(),
      shells: new Map(),
    };

    gates.set(session, held);

    return held;
  };

  const debtsOf = (input: { agent: SessionAgent; session: SessionId }): Map<string, RuleDebt> => {
    const { debts } = gateOf(input.session);
    const held = debts.get(input.agent) ?? new Map();

    debts.set(input.agent, held);

    return held;
  };

  return {
    addDebts: (added): void => {
      const held = debtsOf(added);

      for (const debt of added.debts) {
        held.set(debtKeyOf(debt), held.get(debtKeyOf(debt)) ?? debt);
      }
    },
    addGateEntry: (added): void => {
      listOf(gateOf(added.session).entries, added.agent).push(added.entry);
    },
    addHotReminded: (added): void => {
      const { hot } = gateOf(added.session);

      hot.set(
        added.agent,
        new Set([
          ...(hot.get(added.agent) ?? []),
          ...added.paths,
        ]),
      );
    },
    addRulesRead: (added): void => {
      listOf(gateOf(added.session).read, added.agent).push(...added.rules);
    },
    debts: (asked): readonly RuleDebt[] => [
      ...debtsOf(asked).values(),
    ],
    gateEntries: (asked): readonly GateEntry[] => [
      ...listOf(gateOf(asked.session).entries, asked.agent),
    ],
    hotReminded: (asked): ReadonlySet<AbsolutePath> =>
      new Set(gateOf(asked.session).hot.get(asked.agent)),
    keepShellTree: (kept): void => {
      gateOf(kept.session).shells.set(kept.call, kept.tree);
    },
    partOf: (asked): RulesPart | undefined => gates.get(asked.session)?.parts.get(asked.path),
    removeSessionFolders: (session): void => {
      gates.get(session)?.parts.clear();
    },
    resetReading: (reset): void => {
      const held = gateOf(reset.session);

      held.read.delete(reset.agent);
      held.hot.delete(reset.agent);

      listOf(held.entries, reset.agent).push({
        kind: GateEntryKind.Reset,
      });
    },
    rulesRead: (asked): RulesRead => rulesReadOf(listOf(gateOf(asked.session).read, asked.agent)),
    settleDebts: (settled): void => {
      const held = debtsOf(settled);

      for (const debt of settled.debts) {
        held.delete(debtKeyOf(debt));
      }
    },
    sweepStaleSessions: (): void => {},
    takeShellTree: (asked): ShellTree | undefined => {
      const { shells } = gateOf(asked.session);
      const tree = shells.get(asked.call);

      shells.delete(asked.call);

      return tree;
    },
    writeParts: (written): readonly AbsolutePath[] => {
      const path = AbsolutePath.join(
        written.projectFolderPath,
        `${sessionsFolderInProject}/${written.session}/parts/${written.set}.1.md`,
      );

      gateOf(written.session).parts.set(path, {
        lineCount: written.rules.length * LINES_PER_RULE,
        rules: written.rules.map((rule) => ({
          hash: rule.hash,
          slug: rule.slug,
        })),
      });

      return [
        path,
      ];
    },
  };
};

export { createFakeGateCommandRepository };
