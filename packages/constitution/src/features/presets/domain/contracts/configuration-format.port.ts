import type { BlockMarks, Setting } from '../entities';
import type { FileFormat } from '../value-objects';

enum SettingShape {
  List = 'list',
  Map = 'map',
}

interface ConfigurationFile {
  /** the format of its text, where its name does not tell it */
  readonly format?: FileFormat | undefined;
  readonly path: string;
  /** for a file of no format of its own; read from its text where absent */
  readonly shape?: SettingShape;
  readonly text: string;
}

interface ConfigurationWrite extends ConfigurationFile {
  /** what each block gives, for the comments naming it, where the format holds comments */
  readonly marks?: BlockMarks | undefined;
  readonly settings: Setting;
  /** the paths of the maps whose keys stand in their order as texts, JSON's and YAML's */
  readonly sorted?: readonly (readonly string[])[];
}

interface ConfigurationFormat {
  /** undefined when the text does not parse, or no format is the file's */
  readonly read: (file: ConfigurationFile) => Setting | undefined;
  /**
   * The text holding these settings, with all the format allows of the text kept where the
   * settings leave it: its comments, its layout and the values the settings cannot hold; where the
   * format holds comments, one names the block above what it alone gives.
   */
  readonly write: (file: ConfigurationWrite) => string;
}

export type { ConfigurationFile, ConfigurationFormat, ConfigurationWrite };
export { SettingShape };
