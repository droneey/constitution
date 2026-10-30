import type {
  ConfigurationFile,
  ConfigurationFormat,
  ConfigurationTarget,
  ConfigurationWrite,
} from '../application/contracts';
import { SettingShape } from '../application/contracts';
import type { Setting } from '../domain/entities';
import { settingModel } from '../infrastructure/configuration/models';

const NEWLINE = '\n';
const PAIR = '=';
const SEPARATOR = '/';
const DOT = '.';
const INDENT = 2;
const JSON_FILE = '.json';
const TEXT_FILE = '.py';

const jsonOf = (text: string): Setting | undefined => {
  try {
    return text === '' ? {} : settingModel.parse(JSON.parse(text));
  } catch {
    return undefined;
  }
};

const isPairs = (file: ConfigurationFile): boolean =>
  file.shape === SettingShape.Map || (file.shape === undefined && file.text.includes(PAIR));

const isOfNoFormat = (path: string): boolean => {
  const name = path.slice(path.lastIndexOf(SEPARATOR) + 1);

  return name.lastIndexOf(DOT) <= 0;
};

const pairsOf = (text: string): Setting =>
  Object.fromEntries(
    text
      .split(NEWLINE)
      .filter((line) => line.includes(PAIR))
      .map((line) => [
        line.slice(0, line.indexOf(PAIR)),
        line.slice(line.indexOf(PAIR) + 1),
      ]),
  );

const pairsTextOf = (settings: Setting): string =>
  Object.entries(settings)
    .map(([key, held]) => `${key}${PAIR}${String(held)}${NEWLINE}`)
    .join('');

const linesOf = (text: string): Setting => text.split(NEWLINE).filter((line) => line !== '');

const createFakeConfigurationFormat = (): ConfigurationFormat => ({
  canSortKeys: (target: ConfigurationTarget): boolean => target.writtenPath.endsWith(JSON_FILE),
  read: (file: ConfigurationFile): Setting | undefined => {
    if (file.filePath.endsWith(JSON_FILE)) {
      return jsonOf(file.text);
    }

    if (file.filePath.endsWith(TEXT_FILE)) {
      return undefined;
    }

    return isOfNoFormat(file.filePath) && isPairs(file) ? pairsOf(file.text) : linesOf(file.text);
  },
  write: (file: ConfigurationWrite): string => {
    if (file.filePath.endsWith(TEXT_FILE)) {
      return file.text;
    }

    if (file.filePath.endsWith(JSON_FILE)) {
      return `${JSON.stringify(file.settings, null, INDENT)}${NEWLINE}`;
    }

    return isOfNoFormat(file.filePath) && isPairs(file)
      ? pairsTextOf(file.settings)
      : `${[
          file.settings,
        ]
          .flat()
          .join(NEWLINE)}${NEWLINE}`;
  },
});

export { createFakeConfigurationFormat };
