import { PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { FileReadStatus } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { BlockSource, RepositoryRelativePath } from '#/kernel/value-objects';
import { AbsolutePath } from '#/kernel/value-objects';

import type { PresetSetsLoaded } from '../../../../domain/services';
import { entriesIn, SetPlaceKind, setPlaceOf, unparsedSetOf } from '../../../../domain/services';
import type { PresetFileParser, PresetFileRead } from '../../../contracts';
import { PresetFileReadStatus } from '../../../contracts';

interface LoadPresetSetsInput {
  readonly files: ProjectFiles;
  readonly parser: PresetFileParser;
  readonly source: BlockSource;
  readonly sourceFolderPath: AbsolutePath;
  readonly sourceFolderPathFromRepository: RepositoryRelativePath;
}

const loadedFrom = (
  input: LoadPresetSetsInput & {
    pathInPresets: string;
  },
): PresetSetsLoaded => {
  const place = setPlaceOf(input);

  if (place.kind === SetPlaceKind.Skipped) {
    return place.loaded;
  }

  const read = input.files.read(AbsolutePath.join(input.sourceFolderPath, place.pathInSource));
  const parsed: PresetFileRead =
    read.status === FileReadStatus.Read
      ? input.parser.parse(read.text)
      : {
          status: PresetFileReadStatus.Unparsed,
        };

  return parsed.status === PresetFileReadStatus.Unparsed
    ? unparsedSetOf({
        set: place.set,
        unparsed: parsed,
      })
    : entriesIn({
        set: place.set,
        value: parsed.value,
      });
};

const loadPresetSets = (input: LoadPresetSetsInput): PresetSetsLoaded => {
  const presetsFolderPath = AbsolutePath.join(input.sourceFolderPath, PRESETS_FOLDER_NAME);
  // Stryker disable next-line ArrayDeclaration: a path that names no preset file is data
  const pathsInPresets = (input.files.listFiles(presetsFolderPath) ?? []).toSorted(compareText);
  const loaded = pathsInPresets.map((pathInPresets) =>
    loadedFrom({
      ...input,
      pathInPresets,
    }),
  );

  return {
    entries: loaded.flatMap((one) => one.entries),
    findings: loaded.flatMap((one) => one.findings),
  };
};

export type { LoadPresetSetsInput };
export { loadPresetSets };
