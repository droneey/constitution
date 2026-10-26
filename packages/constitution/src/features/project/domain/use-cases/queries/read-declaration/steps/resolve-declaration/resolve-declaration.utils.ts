import type { ProjectWarning } from '#/kernel/entities';
import { ProjectUnit, Resolution, WarningKind } from '#/kernel/entities';

import type { BlockCardParser } from '../../../../../contracts';
import type { BlockSetSource, ProjectConfig, UnreadMember } from '../../../../../entities';
import { BlockSet, MemberProblem, ProjectModel } from '../../../../../entities';
import type { WarningLog } from './shared/warning-log';
import { createWarningLog } from './shared/warning-log';
import { activeBlocksOf, mustRulesOf } from './steps/activate-blocks';
import { applyOverrides } from './steps/apply-overrides';
import { warnOfAnswers, warnOfRequires } from './steps/check-needs';
import { listBlocks } from './steps/list-blocks';
import { readBlockSet } from './steps/read-block-set';
import { resolveUnits, warnOfKeys } from './steps/resolve-units';

const memberWarnings: {
  readonly [TProblem in MemberProblem]: (member: UnreadMember) => ProjectWarning;
} = {
  [MemberProblem.Missing]: (member) => ({
    details: {
      member: member.path,
    },
    kind: WarningKind.MemberWithoutConfig,
  }),
  [MemberProblem.Unparsed]: (member) => ({
    details: {
      ...(member.line === undefined
        ? {}
        : {
            line: member.line,
          }),
      member: member.path,
    },
    kind: WarningKind.MemberConfigUnparsed,
  }),
  [MemberProblem.Unreadable]: (member) => ({
    details: {
      member: member.path,
    },
    kind: WarningKind.MemberConfigUnreadable,
  }),
};

// A member of the workspace whose constitution.yaml is missing or cannot be read declares nothing.
const warnOfMembers = (input: { log: WarningLog; unread: readonly UnreadMember[] }): void => {
  for (const member of input.unread) {
    input.log.add(memberWarnings[member.problem](member));
  }
};

interface ResolveDeclarationInput {
  readonly config: ProjectConfig;
  readonly parser: BlockCardParser;
  readonly sources: readonly BlockSetSource[];
  readonly today: Temporal.PlainDate;
}

// Which blocks the constitution.yaml of the repository and of each member make active, what is
// wrong with them, and what the digest and the later hooks give of them.
const resolveDeclaration = (input: ResolveDeclarationInput): Resolution => {
  const log = createWarningLog();
  const blockSet = readBlockSet({
    log,
    parser: input.parser,
    sources: input.sources,
  });

  warnOfKeys({
    config: input.config,
    log,
  });

  const model = ProjectModel.create(blockSet);
  const units = resolveUnits({
    config: input.config,
    log,
    model,
  });
  const applied = applyOverrides({
    config: input.config,
    log,
    model,
    today: input.today,
  });

  for (const unit of units) {
    warnOfRequires({
      log,
      model,
      unit,
    });
  }

  for (const unit of units) {
    warnOfAnswers({
      answers: blockSet.answers,
      applied,
      log,
      model,
      unit,
    });
  }

  warnOfMembers({
    log,
    unread: input.config.unread,
  });

  return Resolution.create({
    active: activeBlocksOf({
      model,
      units,
    }),
    blocks: blockSet.blocks.map((block) => ({
      id: block.id,
      layer: block.layer,
    })),
    listing: listBlocks({
      applied,
      model,
      units,
    }),
    model: BlockSet.modelOf(blockSet),
    musts: mustRulesOf({
      applied,
      rules: blockSet.rules,
      units,
    }),
    units: units.map((unit) =>
      ProjectUnit.create({
        axes: [
          ...unit.axes,
        ],
        blocks: unit.blocks,
        languages: ProjectModel.languagesOf(model, unit.blocks),
        loweredRules: applied.loweredIn.get(unit.path) ?? new Set(),
        name: unit.name,
        packs: unit.packs,
        path: unit.path,
      }),
    ),
    warnings: log.list(),
  });
};

export { resolveDeclaration };
