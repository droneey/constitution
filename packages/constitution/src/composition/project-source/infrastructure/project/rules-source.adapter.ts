import type {
  ConfigurationFormat,
  DistributionSources,
  LockRead,
  PresetFileParser,
} from '#/features/presets';
import { checkProject, presetsFindingTextOf } from '#/features/presets';
import type { OpenedProject, ProjectPorts } from '#/features/project';
import { findProject, readCore, readDeclaration, readRelease } from '#/features/project';
import type { ConfigurationsReport, DeclaredRules, RulesSource } from '#/features/session';
import { ConfigurationsCheckStatus } from '#/features/session';
import type { ProjectPlace, ProjectWarning } from '#/kernel/entities';
import { ConfigReadStatus, ReleaseStatus, WarningKind } from '#/kernel/entities';
import type { AbsolutePath, Version } from '#/kernel/value-objects';

import { presetsProjectOf } from './presets-project.utils';

interface PresetsPorts {
  readonly distribution: DistributionSources;
  readonly formats: ConfigurationFormat;
  readonly lockOf: (unitFolderPath: AbsolutePath) => LockRead;
  readonly parser: PresetFileParser;
}

interface RulesSourceInput {
  readonly presets: PresetsPorts;
  readonly project: ProjectPorts;
}

const configurationsOf = (input: {
  opened: OpenedProject;
  ports: RulesSourceInput;
}): ConfigurationsReport => {
  try {
    const check = checkProject({
      ...input.ports.presets,
      files: input.ports.project.files,
      project: presetsProjectOf(input.opened),
    });

    return {
      status: ConfigurationsCheckStatus.Checked,
      warnings: [
        ...check.warnings,
        ...check.findings.map(
          (finding): ProjectWarning => ({
            details: {
              code: finding.code,
              file: finding.path,
              says: presetsFindingTextOf(finding),
            },
            kind: WarningKind.ConfigurationFinding,
          }),
        ),
      ],
    };
  } catch (error) {
    // Why: the boundary of an optional part: any failure of the check, a defect included, costs the
    // digest its presets' warnings and is reported as unchecked, never the session's start.
    return error instanceof Error
      ? {
          reason: error.message,
          status: ConfigurationsCheckStatus.Unchecked,
        }
      : {
          status: ConfigurationsCheckStatus.Unchecked,
        };
  }
};

const createRulesSource = (input: RulesSourceInput): RulesSource => {
  const { project } = input;

  return {
    findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
      findProject({
        files: project.files,
        startFolderPath: searchFrom,
      }),
    /** @throws {UnreadableFileError} when core's passport cannot be read */
    readCorePassport: (place: ProjectPlace): string =>
      readCore({
        files: project.files,
        place,
      }),
    /**
     * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
     * @throws {ReleaseError} when the release's blocks cannot be listed
     */
    readRules: (place: ProjectPlace): DeclaredRules => {
      const declaration = readDeclaration({
        ...project,
        place,
      });

      if (declaration.status === ConfigReadStatus.Unparsed) {
        return {
          lines: declaration.lines,
          status: ConfigReadStatus.Unparsed,
        };
      }

      const { resolution } = declaration;

      return {
        active: resolution.active,
        configurations: configurationsOf({
          opened: {
            ...place,
            packs: declaration.packs,
            resolution,
          },
          ports: input,
        }),
        listing: resolution.listing,
        mustsBesideCore: resolution.mustsBesideCore,
        status: ConfigReadStatus.Parsed,
        warnings: resolution.warnings,
      };
    },
    pinnedVersionOf: (place: ProjectPlace): Version | undefined => {
      const release = readRelease({
        files: project.files,
        manifestParser: project.manifestParser,
        place,
      });

      // Stryker disable next-line ConditionalExpression: no other status carries a version
      return release.status === ReleaseStatus.Installed ? release.version : undefined;
    },
  };
};

export type { PresetsPorts };
export { createRulesSource };
