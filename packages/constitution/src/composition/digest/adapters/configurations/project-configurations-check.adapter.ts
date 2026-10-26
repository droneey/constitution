import type {
  ConfigurationFormat,
  DistributionSources,
  LockRead,
  PresetFileParser,
} from '#/features/presets';
import { checkProject, presetsFindingTextOf } from '#/features/presets';
import type { ConfigurationsReport, ProjectConfigurationsCheck } from '#/features/session';
import { ConfigurationsCheckStatus } from '#/features/session';
import type { ProjectFiles } from '#/kernel/contracts';
import type { OpenedProject, ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';

interface ProjectConfigurationsCheckInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  /** by the unit's absolute folder */
  readonly lockOf: (folder: string) => LockRead;
  readonly parser: PresetFileParser;
}

const createProjectConfigurationsCheck = (
  input: ProjectConfigurationsCheckInput,
): ProjectConfigurationsCheck => ({
  check: (project: OpenedProject): ConfigurationsReport => {
    try {
      const check = checkProject({
        ...input,
        project,
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
    } catch (cause) {
      // The boundary of an optional part: any failure of the check, a defect included, costs the
      // digest its presets' warnings and is reported as unchecked, never the session's start.
      return {
        cause,
        status: ConfigurationsCheckStatus.Unchecked,
      };
    }
  },
});

export type { ProjectConfigurationsCheckInput };
export { createProjectConfigurationsCheck };
