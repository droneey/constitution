import type { Setting } from '../entities';

enum SettingShape {
  List = 'list',
  Map = 'map',
}

interface ConfigurationFile {
  readonly path: string;
  /** for a file of no format of its own; read from its text where absent */
  readonly shape?: SettingShape;
  readonly text: string;
}

interface ConfigurationWrite extends ConfigurationFile {
  readonly settings: Setting;
}

interface ConfigurationFormat {
  /** undefined when the text does not parse, or no format is the file's */
  readonly read: (file: ConfigurationFile) => Setting | undefined;
  /**
   * The text holding these settings, with all the format allows of the text kept where the
   * settings leave it: its comments, its layout and the values the settings cannot hold.
   */
  readonly write: (file: ConfigurationWrite) => string;
}

export type { ConfigurationFile, ConfigurationFormat, ConfigurationWrite };
export { SettingShape };
