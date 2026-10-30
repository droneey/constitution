import type { ConfigurationFile, ConfigurationWrite, Setting } from '../../domain/entities';
import type { FileFormat } from '../../domain/value-objects';

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
