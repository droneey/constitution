import type { LoweredLevel } from '#/kernel/constants';
import { ActiveBlock, Lowering, MustRule } from '#/kernel/entities';
import { BlockId, Glob, RuleSlug, repositoryUnit, UnitPath } from '#/kernel/value-objects';

import { CheckState, SessionState } from '../domain/entities';
import { SessionId } from '../domain/value-objects';

// The session the specs of the session's hooks keep state for.
const keptSession = SessionId.create('session-1');

// A block active in the repository unless the case names a unit, governing every file, with its
// passport to read.
const activeBlockOf = (input: {
  files?: readonly string[];
  governs?: readonly string[];
  id: string;
  unit?: string;
}): ActiveBlock =>
  ActiveBlock.create({
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

// A MUST rule of a block, with the overrides that lower it: in the repository unless the case
// names a unit, directly unless it names the rule lowered through.
const mustOf = (input: {
  block: string;
  lowerings?: readonly {
    level: LoweredLevel;
    unit?: string;
    via?: string;
  }[];
  slug: string;
}): MustRule =>
  MustRule.create({
    block: BlockId.create(input.block),
    lowerings: (input.lowerings ?? []).map((lowering) =>
      Lowering.create({
        level: lowering.level,
        unit: UnitPath.create(lowering.unit ?? ''),
        ...(lowering.via === undefined
          ? {}
          : {
              via: RuleSlug.create(lowering.via),
            }),
      }),
    ),
    slug: RuleSlug.create(input.slug),
  });

// What a session keeps for a project at /work/project of one unit that names a check and no block.
const sessionStateOf = (overrides: Partial<SessionState> = {}): SessionState =>
  SessionState.create({
    active: [],
    check: CheckState.create('bun run check'),
    musts: [],
    project: '/work/project',
    units: [
      repositoryUnit,
    ],
    ...overrides,
  });

export { activeBlockOf, keptSession, mustOf, sessionStateOf };
