import type { Version } from '#/kernel/value-objects';

/** What a release's manifest names; a field it leaves out is absent. */
interface ReleaseManifest {
  readonly blockFormat?: number;
  readonly version?: Version;
}

enum ManifestReadStatus {
  Read = 'read',
  NotObject = 'not-object',
  Malformed = 'malformed',
}

type ManifestRead =
  | {
      readonly manifest: ReleaseManifest;
      readonly status: ManifestReadStatus.Read;
    }
  | {
      readonly status: ManifestReadStatus.NotObject;
    }
  | {
      /** the fields of another form, each by its path, at least one */
      readonly fields: readonly string[];
      readonly status: ManifestReadStatus.Malformed;
    };

interface ReleaseManifestParser {
  readonly parse: (json: string) => ManifestRead;
}

export type { ManifestRead, ReleaseManifest, ReleaseManifestParser };
export { ManifestReadStatus };
