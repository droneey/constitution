import type { TerminalTokens, Theme, ThemeInput } from '#/libs/ui';
import { ColourLevel, createTheme, ThemeMode } from '#/libs/ui';

const createPlainTheme = (
  overrides: Partial<ThemeInput> = {},
  tokens?: Readonly<Record<ThemeMode, TerminalTokens>>,
): Theme =>
  createTheme(
    {
      colourLevel: ColourLevel.None,
      isMotionReduced: true,
      mode: ThemeMode.Dark,
      ...overrides,
    },
    tokens,
  );

const ESCAPE = '\u001B';
const BELL = '\u0007';
const STRONG = 'strong';
const markEnd = `${ESCAPE}]8;;${BELL}`;
const mark = new RegExp(`${ESCAPE}\\]8;;(?:mark:(\\w+))?${BELL}`, 'gu');

const markOf = (name: string): string => `${ESCAPE}]8;;mark:${name}${BELL}`;

// Why: a terminal link takes no cell, so Ink lays the marked text out as it would the palette's
// colours.
const createMarkingTheme = (): Theme => ({
  ...createPlainTheme(),
  paint: (tone, text) => `${markOf(tone)}${text}${markEnd}`,
  strong: (text) => `${markOf(STRONG)}${text}${markEnd}`,
});

const markedSpansOf = (
  marked: string | undefined,
): readonly (readonly [
  string,
  string,
])[] => {
  const text = marked ?? '';
  const spans: (readonly [
    string,
    string,
  ])[] = [];
  const marks: string[] = [];
  let spanStart = 0;

  for (const match of text.matchAll(mark)) {
    const spanText = text.slice(spanStart, match.index);

    if (spanText !== '' && marks.length > 0) {
      spans.push([
        marks.join(' '),
        spanText,
      ]);
    }

    if (match[1] === undefined) {
      marks.pop();
    } else {
      marks.push(match[1]);
    }

    spanStart = match.index + match[0].length;
  }

  return spans;
};

const GOLD_BRAND_FILE = {
  color: {
    brand: {
      $type: 'color',
      '300': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.82,
            0.11,
            85,
          ],
          hex: '#e5bf6d',
        },
      },
      '600': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.5,
            0.17,
            85,
          ],
          hex: '#835c00',
        },
      },
      '700': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.42,
            0.086,
            85,
          ],
        },
      },
    },
  },
} as const;

export { createMarkingTheme, createPlainTheme, GOLD_BRAND_FILE, markedSpansOf };
