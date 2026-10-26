import type { Command } from 'commander';

import type {
  CommandRunner,
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
} from '#/features/presets';
import type {
  ProjectConfigurationsCheck,
  SessionCommandRepository,
  SessionQueryRepository,
} from '#/features/session';
import type { ProjectFiles, ProjectSource, WorkingTree } from '#/kernel/contracts';
import type { CommandContext } from '#/shared/cli';

import type { ProgramInput } from './program.types';

interface Ports {
  readonly commands: CommandRunner;
  readonly configurations: ProjectConfigurationsCheck;
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly presetFiles: PresetFileParser;
  readonly sessions: SessionCommandRepository & SessionQueryRepository;
  readonly source: ProjectSource;
  readonly workingTree: WorkingTree;
}

interface Registration {
  readonly context: CommandContext;
  readonly ports: Ports;
  readonly program: Command;
  readonly programInput: ProgramInput;
}

export type { Ports, Registration };
