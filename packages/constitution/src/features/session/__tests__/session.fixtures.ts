import type { LoweredLevel } from '#/kernel/constants';
import type { ActiveBlock, MustRule } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId, Glob, RuleSlug, UnitPath } from '#/kernel/value-objects';

import type { ParsedState, SessionMark, SessionState } from '../domain/entities';
import type { AgentId } from '../domain/value-objects';
import { SessionId } from '../domain/value-objects';

// The session the specs of the session's hooks keep state for.
const keptSession = SessionId.create('session-1');

interface ActiveBlockFixture {
  readonly files?: readonly string[];
  readonly governs?: readonly string[];
  readonly id: string;
  readonly unit?: string;
}

// A block active in the repository unless the case names a unit, governing every file, with its
// passport to read.
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

// A MUST rule of a block, with the overrides that lower it: in the repository unless the case
// names a unit, directly unless it names the rule lowered through.
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

// What a session keeps for a project at /work/project whose constitution.yaml parsed and makes no
// block active.
const sessionStateOf = (overrides: Partial<ParsedState> = {}): ParsedState => ({
  active: [],
  musts: [],
  repositoryFolderPath: AbsolutePath.create('/work/project'),
  status: ConfigReadStatus.Parsed,
  ...overrides,
});

// What a session's store keeps of one session; the blocks reminded by the agent they were named
// to, undefined for the session itself.
interface KeptSession {
  readonly marks: Map<SessionMark, string>;
  readonly reminded: Map<AgentId | undefined, Set<BlockId>>;
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

// The sessions a store holds, which the fakes of its ports share: session-1 alone, with its state
// unless the case gives one, and the marks and reminders given.
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
            list.agent,
            new Set(list.ids.map(BlockId.create)),
          ]),
        ),
        state: held.state ?? sessionStateOf(),
      },
    ],
  ]);

export type { HeldSessions };
export { activeBlockOf, heldSessionsOf, keptSession, mustOf, sessionStateOf };
