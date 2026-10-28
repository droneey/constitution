import type { RepositoryRelativePath } from '#/kernel/value-objects';

import type { BlockMarks, Setting } from '../entities';
import type { FileFormat } from '../value-objects';

enum SettingShape {
  List = 'list',
  Map = 'map',
}

/** A file as an entry names it: the path it writes and the format its key marks. */
interface ConfigurationTarget {
  readonly format?: FileFormat;
  /** from its unit's folder, as its entry spells it */
  readonly writtenPath: string;
}

interface ConfigurationFile {
  readonly filePath: RepositoryRelativePath;
  /** the format of its text, where its name does not tell it */
  readonly format?: FileFormat;
  /** for a file of no format of its own; read from its text where absent */
  readonly shape?: SettingShape;
  readonly text: string;
}

/** The text parses in its format. */
interface ConfigurationWrite extends ConfigurationFile {
  /** what each block gives, for the comments naming it, where the format holds comments */
  readonly marks: BlockMarks;
  readonly settings: Setting;
  /** the paths of the maps whose keys stand in their order as texts, JSON's and YAML's */
  readonly sorted: readonly (readonly string[])[];
}

interface ConfigurationFormat {
  /** whether its writer keeps a map's keys in their order as texts, as JSON's and YAML's do */
  readonly canSortKeys: (target: ConfigurationTarget) => boolean;
  /** undefined when the text does not parse, or no format is the file's */
  readonly read: (file: ConfigurationFile) => Setting | undefined;
  /**
   * The text holding these settings, with all the format allows of the text kept where the
   * settings leave it: its comments, its layout and the values the settings cannot hold; where the
   * format holds comments, one names the block above what it alone gives.
   */
  readonly write: (file: ConfigurationWrite) => string;
}

export type { ConfigurationFile, ConfigurationFormat, ConfigurationTarget, ConfigurationWrite };
export { SettingShape };
