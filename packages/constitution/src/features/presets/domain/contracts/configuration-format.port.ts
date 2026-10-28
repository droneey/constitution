import type { RepositoryRelativePath } from '#/kernel/value-objects';

import type { BlockMarks, Setting } from '../entities';
import type { FileFormat } from '../value-objects';

enum SettingShape {
  List = 'list',
  Map = 'map',
}

interface ConfigurationTarget {
  readonly format?: FileFormat;
  readonly writtenPath: string;
}

interface ConfigurationFile {
  readonly filePath: RepositoryRelativePath;
  readonly format?: FileFormat;
  readonly shape?: SettingShape;
  readonly text: string;
}

interface ConfigurationWrite extends ConfigurationFile {
  readonly marks: BlockMarks;
  readonly settings: Setting;
  readonly sorted: readonly (readonly string[])[];
}

interface ConfigurationFormat {
  readonly canSortKeys: (target: ConfigurationTarget) => boolean;
  readonly read: (file: ConfigurationFile) => Setting | undefined;
  readonly write: (file: ConfigurationWrite) => string;
}

export type { ConfigurationFile, ConfigurationFormat, ConfigurationTarget, ConfigurationWrite };
export { SettingShape };
