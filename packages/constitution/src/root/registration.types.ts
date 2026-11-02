import type { Command } from 'commander';

import type { PinnedRelease } from '#/features/installation';
import type {
  AppliedFilesRepository,
  CheckConfigurationsInput,
  CommandRunner,
  ConfigurationFormat,
  DistributionSources,
  LockQueries,
  PlanApplyInput,
  PlanPresetsInput,
  PresetFileParser,
  ProjectReader,
} from '#/features/presets';
import type {
  RulesSource,
  SessionQueries,
  SessionRepository,
  WorkingTree,
} from '#/features/session';
import type { ProjectFiles } from '#/kernel/contracts';
import type { CommandContext } from '#/shared/cli';

import type { ProgramInput } from './program.types';

interface Ports {
  readonly appliedFilesRepository: AppliedFilesRepository;
  readonly commands: CommandRunner;
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly lockQueries: LockQueries;
  readonly pinned: PinnedRelease;
  readonly presetFiles: PresetFileParser;
  readonly reader: ProjectReader;
  readonly rules: RulesSource;
  readonly sessionQueries: SessionQueries;
  readonly sessionRepository: SessionRepository;
  readonly workingTree: WorkingTree;
}

type PresetsInput = CheckConfigurationsInput & PlanApplyInput & PlanPresetsInput;

interface Registration {
  readonly context: CommandContext;
  readonly ports: Ports;
  readonly program: Command;
  readonly programInput: ProgramInput;
}

export type { Ports, PresetsInput, Registration };
