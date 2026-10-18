import type { PlainColorObject } from 'colorjs.io/fn';
import { mix, OKLCH, sRGB_Linear, to, toGamut } from 'colorjs.io/fn';

import { BASE_SURFACE, ThemeMode } from '../constants';
import { ThemeTokenError } from '../errors';
import type { DesignToken, DesignTokenGroup, DesignTokens, Oklch, TokenValue } from '../types';

const isToken = (node: DesignToken | DesignTokenGroup): node is DesignToken => '$value' in node;

const isNumberList = (tokenValue: TokenValue): tokenValue is readonly number[] =>
  Array.isArray(tokenValue);

const entriesOf = (
  group: DesignTokenGroup,
  path: readonly string[],
): [
  string,
  DesignToken,
][] =>
  Object.entries(group).flatMap(([name, node]) => {
    // A name with a dollar is the group's own field, `$type` or `$description`.
    if (name.startsWith('$') || typeof node === 'string') {
      return [];
    }

    const nodePath = [
      ...path,
      name,
    ];

    return isToken(node)
      ? [
          [
            nodePath.join('.'),
            node,
          ],
        ]
      : entriesOf(node, nodePath);
  });

/** every token of the groups by its dotted path, in the order the source lists them */
const collectTokens = (group: DesignTokenGroup): DesignTokens => new Map(entriesOf(group, []));

/** the path a value `{group.name}` refers to */
const referenceOf = (tokenValue: TokenValue): string | undefined =>
  typeof tokenValue === 'string' && tokenValue.startsWith('{')
    ? tokenValue.slice(1, -1)
    : undefined;

/** @throws {@link ThemeTokenError} when no token has the path */
const tokenAt = (tokens: DesignTokens, path: string): DesignToken => {
  const token = tokens.get(path);

  if (token === undefined) {
    throw new ThemeTokenError(`no token ${path}`);
  }

  return token;
};

const valueIn = (token: DesignToken, mode: ThemeMode): TokenValue =>
  mode === ThemeMode.Dark ? (token.$extensions?.mode?.dark ?? token.$value) : token.$value;

/** the tokens of the groups, in the order the source lists them */
const pathsUnder = (tokens: DesignTokens, groups: readonly string[]): string[] =>
  [
    ...tokens.keys(),
  ].filter((path) => groups.some((group) => path.startsWith(group)));

const isPrimitive = (tokens: DesignTokens, path: string): boolean =>
  referenceOf(tokenAt(tokens, path).$value) === undefined;

/** @throws {@link ThemeTokenError} when the token refers to no other in the mode */
const referenceIn = (tokens: DesignTokens, path: string, mode: ThemeMode): string => {
  const target = referenceOf(valueIn(tokenAt(tokens, path), mode));

  if (target === undefined) {
    throw new ThemeTokenError(`${path} refers to no token in the ${mode} mode`);
  }

  return target;
};

/** @throws {@link ThemeTokenError} when the token holds no number or text in the mode */
const scalarIn = (tokens: DesignTokens, path: string, mode: ThemeMode): number | string => {
  const scalar = valueIn(tokenAt(tokens, path), mode);

  if (typeof scalar === 'object') {
    throw new ThemeTokenError(`${path} holds no number or text in the ${mode} mode`);
  }

  return scalar;
};

/** @throws {@link ThemeTokenError} when the token holds no colour */
const oklchOf = (tokens: DesignTokens, path: string): Oklch => {
  const colour = tokenAt(tokens, path).$value;

  if (typeof colour !== 'object' || !('components' in colour)) {
    throw new ThemeTokenError(`${path} holds no colour`);
  }

  return colour.components;
};

/** @throws {@link ThemeTokenError} when the token holds no dimension or duration */
const measureOf = (tokens: DesignTokens, path: string): number => {
  const measure = tokenAt(tokens, path).$value;

  if (typeof measure !== 'object' || !('unit' in measure)) {
    throw new ThemeTokenError(`${path} holds no dimension or duration`);
  }

  return measure.value;
};

/** @throws {@link ThemeTokenError} when the token holds no list of numbers */
const curveOf = (tokens: DesignTokens, path: string): readonly number[] => {
  const curve = tokenAt(tokens, path).$value;

  if (!isNumberList(curve)) {
    throw new ThemeTokenError(`${path} holds no list of numbers`);
  }

  return curve;
};

/** the pixels of a dimension, through the references that lead to it */
const pixelsOf = (tokens: DesignTokens, path: string): number => {
  const target = referenceOf(tokenAt(tokens, path).$value);

  return target === undefined ? measureOf(tokens, path) : pixelsOf(tokens, target);
};

const shareOf = (tokens: DesignTokens, path: string): number | undefined =>
  tokenAt(tokens, path).$extensions?.['dev.droneey.share'];

/** an OKLCH colour in linear sRGB, each channel clipped into the gamut */
const linearSrgbOf = (oklch: Oklch): PlainColorObject => {
  const linear = to(
    {
      space: OKLCH,
      coords: [
        ...oklch,
      ],
      alpha: 1,
    },
    sRGB_Linear,
  );

  return toGamut(linear, {
    method: 'clip',
  });
};

/** the colour a semantic token shows in the mode, laid over the base surface by its share */
const colourOf = (tokens: DesignTokens, path: string, mode: ThemeMode): PlainColorObject => {
  const own = linearSrgbOf(oklchOf(tokens, referenceIn(tokens, path, mode)));
  const share = shareOf(tokens, path) ?? 1;

  if (share === 1) {
    return own;
  }

  // Stryker disable next-line ObjectLiteral: named or not, the space is linear sRGB, the first colour's
  return mix(colourOf(tokens, BASE_SURFACE, mode), own, share, {
    space: sRGB_Linear,
  });
};

const cssNameOf = (path: string): string => path.replaceAll('.', '-');

export {
  collectTokens,
  colourOf,
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
};
