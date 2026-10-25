import type { Versions } from '../../../../domain/entities';
import type { VersionsStatus } from './get-versions.constants';

type VersionsState =
  | {
      status: VersionsStatus.Loading;
    }
  | {
      status: VersionsStatus.Failed;
    }
  | ({
      status: VersionsStatus.Loaded;
    } & Versions);

export type { VersionsState };
