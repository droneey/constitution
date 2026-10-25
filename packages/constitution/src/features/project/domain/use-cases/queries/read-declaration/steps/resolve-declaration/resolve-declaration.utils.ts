import { ProjectUnit, Resolution, WarningCode } from '#/kernel/entities';

import type { BlockCardParser } from '../../../../../contracts';
import type { CatalogueSource, ProjectConfig, UnreadMember } from '../../../../../entities';
import { MemberProblem, ProjectModel } from '../../../../../entities';
import { CONFIG } from '../../../shared/project-paths';
import type { WarningLog } from './shared/warning-log';
import { createWarningLog } from './shared/warning-log';
import { activeBlocksOf, mustRulesOf } from './steps/activate-blocks';
import { applyOverrides } from './steps/apply-overrides';
import { warnOfAnswers, warnOfRequires } from './steps/check-needs';
import { listBlocks } from './steps/list-blocks';
import { readCatalogue } from './steps/read-catalogue';
import { resolveUnits, warnOfKeys } from './steps/resolve-units';

// A member of the workspace whose constitution.yaml is missing or cannot be read declares nothing.
const warnOfMembers = (input: { log: WarningLog; unread: readonly UnreadMember[] }): void => {
  for (const member of input.unread) {
    const messages: Readonly<Record<MemberProblem, string>> = {
      [MemberProblem.Missing]: `${member.path} is a member of the workspace with no ${CONFIG} — write one that lists the blocks it follows`,
      [MemberProblem.Unparsed]: `${member.path}/${CONFIG} does not parse at line ${String(member.line ?? 0)} — fix it, as its blocks are left out`,
      [MemberProblem.Unreadable]: `cannot read ${member.path}/${CONFIG} — make it readable, as its blocks are left out`,
    };

    input.log.add({
      code: WarningCode.Config,
      message: messages[member.problem],
    });
  }
};

// Which blocks the constitution.yaml of the repository and of each member make active, what is
// wrong with them, and what the digest and the later hooks give of them.
const resolveDeclaration = (input: {
  config: ProjectConfig;
  parser: BlockCardParser;
  sources: readonly CatalogueSource[];
  today: Temporal.PlainDate;
}): Resolution => {
  const log = createWarningLog();
  const catalogue = readCatalogue({
    log,
    parser: input.parser,
    sources: input.sources,
  });

  warnOfKeys({
    config: input.config,
    log,
  });

  const model = ProjectModel.create(catalogue);
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
      answers: catalogue.answers,
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

  const { check } = input.config.units[0].config;

  return Resolution.create({
    active: activeBlocksOf({
      model,
      units,
    }),
    blocks: catalogue.blocks.map((block) => ({
      id: block.id,
      layer: block.layer,
    })),
    check,
    listing: listBlocks({
      applied,
      model,
      units,
    }),
    musts: mustRulesOf({
      applied,
      rules: catalogue.rules,
      units,
    }),
    units: units.map((unit) =>
      ProjectUnit.create({
        axes: [
          ...unit.axes,
        ],
        blocks: unit.blocks,
        loweredRules: applied.loweredIn.get(unit.path) ?? new Set(),
        path: unit.path,
      }),
    ),
    warnings: log.list(),
  });
};

export { resolveDeclaration };
