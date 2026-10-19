import { PERCENT, PIXELS_PER_REM, ThemeMode, TokenGroupPath } from '../constants';
import type { DesignTokens } from '../types';
import {
  cssNameOf,
  curveOf,
  isPrimitive,
  measureOf,
  oklchOf,
  pathsUnder,
  pixelsOf,
  referenceIn,
  scalarIn,
  shareOf,
} from './tokens.utils';

const colourIn = (tokens: DesignTokens, path: string, mode: ThemeMode): string => {
  const primitive = `var(--p-${cssNameOf(referenceIn(tokens, path, mode))})`;
  const share = shareOf(tokens, path);

  return share === undefined
    ? primitive
    : `color-mix(in oklab, ${primitive} ${share * PERCENT}%, transparent)`;
};

/** the raw values, which only the semantic tokens read */
const primitiveLines = (tokens: DesignTokens): string[] => [
  ...pathsUnder(tokens, [
    TokenGroupPath.Colour,
  ])
    .filter((path) => isPrimitive(tokens, path))
    .map((path) => `    --p-${cssNameOf(path)}: oklch(${oklchOf(tokens, path).join(' ')});`),
  ...pathsUnder(tokens, [
    TokenGroupPath.Dimension,
    TokenGroupPath.Radius,
  ]).map((path) => `    --p-${cssNameOf(path)}: ${pixelsOf(tokens, path) / PIXELS_PER_REM}rem;`),
];

/** the semantic tokens Tailwind turns into utilities */
const themeLines = (
  tokens: DesignTokens,
  tailwindRadius: Readonly<Record<string, number>>,
): string[] => [
  ...pathsUnder(tokens, [
    TokenGroupPath.Colour,
  ])
    .filter((path) => !isPrimitive(tokens, path))
    .map(
      (path) =>
        `  --${cssNameOf(path)}: light-dark(${colourIn(tokens, path, ThemeMode.Light)}, ${colourIn(tokens, path, ThemeMode.Dark)});`,
    ),
  ...pathsUnder(tokens, [
    TokenGroupPath.Spacing,
    TokenGroupPath.Size,
  ]).map(
    (path) =>
      `  --${cssNameOf(path)}: var(--p-${cssNameOf(referenceIn(tokens, path, ThemeMode.Light))});`,
  ),
  ...pathsUnder(tokens, [
    TokenGroupPath.Size,
  ]).map(
    (path) =>
      `  --spacing-${cssNameOf(path.slice(TokenGroupPath.Size.length))}: var(--${cssNameOf(path)});`,
  ),
  // Tailwind's own text sizes, so the library's classes and the site's take the one scale
  ...pathsUnder(tokens, [
    TokenGroupPath.Text,
  ]).map(
    (path) =>
      `  --${cssNameOf(path)}: var(--p-${cssNameOf(referenceIn(tokens, path, ThemeMode.Light))});`,
  ),
  ...pathsUnder(tokens, [
    TokenGroupPath.Leading,
  ]).map(
    (path) =>
      `  --text-${cssNameOf(path.slice(TokenGroupPath.Leading.length))}--line-height: var(--p-${cssNameOf(referenceIn(tokens, path, ThemeMode.Light))});`,
  ),
  ...Object.entries(tailwindRadius).map(
    ([name, pixels]) => `  --radius-${name}: var(--p-radius-${pixels});`,
  ),
  ...pathsUnder(tokens, [
    TokenGroupPath.Duration,
  ]).map((path) => `  --${cssNameOf(path)}: ${measureOf(tokens, path)}ms;`),
  ...pathsUnder(tokens, [
    TokenGroupPath.Ease,
  ]).map((path) => `  --${cssNameOf(path)}: cubic-bezier(${curveOf(tokens, path).join(', ')});`),
  ...pathsUnder(tokens, [
    TokenGroupPath.FontWeight,
  ]).map((path) => `  --${cssNameOf(path)}: ${scalarIn(tokens, path, ThemeMode.Light)};`),
];

/** for the tokens Tailwind needs no utility for */
const modeLines = (
  tokens: DesignTokens,
  groups: readonly TokenGroupPath[],
  mode: ThemeMode,
): string[] =>
  pathsUnder(tokens, groups).map(
    (path) => `  --${cssNameOf(path)}: ${scalarIn(tokens, path, mode)};`,
  );

/** from the blank line below its banner, which the caller writes */
const emitThemeCss = (
  tokens: DesignTokens,
  tailwindRadius: Readonly<Record<string, number>>,
): string[] => [
  '',
  '@layer base {',
  '  :root {',
  ...primitiveLines(tokens),
  '  }',
  '}',
  '',
  '@theme {',
  ...themeLines(tokens, tailwindRadius),
  '}',
  '',
  ':root {',
  ...modeLines(
    tokens,
    [
      TokenGroupPath.Stroke,
    ],
    ThemeMode.Light,
  ),
  '}',
  '',
  '.dark {',
  ...modeLines(
    tokens,
    [
      TokenGroupPath.FontWeight,
      TokenGroupPath.Stroke,
    ],
    ThemeMode.Dark,
  ),
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  :root {',
  ...pathsUnder(tokens, [
    TokenGroupPath.Duration,
  ]).map((path) => `    --${cssNameOf(path)}: 0ms;`),
  '  }',
  '}',
  '',
];

export { emitThemeCss };
