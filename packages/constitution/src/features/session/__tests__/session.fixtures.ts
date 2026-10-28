import type { LoweredLevel } from '#/kernel/constants';
import type { ActiveBlock, MustRule } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId, Glob, RuleSlug, UnitPath } from '#/kernel/value-objects';

import type { ParsedState, SessionMark, SessionState } from '../domain/entities';
import { SessionAgent } from '../domain/entities';
import type { AgentId } from '../domain/value-objects';
import { SessionId } from '../domain/value-objects';

const keptSession = SessionId.create('session-1');

interface ActiveBlockFixture {
  readonly files?: readonly string[];
  readonly governs?: readonly string[];
  readonly id: string;
  readonly unit?: string;
}

const activeBlockOf = (input: ActiveBlockFixture): ActiveBlock => ({
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
  readonly reminded: Map<SessionAgent, Set<BlockId>>;
  readonly state: SessionState;
}

type HeldSessions = Map<SessionId, KeptSession>;

interface HeldSessionFixture {
  readonly marks?: readonly {
    readonly mark: SessionMark;
    readonly value: string;
  }[];
  readonly reminded?: readonly {
    readonly agent?: AgentId;
    readonly ids: readonly string[];
  }[];
  readonly state?: SessionState;
}

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
        reminded: new Map(
          (held.reminded ?? []).map((list) => [
            list.agent ?? SessionAgent.main,
            new Set(list.ids.map(BlockId.create)),
          ]),
        ),
        state: held.state ?? sessionStateOf(),
      },
    ],
  ]);

export type { HeldSessions };
export { activeBlockOf, heldSessionsOf, keptSession, mustOf, sessionStateOf };
