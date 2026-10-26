import { settingModel } from '../adapters/configuration/models';
import type {
  ConfigurationFile,
  ConfigurationFormat,
  ConfigurationWrite,
} from '../domain/contracts';
import { SettingShape } from '../domain/contracts';
import type { Setting } from '../domain/entities';

const NEWLINE = '\n';
const PAIR = '=';
const SEPARATOR = '/';
const DOT = '.';
const INDENT = 2;
const JSON_FILE = '.json';
const TEXT_FILE = '.ts';

// A JSON file's settings, or undefined where it holds none; JSON's parse throws only a SyntaxError.
const jsonOf = (text: string): Setting | undefined => {
  try {
    return text === '' ? {} : settingModel.parse(JSON.parse(text));
  } catch {
    return undefined;
  }
};

// A file of no extension: pairs of key=value where its shape or its text says so, else lines.
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

/**
 * The formats as the specs of the presets read them: a .json file as JSON written whole, a .ts file
 * as no settings, a file of no extension as pairs or lines by its shape, and any other as lines.
 */
const createFakeConfigurationFormat = (): ConfigurationFormat => ({
  read: (file: ConfigurationFile): Setting | undefined => {
    if (file.path.endsWith(JSON_FILE)) {
      return jsonOf(file.text);
    }

    if (file.path.endsWith(TEXT_FILE)) {
      return undefined;
    }

    return isOfNoFormat(file.path) && isPairs(file) ? pairsOf(file.text) : linesOf(file.text);
  },
  write: (file: ConfigurationWrite): string => {
    if (file.path.endsWith(JSON_FILE)) {
      return `${JSON.stringify(file.settings, null, INDENT)}${NEWLINE}`;
    }

    return isOfNoFormat(file.path) && isPairs(file)
      ? pairsTextOf(file.settings)
      : `${[
          file.settings,
        ]
          .flat()
          .join(NEWLINE)}${NEWLINE}`;
  },
});

export { createFakeConfigurationFormat };
