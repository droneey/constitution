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

import type { WiringCheck } from '../../../../contracts';
import { WiringCheckStatus } from '../../../../contracts';
import type { DigestSessionPorts } from '../digest-session.use-case';

// What a constitution.yaml that lists no block beyond core and names its check resolves to.
const quiet = Resolution.create({
  active: [],
  blocks: [
    {
      id: coreBlockId,
      layer: Layer.Core,
    },
  ],
  check: 'bun run check',
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

// A check of the wiring that warns as given of the project it is asked about.
const wiringOf = (
  warningsOf: (project: OpenedProject) => readonly ProjectWarning[] = () => [],
): WiringCheck => ({
  check: (project) => ({
    status: WiringCheckStatus.Checked,
    warnings: warningsOf(project),
  }),
});

// A check of the wiring that fails as one that cannot read the presets.
const uncheckedWiring: WiringCheck = {
  check: () => ({
    cause: new Error('cannot list the presets'),
    status: WiringCheckStatus.Unchecked,
  }),
};

interface SessionPortsInput {
  readonly project?: FakeProject;
  readonly wiring?: WiringCheck;
}

// The ports a session's start reads through: the project around the start, quiet by default, and
// the wiring check given.
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
  wiring: input.wiring ?? wiringOf(),
});

export { quiet, sessionPortsOf, uncheckedWiring, wiringOf };
