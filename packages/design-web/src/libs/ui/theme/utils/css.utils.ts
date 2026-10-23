import { PIXELS_PER_REM, ThemeMode, TokenGroupPath } from '../constants';
import type { ColourValue, DesignTokens, ModeTokens, ShadowLayer } from '../types';
import {
  colourOf,
  cssNameOf,
  curveOf,
  isPrimitive,
  measureOf,
  pathsUnder,
  referenceAt,
  rolesOf,
  scalarOf,
  shadowOf,
} from './tokens.utils';

const ROLE_GROUPS: readonly TokenGroupPath[] = [
  TokenGroupPath.Spacing,
  TokenGroupPath.Size,
  TokenGroupPath.Text,
  TokenGroupPath.Leading,
];

/** the groups that hold their primitives beside the roles that read them */
const TIERED_GROUPS: readonly TokenGroupPath[] = [
  TokenGroupPath.Radius,
  TokenGroupPath.Ring,
  TokenGroupPath.Shadow,
  TokenGroupPath.Scale,
  TokenGroupPath.Layer,
];

const oklchOf = ({ alpha, components }: ColourValue): string =>
  `oklch(${components.join(' ')}${alpha === undefined ? '' : ` / ${alpha}`})`;

const shadowCssOf = (layers: readonly ShadowLayer[]): string =>
  layers
    .map(({ blur, color, offsetX, offsetY, spread }) =>
      [
        offsetX,
        offsetY,
        blur,
        spread,
      ]
        .map(({ unit, value }) => `${value}${unit}`)
        .concat(oklchOf(color))
        .join(' '),
    )
    .join(', ');

const INDENT = '  ';
const NESTED = '    ';

const roleLineOf = (tokens: DesignTokens, path: string, indent: string): string =>
  `${indent}--${cssNameOf(path)}: var(--p-${cssNameOf(referenceAt(tokens, path))});`;

const referencesUnder = (tokens: DesignTokens, groups: readonly TokenGroupPath[]): string[] =>
  pathsUnder(tokens, groups).filter((path) => !isPrimitive(tokens, path));

const primitivesUnder = (tokens: DesignTokens, groups: readonly TokenGroupPath[]): string[] =>
  pathsUnder(tokens, groups).filter((path) => isPrimitive(tokens, path));

const primitiveLines = (tokens: DesignTokens): string[] => [
  ...primitivesUnder(tokens, [
    TokenGroupPath.Colour,
  ]).map((path) => `    --p-${cssNameOf(path)}: ${oklchOf(colourOf(tokens, path))};`),
  ...primitivesUnder(tokens, [
    TokenGroupPath.Dimension,
    TokenGroupPath.Radius,
    TokenGroupPath.Ring,
  ]).map((path) => `    --p-${cssNameOf(path)}: ${measureOf(tokens, path) / PIXELS_PER_REM}rem;`),
  ...primitivesUnder(tokens, [
    TokenGroupPath.Shadow,
  ]).map((path) => `    --p-${cssNameOf(path)}: ${shadowCssOf(shadowOf(tokens, path))};`),
  ...primitivesUnder(tokens, [
    TokenGroupPath.Scale,
    TokenGroupPath.Layer,
  ]).map((path) => `    --p-${cssNameOf(path)}: ${scalarOf(tokens, path)};`),
];

const scalarLines = (tokens: DesignTokens, group: TokenGroupPath, indent: string): string[] =>
  pathsUnder(tokens, [
    group,
  ]).map((path) => `${indent}--${cssNameOf(path)}: ${scalarOf(tokens, path)};`);

const roleLines = (tokens: DesignTokens): string[] => [
  ...[
    ...rolesOf(tokens),
    ...pathsUnder(tokens, ROLE_GROUPS),
    ...referencesUnder(tokens, TIERED_GROUPS),
  ].map((path) => roleLineOf(tokens, path, NESTED)),
  ...pathsUnder(tokens, [
    TokenGroupPath.Duration,
  ]).map((path) => `    --${cssNameOf(path)}: ${measureOf(tokens, path)}ms;`),
  ...pathsUnder(tokens, [
    TokenGroupPath.Ease,
  ]).map((path) => `    --${cssNameOf(path)}: cubic-bezier(${curveOf(tokens, path).join(', ')});`),
  ...scalarLines(tokens, TokenGroupPath.FontWeight, NESTED),
];

/** the light mode on the root, the dark mode under `.dark`; the caller writes the banner */
const emitThemeCss = (modes: ModeTokens): string[] => {
  const light = modes[ThemeMode.Light];
  const dark = modes[ThemeMode.Dark];

  return [
    '',
    '@layer base {',
    '  :root {',
    ...primitiveLines(light),
    '  }',
    '}',
    '',
    '@layer theme {',
    '  :root {',
    ...roleLines(light),
    '  }',
    '}',
    '',
    ':root {',
    ...scalarLines(light, TokenGroupPath.Stroke, INDENT),
    '}',
    '',
    '.dark {',
    ...rolesOf(dark).map((path) => roleLineOf(dark, path, INDENT)),
    ...scalarLines(dark, TokenGroupPath.FontWeight, INDENT),
    ...scalarLines(dark, TokenGroupPath.Stroke, INDENT),
    '}',
    '',
    '@media (prefers-reduced-motion: reduce) {',
    '  :root {',
    ...pathsUnder(light, [
      TokenGroupPath.Duration,
    ]).map((path) => `    --${cssNameOf(path)}: 0ms;`),
    '  }',
    '}',
    '',
  ];
};

const sameNameLine = (path: string): string => `  --${cssNameOf(path)}: var(--${cssNameOf(path)});`;

const renamedLines = (
  paths: readonly string[],
  group: TokenGroupPath,
  nameOf: (name: string) => string,
): string[] =>
  paths.map(
    (path) => `  --${nameOf(cssNameOf(path.slice(group.length)))}: var(--${cssNameOf(path)});`,
  );

/** Tailwind's theme over the roles the root declares, so its classes read them; the caller writes the banner */
const emitTailwindTheme = (
  modes: ModeTokens,
  tailwindRadius: Readonly<Record<string, number>>,
): string[] => {
  const light = modes[ThemeMode.Light];

  return [
    '',
    '@theme inline reference {',
    ...rolesOf(light).map(sameNameLine),
    ...pathsUnder(light, [
      TokenGroupPath.Spacing,
      TokenGroupPath.Size,
      TokenGroupPath.Text,
    ]).map(sameNameLine),
    ...renamedLines(
      pathsUnder(light, [
        TokenGroupPath.Size,
      ]),
      TokenGroupPath.Size,
      (name) => `spacing-${name}`,
    ),
    ...renamedLines(
      pathsUnder(light, [
        TokenGroupPath.Leading,
      ]),
      TokenGroupPath.Leading,
      (name) => `text-${name}--line-height`,
    ),
    ...Object.entries(tailwindRadius).map(
      ([name, pixels]) => `  --radius-${name}: var(--p-radius-${pixels});`,
    ),
    ...referencesUnder(light, [
      TokenGroupPath.Radius,
      TokenGroupPath.Shadow,
      TokenGroupPath.Scale,
    ]).map(sameNameLine),
    ...renamedLines(
      referencesUnder(light, [
        TokenGroupPath.Layer,
      ]),
      TokenGroupPath.Layer,
      (name) => `z-index-${name}`,
    ),
    ...pathsUnder(light, [
      TokenGroupPath.Duration,
      TokenGroupPath.Ease,
      TokenGroupPath.FontWeight,
    ]).map(sameNameLine),
    '}',
    '',
  ];
};

export { emitTailwindTheme, emitThemeCss };
