import type {
  ConfigurationFile,
  ConfigurationWrite,
} from '../../domain/configuration-file/entities';
import type { Setting } from '../../domain/setting/entities';
import type { FileFormat } from '../../domain/shared/value-objects';

interface ConfigurationTarget {
  readonly format?: FileFormat;
  readonly writtenPath: string;
}

interface ConfigurationFormat {
  readonly canSortKeys: (target: ConfigurationTarget) => boolean;
  readonly read: (file: ConfigurationFile) => Setting | undefined;
  readonly write: (file: ConfigurationWrite) => string;
}

export type { ConfigurationFormat, ConfigurationTarget };
