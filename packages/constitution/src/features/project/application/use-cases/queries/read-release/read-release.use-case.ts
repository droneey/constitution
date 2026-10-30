import { FileReadStatus, Release, ReleaseStatus } from '#/kernel/entities';
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

  return Release.ofManifest({
    blockFormat: parsed.manifest.blockFormat,
    manifestPath,
    version: parsed.manifest.version,
  });
};

export { readRelease };
