import { Layer, PATH_SEPARATOR } from '#/kernel/constants';
import type { ProjectWarning, WarningDetails } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { firstBy } from '#/kernel/utils';
import type { FileInBlock } from '#/kernel/value-objects';
import {
  BlockFilePlace,
  BlockId,
  BlockSource,
  Placement,
  SourceKind,
} from '#/kernel/value-objects';

import type { BlockSetSource } from '../../../../../../../block-set/entities';
import { SourceFile, SourceStatus } from '../../../../../../../block-set/entities';

interface FileInFolder {
  readonly block: BlockId;
  readonly file: SourceFile;
  readonly layer: Layer;
  readonly named: WarningDetails[WarningKind.FileUnreadable];
  readonly part: FileInBlock;
  readonly source: BlockSource;
}

enum FileFate {
  Passed = 'passed',
  Kept = 'kept',
}

interface PassedFile {
  readonly fate: FileFate.Passed;
  readonly warnings: readonly ProjectWarning[];
}

interface KeptFile {
  readonly fate: FileFate.Kept;
  readonly file: FileInFolder;
  readonly first: FileInFolder;
}

type PlacedFile = KeptFile | PassedFile;

enum Spot {
  Passed = 'passed',
  InFolder = 'in-folder',
}

type Placed =
  | {
      readonly spot: Spot.InFolder;
      readonly file: FileInFolder;
    }
  | {
      readonly spot: Spot.Passed;
      readonly warnings: readonly ProjectWarning[];
    };

const passed = (warnings: readonly ProjectWarning[]): Placed => ({
  spot: Spot.Passed,
  warnings,
});

const placedOf = (input: { file: SourceFile; source: BlockSetSource }): Placed => {
  const { file, source } = input;
  const place = BlockFilePlace.parse(file.path);
  const named = {
    file: `${source.shownFolderPath}${PATH_SEPARATOR}${file.path}`,
    source: source.source.kind,
  };

  if (
    place === undefined ||
    (place.placement === Placement.InBlock &&
      place.folder.layer === Layer.Core &&
      source.source.kind !== SourceKind.Release)
  ) {
    return passed([
      {
        details: named,
        kind: WarningKind.OutsideBlockFolder,
      },
    ]);
  }

  if (place.placement === Placement.MisnamedFolder) {
    return passed([
      {
        details: named,
        kind: WarningKind.FolderMisnamed,
      },
    ]);
  }

  if (place.placement === Placement.Loose) {
    return passed([]);
  }

  return {
    file: {
      block: place.folder.id,
      file,
      layer: place.folder.layer,
      named,
      part: place.file,
      source: source.source,
    },
    spot: Spot.InFolder,
  };
};

const isSameFolder = (left: FileInFolder, right: FileInFolder): boolean =>
  BlockId.equals(left.block, right.block) &&
  left.layer === right.layer &&
  BlockSource.equals(left.source, right.source);

const weighedOf = (input: {
  file: FileInFolder;
  firsts: ReadonlyMap<BlockId, FileInFolder>;
  inFolder: readonly FileInFolder[];
}): PlacedFile => {
  const { file, inFolder } = input;
  const first = input.firsts.get(file.block) ?? file;

  if (isSameFolder(first, file)) {
    return {
      fate: FileFate.Kept,
      file,
      first,
    };
  }

  const isFirstOfFolder = inFolder.find((other) => isSameFolder(other, file)) === file;

  return {
    fate: FileFate.Passed,
    warnings: isFirstOfFolder
      ? [
          {
            details: {
              ...file.named,
              block: file.block,
            },
            kind: WarningKind.BlockRepeated,
          },
        ]
      : [],
  };
};

const placeFiles = (sources: readonly BlockSetSource[]): readonly PlacedFile[] => {
  const placed = sources.flatMap((source) =>
    source.status === SourceStatus.Unlisted
      ? []
      : SourceFile.inReadOrder(source.files).map((file) =>
          placedOf({
            file,
            source,
          }),
        ),
  );
  const inFolder = placed
    .filter((place) => place.spot === Spot.InFolder)
    .map((place) => place.file);
  const firsts = firstBy(inFolder, (file) => file.block);

  return placed.map((place) =>
    place.spot === Spot.InFolder
      ? weighedOf({
          file: place.file,
          firsts,
          inFolder,
        })
      : {
          fate: FileFate.Passed,
          warnings: place.warnings,
        },
  );
};

export type { FileInFolder, KeptFile, PassedFile, PlacedFile };
export { FileFate, placeFiles };
