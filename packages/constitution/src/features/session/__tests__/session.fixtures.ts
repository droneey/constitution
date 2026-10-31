import type { LoweredLevel } from '#/kernel/constants';
import type { ActiveBlock, MustRule } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import {
  AbsolutePath,
  BlockId,
  Glob,
  RuleSlug,
  SourceKind,
  UnitPath,
} from '#/kernel/value-objects';

import type {
  AgentInSession,
  KeptBlock,
  ParsedState,
  ReviewDebt,
  SessionMark,
  SessionState,
} from '../domain/entities';
import { SessionAgent } from '../domain/entities';
import type { AgentId } from '../domain/value-objects';
import { SessionId } from '../domain/value-objects';

const keptSession = SessionId.create('session-1');

interface ActiveBlockFixture {
  readonly files?: readonly string[];
  readonly governs?: readonly string[];
  readonly id: string;
  readonly source?: SourceKind;
  readonly unit?: string;
}

const keptBlockOf = (input: ActiveBlockFixture): KeptBlock => ({
  files: input.files ?? [
    `.droneey/constitution/blocks/domains/${input.id}/${input.id}.md`,
  ],
  governs: (
    input.governs ?? [
      '**',
    ]
  ).map(Glob.create),
  id: BlockId.create(input.id),
  unit: UnitPath.create(input.unit ?? ''),
});

const activeBlockOf = (input: ActiveBlockFixture): ActiveBlock => ({
  ...keptBlockOf(input),
  files: (
    input.files ?? [
      `blocks/domains/${input.id}/${input.id}.md`,
    ]
  ).map((path) => ({
    path,
    source: input.source ?? SourceKind.Release,
  })),
});

interface LoweringFixture {
  readonly level: LoweredLevel;
  readonly unit?: string;
  readonly via?: string;
}

interface MustRuleFixture {
  readonly block: string;
  readonly lowerings?: readonly LoweringFixture[];
  readonly slug: string;
}

const mustOf = (input: MustRuleFixture): MustRule => ({
  block: BlockId.create(input.block),
  lowerings: (input.lowerings ?? []).map((lowering) => ({
    level: lowering.level,
    unit: UnitPath.create(lowering.unit ?? ''),
    ...(lowering.via === undefined
      ? {}
      : {
          via: RuleSlug.create(lowering.via),
        }),
  })),
  slug: RuleSlug.create(input.slug),
});

const sessionStateOf = (overrides: Partial<ParsedState> = {}): ParsedState => ({
  active: [],
  mustsBesideCore: [],
  repositoryFolderPath: AbsolutePath.create('/work/project'),
  status: ConfigReadStatus.Parsed,
  ...overrides,
});

interface KeptSession {
  readonly marks: Map<SessionMark, string>;
  readonly own: Map<SessionAgent, Set<AbsolutePath>>;
  readonly reminded: Map<SessionAgent, Set<BlockId>>;
  readonly review: Map<string, ReviewDebt>;
  readonly state?: SessionState;
}

type HeldSessions = Map<SessionId, KeptSession>;

interface HeldSessionFixture {
  readonly marks?: readonly {
    readonly mark: SessionMark;
    readonly value: string;
  }[];
  readonly own?: readonly {
    readonly agent: SessionAgent;
    readonly paths: readonly AbsolutePath[];
  }[];
  readonly reminded?: readonly {
    readonly agent?: AgentId;
    readonly ids: readonly string[];
  }[];
  readonly review?: readonly ReviewDebt[];
  readonly state?: SessionState;
}

const reviewKeyOf = (debt: ReviewDebt): string => `${debt.agent} ${debt.path}`;

const heldSessionsOf = (held: HeldSessionFixture = {}): HeldSessions =>
  new Map([
    [
      keptSession,
      {
        marks: new Map(
          (held.marks ?? []).map((kept) => [
            kept.mark,
            kept.value,
          ]),
        ),
        own: new Map(
          (held.own ?? []).map((changes) => [
            changes.agent,
            new Set(changes.paths),
          ]),
        ),
        reminded: new Map(
          (held.reminded ?? []).map((list) => [
            list.agent ?? SessionAgent.main,
            new Set(list.ids.map(BlockId.create)),
          ]),
        ),
        review: new Map(
          (held.review ?? []).map((debt) => [
            reviewKeyOf(debt),
            debt,
          ]),
        ),
        state: held.state ?? sessionStateOf(),
      },
    ],
  ]);

const ownChangesIn = (sessions: HeldSessions, asked: AgentInSession): readonly AbsolutePath[] => [
  ...(sessions.get(asked.session)?.own.get(asked.agent) ?? []),
];

const reviewDebtIn = (sessions: HeldSessions, session: SessionId): readonly ReviewDebt[] => [
  ...(sessions.get(session)?.review.values() ?? []),
];

export type { HeldSessions, KeptSession };
export {
  activeBlockOf,
  heldSessionsOf,
  keptBlockOf,
  keptSession,
  mustOf,
  ownChangesIn,
  reviewDebtIn,
  reviewKeyOf,
  sessionStateOf,
};
