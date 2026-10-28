import type { ConfigurationWrite } from '../../domain/contracts';
import type { Setting, SettingMap } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { Anchor, Commenting } from './block-comments.utils';
import { noTextLines, withBlockComments } from './block-comments.utils';
import { ownFieldOf } from './own-field.utils';
import { NEWLINE } from './text.constants';

const SECTION = /^\s*\[(.+)\]\s*$/;
const PAIR = /^\s*([^#;=\s][^=]*?)\s*=\s*(.*?)\s*$/;
const KEY = /^\s*([^#;=\s][^=]*?)\s*=/;
const COMMENT = /^\s*[#;]/;
const BOOLEAN = /^(?:true|false)$/;
const WHOLE_NUMBER = /^\d+$/;
const TRAILING_NEWLINE = /\n$/;
// The pairs before the first header, a file's top keys, are the section without a name.
const TOP = '';
// The section of every file, which a later section narrows, so it is written before the others: the
// rule of the one tool whose ini file the presets give sections.
const ANY_FILE = '*';

const scalarOf = (raw: string): Setting => {
  if (BOOLEAN.test(raw)) {
    return raw === 'true';
  }

  return WHOLE_NUMBER.test(raw) ? Number(raw) : raw;
};

/** An ini text's settings: a map of each section's pairs, the top keys under the empty name. */
const readIni = (text: string): Setting => {
  // A map, so a section named as a field every object holds, such as valueOf, is a section too.
  const sections = new Map<string, SettingMap>();
  let section = TOP;

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

// Every header, comment and blank stays; a pair only while the settings hold its key.
const keptOf = (input: { lines: readonly string[]; settings: SettingMap }): string[] => {
  let section = TOP;

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

// The comments right above a header are its own, so what comes before the header comes before them.
const openingOf = (lines: readonly string[], header: number): number =>
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

  let place = end < lines.length ? openingOf(lines, end) : end;

  while (lines[place - 1]?.trim() === '') {
    place -= 1;
  }

  lines.splice(place, 0, pair);
};

const headerAt = (lines: string[], name: string): number => {
  const at = lines.findIndex((line) => line.trim() === `[${name}]`);

  if (at >= 0) {
    return at;
  }

  const first = lines.findIndex((line) => SECTION.test(line));

  if (name === ANY_FILE && first >= 0) {
    const opening = openingOf(lines, first);

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

// The top pairs first, as they stand above every header; headerAt puts the section of every file
// before the others.
const rankOf = (name: string): number => Number(name !== TOP);

const writeSettings = (input: ConfigurationWrite): string => {
  const settings = Settings.isMap(input.settings) ? input.settings : {};
  const lines = keptOf({
    lines: linesOf(input.text),
    settings,
  });
  const sections = Object.entries(settings).toSorted(
    ([left], [right]) => rankOf(left) - rankOf(right),
  );

  for (const [name, pairs] of sections) {
    const header = name === TOP ? -1 : headerAt(lines, name);

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
  let section = TOP;

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
  textLinesOf: noTextLines,
};

const writeIni = withBlockComments({
  commenting: iniCommenting,
  write: writeSettings,
});

export { readIni, writeIni };
