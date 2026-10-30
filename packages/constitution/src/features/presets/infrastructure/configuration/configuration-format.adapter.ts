import { PATH_SEPARATOR } from '#/kernel/constants';

import type { ConfigurationFormat, ConfigurationTarget } from '../../application/contracts';
import type {
  ConfigurationFile,
  ConfigurationWrite,
} from '../../domain/configuration-file/entities';
import { SettingShape } from '../../domain/configuration-file/entities';
import type { Setting } from '../../domain/setting/entities';
import { FileFormat } from '../../domain/shared/value-objects';
import { readIni, writeIni } from './ini-text.utils';
import { readJson, writeCommentedJson, writeJson, writeJsonc } from './json-text.utils';
import { readCodeLines, readLines, writeCodeLines, writeLines } from './lines-text.utils';
import { readToml } from './toml-lines.utils';
import { writeToml } from './toml-text.utils';
import { readYaml, writeYaml } from './yaml-text.utils';

interface Format {
  readonly read: (text: string) => Setting | undefined;
  readonly write: (file: ConfigurationWrite) => string;
}

const DOT = '.';
const RUN_COMMAND_EXTENSION = /\.[^.]+rc$/;
const SECTION_LINE = /^\s*\[[^\]]+\]\s*$/m;

const formatByExtension: Readonly<Record<string, Format>> = {
  '.json': {
    read: readJson,
    write: writeJson,
  },
  '.jsonc': {
    read: readJson,
    write: writeJsonc,
  },
  '.toml': {
    read: readToml,
    write: writeToml,
  },
  '.ts': {
    read: readCodeLines,
    write: writeCodeLines,
  },
  '.yaml': {
    read: readYaml,
    write: writeYaml,
  },
  '.yml': {
    read: readYaml,
    write: writeYaml,
  },
};

const formatByMark: Readonly<Record<FileFormat, Format>> = {
  [FileFormat.Jsonc]: {
    read: readJson,
    write: writeCommentedJson,
  },
};

const keySortingWriters: ReadonlySet<Format['write']> = new Set([
  writeCommentedJson,
  writeJson,
  writeJsonc,
  writeYaml,
]);

const linesFormat: Format = {
  read: readLines,
  write: writeLines,
};

const iniFormat: Format = {
  read: readIni,
  write: writeIni,
};

const fileNameOf = (path: string): string => path.slice(path.lastIndexOf(PATH_SEPARATOR) + 1);

const extensionOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf(DOT);

  return dot <= 0 ? '' : fileName.slice(dot);
};

const namedFormatOf = (target: ConfigurationTarget): Format | undefined =>
  target.format === undefined
    ? formatByExtension[extensionOf(fileNameOf(target.writtenPath))]
    : formatByMark[target.format];

const formatOf = (file: ConfigurationFile): Format | undefined => {
  const named = namedFormatOf({
    ...file,
    writtenPath: file.filePath,
  });

  if (named !== undefined) {
    return named;
  }

  const fileName = fileNameOf(file.filePath);
  const extension = extensionOf(fileName);

  if (extension !== '' && !RUN_COMMAND_EXTENSION.test(extension) && !fileName.startsWith(DOT)) {
    return undefined;
  }

  if (file.shape === undefined) {
    return SECTION_LINE.test(file.text) ? iniFormat : linesFormat;
  }

  return file.shape === SettingShape.List ? linesFormat : iniFormat;
};

const createConfigurationFormat = (): ConfigurationFormat => ({
  canSortKeys: (target: ConfigurationTarget): boolean => {
    const named = namedFormatOf(target);

    return named !== undefined && keySortingWriters.has(named.write);
  },
  read: (file: ConfigurationFile): Setting | undefined => formatOf(file)?.read(file.text),
  write: (file): string => formatOf(file)?.write(file) ?? file.text,
});

export { createConfigurationFormat };
