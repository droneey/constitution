import { projectPlace } from '#/__tests__/project-place.fixtures';
import type { FakeProject } from '#/__tests__/project-source.fake';
import { createFakeProjectSource } from '#/__tests__/project-source.fake';
import { Layer } from '#/kernel/constants';
import type { OpenedProject, ProjectWarning } from '#/kernel/entities';
import {
  BlockListing,
  BlockModel,
  ConfigReadStatus,
  ProjectUnit,
  Resolution,
} from '#/kernel/entities';
import { coreBlockId, repositoryUnit } from '#/kernel/value-objects';

import type { ProjectConfigurationsCheck } from '../../../../contracts';
import { ConfigurationsCheckStatus } from '../../../../contracts';
import type { DigestSessionPorts } from '../digest-session.use-case';

// What a constitution.yaml that lists no block beyond core resolves to.
const quiet = Resolution.create({
  active: [],
  blocks: [
    {
      id: coreBlockId,
      layer: Layer.Core,
    },
  ],
  listing: BlockListing.create({
    overrides: [],
    repository: [],
    units: [],
  }),
  model: BlockModel.create({
    blocks: [],
    roles: [],
    rules: [],
  }),
  musts: [],
  units: [
    ProjectUnit.create({
      axes: [],
      blocks: new Set([
        coreBlockId,
      ]),
      languages: new Set(),
      loweredRules: new Set(),
      packs: [],
      path: repositoryUnit,
    }),
  ],
  warnings: [],
});

// A check of the configurations that warns as given of the project it is asked about.
const configurationsOf = (
  warningsOf: (project: OpenedProject) => readonly ProjectWarning[] = () => [],
): ProjectConfigurationsCheck => ({
  check: (project) => ({
    status: ConfigurationsCheckStatus.Checked,
    warnings: warningsOf(project),
  }),
});

// A check of the configurations that fails as one that cannot read them.
const uncheckedConfigurations: ProjectConfigurationsCheck = {
  check: () => ({
    cause: new Error('cannot list the presets'),
    status: ConfigurationsCheckStatus.Unchecked,
  }),
};

interface SessionPortsInput {
  readonly configurations?: ProjectConfigurationsCheck;
  readonly project?: FakeProject;
}

// The ports a session's start reads through: the project around the start, quiet by default, and
// the configurations check given.
const sessionPortsOf = (input: SessionPortsInput = {}): DigestSessionPorts => ({
  source: createFakeProjectSource({
    declaration: {
      packs: [],
      resolution: quiet,
      status: ConfigReadStatus.Parsed,
    },
    place: projectPlace,
    ...input.project,
  }),
  configurations: input.configurations ?? configurationsOf(),
});

export { configurationsOf, quiet, sessionPortsOf, uncheckedConfigurations };
