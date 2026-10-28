import type { Command } from 'commander';

import type { PinnedRelease } from '#/features/installation';
import type {
  AppliedFilesCommandRepository,
  CheckConfigurationsInput,
  CommandRunner,
  ConfigurationFormat,
  DistributionSources,
  LockQueryRepository,
  PlanApplyInput,
  PlanPresetsInput,
  PresetFileParser,
  ProjectReader,
} from '#/features/presets';
import type {
  RulesSource,
  SessionCommandRepository,
  SessionQueryRepository,
  WorkingTree,
} from '#/features/session';
import type { ProjectFiles } from '#/kernel/contracts';
import type { CommandContext } from '#/shared/cli';

import type { ProgramInput } from './program.types';

interface Ports {
  readonly appliedFiles: AppliedFilesCommandRepository;
  readonly commands: CommandRunner;
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly locks: LockQueryRepository;
  readonly pinned: PinnedRelease;
  readonly presetFiles: PresetFileParser;
  readonly reader: ProjectReader;
  readonly rules: RulesSource;
  readonly sessions: SessionCommandRepository & SessionQueryRepository;
  readonly workingTree: WorkingTree;
}

/** What the presets' check, plan and apply each read of the project. */
type PresetsInput = CheckConfigurationsInput & PlanApplyInput & PlanPresetsInput;

interface Registration {
  readonly context: CommandContext;
  readonly ports: Ports;
  readonly program: Command;
  readonly programInput: ProgramInput;
}

export type { Ports, PresetsInput, Registration };
