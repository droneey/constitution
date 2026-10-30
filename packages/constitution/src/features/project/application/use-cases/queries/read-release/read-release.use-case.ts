import type { Release } from '#/kernel/entities';
import { FileReadStatus, NEWEST_FORMAT, OLDEST_FORMAT, ReleaseStatus } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

import type { ReleaseManifestParser } from '../../../contracts';
import { ManifestReadStatus } from '../../../contracts';
import type { ReleaseReadInput } from '../shared/release-read';

const MANIFEST_NAME = 'package.json';

interface ReadReleaseInput extends ReleaseReadInput {
  readonly manifestParser: ReleaseManifestParser;
}

const readRelease = (input: ReadReleaseInput): Release => {
  const { files } = input;
  const { releaseFolderPath } = input.place;
  const manifestPath = AbsolutePath.join(releaseFolderPath, MANIFEST_NAME);

  if (!files.isFolder(releaseFolderPath)) {
    return {
      status: ReleaseStatus.Missing,
    };
  }

  const read = files.read(manifestPath);

  if (read.status !== FileReadStatus.Read) {
    return {
      manifest: manifestPath,
      status: ReleaseStatus.ManifestUnreadable,
    };
  }

  const parsed = input.manifestParser.parse(read.text);

  if (parsed.status === ManifestReadStatus.NotObject) {
    return {
      manifest: manifestPath,
      status: ReleaseStatus.ManifestNotObject,
    };
  }

  if (parsed.status === ManifestReadStatus.Malformed) {
    return {
      fields: parsed.fields,
      manifest: manifestPath,
      status: ReleaseStatus.ManifestMalformed,
    };
  }

  const { blockFormat, version } = parsed.manifest;

  if (blockFormat === undefined || blockFormat < OLDEST_FORMAT) {
    return {
      status: ReleaseStatus.Older,
    };
  }

  if (blockFormat > NEWEST_FORMAT) {
    return {
      format: blockFormat,
      status: ReleaseStatus.Newer,
    };
  }

  if (version === undefined) {
    return {
      manifest: manifestPath,
      status: ReleaseStatus.VersionMissing,
    };
  }

  return {
    status: ReleaseStatus.Installed,
    version,
  };
};

export { readRelease };
