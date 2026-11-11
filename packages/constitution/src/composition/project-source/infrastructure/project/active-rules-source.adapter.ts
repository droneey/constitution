import { findProject, findProjectHolding } from '#/features/project';
import type { ActiveRead, ActiveRulesSource, ChapterRules } from '#/features/session';
import type { ProjectPlace } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { GateRulesPorts } from './gate-rules.utils';
import { readActiveOf, realPathOf, rulesInOf } from './gate-rules.utils';

const createActiveRulesSource = (project: GateRulesPorts): ActiveRulesSource => ({
  findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
    findProject({
      files: project.files,
      startFolderPath: searchFrom,
    }),
  findProjectHolding: (path: AbsolutePath): ProjectPlace | undefined =>
    findProjectHolding({
      files: project.files,
      path,
    }),
  readActive: (place: ProjectPlace): ActiveRead => readActiveOf(project, place),
  realPathOf: (path: AbsolutePath): AbsolutePath => realPathOf(project.files, path),
  rulesIn: (file: AbsolutePath): ChapterRules | undefined => rulesInOf(project.files, file),
});

export { createActiveRulesSource };
