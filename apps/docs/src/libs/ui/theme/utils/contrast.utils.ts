import type { PlainColorObject } from 'colorjs.io/fn';
import { ColorSpace, contrastWCAG21, getColor, sRGB } from 'colorjs.io/fn';

import {
  CODE_SCOPES,
  EDITOR_FOREGROUND,
  MODE_LABEL_WIDTH,
  RATIO_DIGITS,
  ThemeMode,
  TokenGroupPath,
} from '../constants';
import type {
  CodeTheme,
  ContrastCheck,
  ContrastPair,
  DesignTokens,
  ThemeContrastInput,
} from '../types';
import { colourOf } from './tokens.utils';

const hexColourOf = (hex: string): PlainColorObject => {
  // The functional API parses only the formats of the spaces registered with it; hex is sRGB's.
  ColorSpace.register(sRGB);

  return getColor(hex);
};

const checkPair = (
  tokens: DesignTokens,
  { foreground, background, minimum }: ContrastPair,
  mode: ThemeMode,
): ContrastCheck => {
  const pair = `${foreground} on ${background}`;

  return {
    mode,
    label: pair,
    subject: pair,
    ratio: contrastWCAG21(
      colourOf(tokens, `${TokenGroupPath.Colour}${foreground}`, mode),
      colourOf(tokens, `${TokenGroupPath.Colour}${background}`, mode),
    ),
    minimum,
  };
};

const codeForegroundsOf = (theme: CodeTheme): string[] =>
  [
    theme.colors?.[EDITOR_FOREGROUND],
    ...theme.tokenColors
      .filter((rule) =>
        CODE_SCOPES.test(
          [
            rule.scope,
          ]
            .flat()
            .join(','),
        ),
      )
      .map((rule) => rule.settings.foreground),
  ].filter((colour) => colour !== undefined);

const checkCode = (
  { tokens, settings: { code }, codeThemes }: ThemeContrastInput,
  mode: ThemeMode,
  background: string,
): ContrastCheck => {
  const surface = colourOf(tokens, `${TokenGroupPath.Colour}${background}`, mode);

  return {
    mode,
    label: `code (${code.themes[mode]}) on ${background}`,
    subject: `code on ${background}`,
    ratio: Math.min(
      ...codeForegroundsOf(codeThemes[mode]).map((colour) =>
        contrastWCAG21(hexColourOf(colour), surface),
      ),
    ),
    minimum: code.minimum,
  };
};

const checkThemeContrast = (input: ThemeContrastInput): ContrastCheck[] =>
  Object.values(ThemeMode).flatMap((mode) => [
    ...input.settings.contrast.map((pair) => checkPair(input.tokens, pair, mode)),
    ...input.settings.code.backgrounds.map((background) => checkCode(input, mode, background)),
  ]);

const formatContrastReport = ({ mode, label, ratio, minimum }: ContrastCheck): string =>
  `${mode.padEnd(MODE_LABEL_WIDTH)} ${label}: ${ratio.toFixed(RATIO_DIGITS)} (needs ${minimum})`;

const listContrastFailures = (checks: readonly ContrastCheck[]): string[] =>
  checks
    .filter(({ ratio, minimum }) => ratio < minimum)
    .map(
      ({ mode, subject, ratio, minimum }) =>
        `${mode}: ${subject} is ${ratio.toFixed(RATIO_DIGITS)}, needs ${minimum}`,
    );

export { checkThemeContrast, formatContrastReport, listContrastFailures };
