import type { RepositoryRelativePath } from '#/kernel/value-objects';

import type { FileFormat } from '../../value-objects';
import type { BlockMarks } from '../block-marks/block-marks.entity';
import type { Setting } from '../setting/setting.entity';

enum SettingShape {
  List = 'list',
  Map = 'map',
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

export type { ConfigurationFile, ConfigurationWrite };
export { SettingShape };
