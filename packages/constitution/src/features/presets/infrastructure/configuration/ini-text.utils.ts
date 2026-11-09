import type { ConfigurationWrite } from '../../domain/configuration-file/entities';
import type { Setting, SettingMap } from '../../domain/setting/entities';
import { Setting as Settings } from '../../domain/setting/entities';
import type { Anchor, Commenting } from './block-comments.utils';
import { noLinesInsideTextValues, withBlockComments } from './block-comments.utils';
import { ownFieldOf } from './own-field.utils';
import { NEWLINE } from './text.constants';

const SECTION = /^\s*\[(.+)\]\s*$/;
const PAIR = /^\s*([^#;=\s][^=]*?)\s*=\s*(.*?)\s*$/;
const KEY = /^\s*([^#;=\s][^=]*?)\s*=/;
const COMMENT = /^\s*[#;]/;
const BOOLEAN = /^(?:true|false)$/;
const WHOLE_NUMBER = /^\d+$/;
const TRAILING_NEWLINE = /\n$/;
const TOP_SECTION = '';
// Why: the section of every file, which a later section narrows, is written before the others: the
// rule of the one tool whose ini file the presets give sections.
const EVERY_FILE_SECTION = '*';

const scalarOf = (raw: string): Setting => {
  if (BOOLEAN.test(raw)) {
    return raw === 'true';
  }

  return WHOLE_NUMBER.test(raw) ? Number(raw) : raw;
};

const readIni = (text: string): Setting => {
  // Why: a map, so a section named as a field every object holds, such as valueOf, is a section
  // too.
  const sections = new Map<string, SettingMap>();
  let section = TOP_SECTION;

  for (const line of text.split(NEWLINE)) {
    const header = SECTION.exec(line)?.[1];
    const pair = PAIR.exec(line);

    if (header !== undefined) {
      section = header;
      sections.set(section, sections.get(section) ?? {});
    } else if (pair !== null) {
      sections.set(section, {
        ...sections.get(section),
        [String(pair[1])]: scalarOf(String(pair[2])),
      });
    }
  }

  return Object.fromEntries(sections);
};

const linesOf = (text: string): string[] =>
  text === '' ? [] : text.replace(TRAILING_NEWLINE, '').split(NEWLINE);

const linesTheSettingsKeep = (input: {
  lines: readonly string[];
  settings: SettingMap;
}): string[] => {
  let section = TOP_SECTION;

  return input.lines.filter((line) => {
    const header = SECTION.exec(line)?.[1];
    const key = KEY.exec(line)?.[1];

    section = header ?? section;

    const held = ownFieldOf(input.settings, section);

    return (
      header !== undefined ||
      key === undefined ||
      (Settings.isMap(held) && Object.hasOwn(held, key))
    );
  });
};

const headerCommentsStartOf = (lines: readonly string[], header: number): number =>
  lines.slice(0, header).findLastIndex((line) => !COMMENT.test(line)) + 1;

const endOf = (lines: readonly string[], header: number): number => {
  let end = header + 1;

  while (end < lines.length && !SECTION.test(String(lines[end]))) {
    end += 1;
  }

  return end;
};

const placePair = (input: {
  header: number;
  held: Setting;
  key: string;
  lines: string[];
}): void => {
  const { header, key, lines } = input;
  const end = endOf(lines, header);
  const pair = `${key} = ${String(input.held)}`;
  const at = lines.slice(header + 1, end).findIndex((line) => KEY.exec(line)?.[1] === key);

  if (at >= 0) {
    lines[header + 1 + at] = pair;

    return;
  }

  let place = end < lines.length ? headerCommentsStartOf(lines, end) : end;

  while (lines[place - 1]?.trim() === '') {
    place -= 1;
  }

  lines.splice(place, 0, pair);
};

const ensuredHeaderLineOf = (lines: string[], name: string): number => {
  const at = lines.findIndex((line) => line.trim() === `[${name}]`);

  if (at >= 0) {
    return at;
  }

  const first = lines.findIndex((line) => SECTION.test(line));

  if (name === EVERY_FILE_SECTION && first >= 0) {
    const opening = headerCommentsStartOf(lines, first);

    lines.splice(opening, 0, `[${name}]`, '');

    return opening;
  }

  if (lines.length > 0 && lines.at(-1) !== '') {
    lines.push('');
  }

  lines.push(`[${name}]`);

  // Stryker disable next-line ArithmeticOperator: a pair placed past a new header, the last line, lands at the end alike
  return lines.length - 1;
};

const topSectionFirstRankOf = (name: string): number => Number(name !== TOP_SECTION);

const writeSettings = (input: ConfigurationWrite): string => {
  const settings = Settings.isMap(input.settings) ? input.settings : {};
  const lines = linesTheSettingsKeep({
    lines: linesOf(input.text),
    settings,
  });
  const sections = Object.entries(settings).toSorted(
    ([left], [right]) => topSectionFirstRankOf(left) - topSectionFirstRankOf(right),
  );

  for (const [name, pairs] of sections) {
    const header = name === TOP_SECTION ? -1 : ensuredHeaderLineOf(lines, name);

    for (const [key, held] of Object.entries(Settings.isMap(pairs) ? pairs : {})) {
      placePair({
        header,
        held,
        key,
        lines,
      });
    }
  }

  return `${lines.join(NEWLINE)}${NEWLINE}`;
};

const iniAnchorsOf = (text: string): readonly Anchor[] => {
  let section = TOP_SECTION;

  return text
    .split(NEWLINE)
    .map((line, at) => {
      const header = SECTION.exec(line)?.[1];
      const keys =
        header === undefined
          ? [
              section,
              KEY.exec(line)?.[1],
            ]
          : [
              header,
            ];

      section = header ?? section;

      return {
        at,
        keys,
      };
    })
    .filter(
      (
        opened,
      ): opened is {
        at: number;
        keys: string[];
      } => opened.keys.every((key) => key !== undefined),
    )
    .map(({ at, keys }) => ({
      line: at,
      keyPath: keys.map((key) => ({
        key,
      })),
    }));
};

const iniCommenting: Commenting = {
  anchorsOf: iniAnchorsOf,
  prefix: '#',
  linesInsideTextValuesOf: noLinesInsideTextValues,
};

const writeIni = withBlockComments({
  commenting: iniCommenting,
  write: writeSettings,
});

export { readIni, writeIni };
