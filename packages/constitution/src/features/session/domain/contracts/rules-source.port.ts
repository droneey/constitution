import type {
  ActiveBlock,
  ConfigReadStatus,
  MustRule,
  ProjectPlace,
  ProjectWarning,
} from '#/kernel/entities';
import type { AbsolutePath, Version } from '#/kernel/value-objects';

import type { DigestListing } from '../entities';

enum ConfigurationsCheckStatus {
  Checked = 'checked',
  Unchecked = 'unchecked',
}

type ConfigurationsReport =
  | {
      readonly status: ConfigurationsCheckStatus.Checked;
      readonly warnings: readonly ProjectWarning[];
    }
  | {
      readonly reason?: string;
      readonly status: ConfigurationsCheckStatus.Unchecked;
    };

type DeclaredRules =
  | {
      readonly lines: readonly number[];
      readonly status: ConfigReadStatus.Unparsed;
    }
  | {
      readonly active: readonly ActiveBlock[];
      readonly configurations: ConfigurationsReport;
      readonly listing: DigestListing;
      readonly mustsBesideCore: readonly MustRule[];
      readonly status: ConfigReadStatus.Parsed;
      readonly warnings: readonly ProjectWarning[];
    };

interface RulesSource {
  readonly findProjectAround: (searchFrom: AbsolutePath) => ProjectPlace | undefined;
  readonly pinnedVersionOf: (place: ProjectPlace) => Version | undefined;
  /** @throws {UnreadableFileError} when core's passport cannot be read */
  readonly readCorePassport: (place: ProjectPlace) => string;
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly readRules: (place: ProjectPlace) => DeclaredRules;
}

export type { ConfigurationsReport, DeclaredRules, RulesSource };
export { ConfigurationsCheckStatus };
