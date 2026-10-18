import {
  CODE_SCOPES,
  CONTRAST_FLARE,
  EDITOR_FOREGROUND,
  LUMINANCE_WEIGHTS,
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
  LinearRgb,
  ThemeContrastInput,
} from '../types';
import { dotProduct, hexToLinearSrgb } from './colour.utils';
import { colourOf } from './tokens.utils';

/** WCAG 2's contrast ratio of two colours, from 1 to 21 */
const contrastRatio = (one: LinearRgb, other: LinearRgb): number => {
  const first = dotProduct(LUMINANCE_WEIGHTS, one);
  const second = dotProduct(LUMINANCE_WEIGHTS, other);

  return (Math.max(first, second) + CONTRAST_FLARE) / (Math.min(first, second) + CONTRAST_FLARE);
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
    ratio: contrastRatio(
      colourOf(tokens, `${TokenGroupPath.Colour}${foreground}`, mode),
      colourOf(tokens, `${TokenGroupPath.Colour}${background}`, mode),
    ),
    minimum,
  };
};

/** the colours code text is written in: the editor's own, and those of the scopes code shows */
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
        contrastRatio(hexToLinearSrgb(colour), surface),
      ),
    ),
    minimum: code.minimum,
  };
};

/** every pair the settings name and the code of each mode on each code background, mode by mode */
const checkThemeContrast = (input: ThemeContrastInput): ContrastCheck[] =>
  Object.values(ThemeMode).flatMap((mode) => [
    ...input.settings.contrast.map((pair) => checkPair(input.tokens, pair, mode)),
    ...input.settings.code.backgrounds.map((background) => checkCode(input, mode, background)),
  ]);

/** a line of the report: the mode, the pair, the ratio it reached and the one it needs */
const formatContrastReport = ({ mode, label, ratio, minimum }: ContrastCheck): string =>
  `${mode.padEnd(MODE_LABEL_WIDTH)} ${label}: ${ratio.toFixed(RATIO_DIGITS)} (needs ${minimum})`;

/** a refusal for each check below its minimum */
const listContrastFailures = (checks: readonly ContrastCheck[]): string[] =>
  checks
    .filter(({ ratio, minimum }) => ratio < minimum)
    .map(
      ({ mode, subject, ratio, minimum }) =>
        `${mode}: ${subject} is ${ratio.toFixed(RATIO_DIGITS)}, needs ${minimum}`,
    );

export { checkThemeContrast, formatContrastReport, listContrastFailures };
