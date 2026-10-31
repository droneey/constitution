import type { ProjectPorts } from '#/features/project';
import { findProject } from '#/features/project';
import type { ActiveRead, ActiveRulesSource } from '#/features/session';
import type { ProjectPlace, RuleWording } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import { readActiveOf, realPathOf, rulesInOf } from './gate-rules.utils';

const createActiveRulesSource = (project: ProjectPorts): ActiveRulesSource => ({
  findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
    findProject({
      files: project.files,
      startFolderPath: searchFrom,
    }),
  readActive: (place: ProjectPlace): ActiveRead => readActiveOf(project, place),
  realPathOf: (path: AbsolutePath): AbsolutePath => realPathOf(project.files, path),
  rulesIn: (file: AbsolutePath): readonly RuleWording[] | undefined =>
    rulesInOf(project.files, file),
});

export { createActiveRulesSource };
