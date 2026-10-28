import { PATH_SEPARATOR } from '#/kernel/constants';

import type {
  ConfigurationFile,
  ConfigurationFormat,
  ConfigurationTarget,
  ConfigurationWrite,
} from '../../domain/contracts';
import { SettingShape } from '../../domain/contracts';
import type { Setting } from '../../domain/entities';
import { FileFormat } from '../../domain/value-objects';
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
// A file whose name is a dotfile or a run-command file of no format of its own.
const RC_EXTENSION = /\.[^.]+rc$/;
const SECTION_LINE = /^\s*\[[^\]]+\]\s*$/m;

const formats: Readonly<Record<string, Format>> = {
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
  // A source file holds the lines its entries give, as a declaration file holds its imports.
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

const marked: Readonly<Record<FileFormat, Format>> = {
  [FileFormat.Jsonc]: {
    read: readJson,
    write: writeCommentedJson,
  },
};

// The writers that keep the maps the presets mark sorted in their order as texts.
const sortingWriters: ReadonlySet<Format['write']> = new Set([
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

// The format a file's mark or its extension names; none for a file of no format of its own.
const namedFormatOf = (target: ConfigurationTarget): Format | undefined =>
  target.format === undefined
    ? formats[extensionOf(fileNameOf(target.writtenPath))]
    : marked[target.format];

// A file of no format of its own takes the shape its settings are given, or the one its text shows:
// sections of keys, else lines.
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

  if (extension !== '' && !RC_EXTENSION.test(extension) && !fileName.startsWith(DOT)) {
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

    return named !== undefined && sortingWriters.has(named.write);
  },
  read: (file: ConfigurationFile): Setting | undefined => formatOf(file)?.read(file.text),
  write: (file): string => formatOf(file)?.write(file) ?? file.text,
});

export { createConfigurationFormat };
