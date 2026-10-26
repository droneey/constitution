import type { ConfigurationFile, ConfigurationFormat } from '../../domain/contracts';
import { SettingShape } from '../../domain/contracts';
import type { Setting } from '../../domain/entities';
import { FileFormat } from '../../domain/value-objects';
import { readIni, writeIni } from './ini-text.utils';
import { readJson, writeCommentedJson, writeJson, writeJsonc } from './json-text.utils';
import { readLines, writeLines } from './lines-text.utils';
import type { SettingsText } from './settings-text.types';
import { readToml } from './toml-lines.utils';
import { writeToml } from './toml-text.utils';
import { readYaml, writeYaml } from './yaml-text.utils';

interface Format {
  readonly read: (text: string) => Setting | undefined;
  readonly write: (input: SettingsText) => string;
}

const SEPARATOR = '/';
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

const linesFormat: Format = {
  read: readLines,
  write: writeLines,
};

const iniFormat: Format = {
  read: readIni,
  write: writeIni,
};

// A file of no format of its own takes the shape its settings are given, or the one its text shows:
// sections of keys, else lines.
const formatOf = (file: ConfigurationFile): Format | undefined => {
  if (file.format !== undefined) {
    return marked[file.format];
  }

  const name = file.path.slice(file.path.lastIndexOf(SEPARATOR) + 1);
  const dot = name.lastIndexOf(DOT);
  const extension = dot <= 0 ? '' : name.slice(dot);
  const known = formats[extension];

  if (known !== undefined) {
    return known;
  }

  if (extension !== '' && !RC_EXTENSION.test(extension) && !name.startsWith(DOT)) {
    return undefined;
  }

  if (file.shape === undefined) {
    return SECTION_LINE.test(file.text) ? iniFormat : linesFormat;
  }

  return file.shape === SettingShape.List ? linesFormat : iniFormat;
};

const createConfigurationFormat = (): ConfigurationFormat => ({
  read: (file: ConfigurationFile): Setting | undefined => formatOf(file)?.read(file.text),
  write: (file): string =>
    formatOf(file)?.write({
      marks: file.marks,
      settings: file.settings,
      sorted: file.sorted ?? [],
      text: file.text,
    }) ?? file.text,
});

export { createConfigurationFormat };
