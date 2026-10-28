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
  /** the check failed; the presets are an optional part of the digest */
  Unchecked = 'unchecked',
}

/** What the presets find in the configurations of the project's tools. */
type ConfigurationsReport =
  | {
      readonly status: ConfigurationsCheckStatus.Checked;
      readonly warnings: readonly ProjectWarning[];
    }
  | {
      /** what the check failed with, as its error words it; absent when it threw no error */
      readonly reason?: string;
      readonly status: ConfigurationsCheckStatus.Unchecked;
    };

/** The rules a project declares for a session, or where its constitution.yaml stops parsing. */
type DeclaredRules =
  | {
      /** every line, from 1, constitution.yaml fails at, in order */
      readonly lines: readonly number[];
      readonly status: ConfigReadStatus.Unparsed;
    }
  | {
      readonly active: readonly ActiveBlock[];
      /** how many blocks some unit makes active */
      readonly activeCount: number;
      readonly configurations: ConfigurationsReport;
      readonly listing: DigestListing;
      /** the MUST rules of the active blocks, core's aside */
      readonly musts: readonly MustRule[];
      readonly status: ConfigReadStatus.Parsed;
      /** what is wrong with what the project declares */
      readonly warnings: readonly ProjectWarning[];
    };

/**
 * Where the rules a session starts with are read: the project around a folder and the release it
 * pins. readRules and readCore let through the failure to read a file the digest needs, which only
 * the handler of last resort words.
 */
interface RulesSource {
  /** the project around the folder; undefined when there is none */
  readonly find: (searchFrom: AbsolutePath) => ProjectPlace | undefined;
  /** the text of core's passport in the release the project pins */
  readonly readCore: (place: ProjectPlace) => string;
  readonly readRules: (place: ProjectPlace) => DeclaredRules;
  /** the version of the release the project pins; undefined where none is installed that this program reads */
  readonly versionOf: (place: ProjectPlace) => Version | undefined;
}

export type { ConfigurationsReport, DeclaredRules, RulesSource };
export { ConfigurationsCheckStatus };
