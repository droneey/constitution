import { TokenGroupPath } from '../constants';
import { ThemeTokenError } from '../errors';
import type { ColourValue, DesignToken, DesignTokens, ShadowLayer, TokenValue } from '../types';

const isNumberList = (tokenValue: TokenValue): tokenValue is readonly number[] =>
  Array.isArray(tokenValue) && tokenValue.every((entry) => typeof entry === 'number');

const isShadow = (tokenValue: TokenValue): tokenValue is readonly ShadowLayer[] =>
  Array.isArray(tokenValue) && !isNumberList(tokenValue);

const referenceOf = (tokenValue: TokenValue): string | undefined =>
  typeof tokenValue === 'string' && tokenValue.startsWith('{')
    ? tokenValue.slice(1, -1)
    : undefined;

const tokenAt = (tokens: DesignTokens, path: string): DesignToken => {
  const token = tokens.get(path);

  if (token === undefined) {
    throw new ThemeTokenError(`no token ${path}`);
  }

  return token;
};

const pathsUnder = (tokens: DesignTokens, groups: readonly string[]): string[] =>
  [
    ...tokens.keys(),
  ].filter((path) => groups.some((group) => path.startsWith(group)));

const isPrimitive = (tokens: DesignTokens, path: string): boolean =>
  referenceOf(tokenAt(tokens, path).$value) === undefined;

const referenceAt = (tokens: DesignTokens, path: string): string => {
  const target = referenceOf(tokenAt(tokens, path).$value);

  if (target === undefined) {
    throw new ThemeTokenError(`${path} refers to no token`);
  }

  tokenAt(tokens, target);

  return target;
};

const scalarOf = (tokens: DesignTokens, path: string): number | string => {
  const scalar = tokenAt(tokens, path).$value;

  if (typeof scalar === 'object') {
    throw new ThemeTokenError(`${path} holds no number or text`);
  }

  return scalar;
};

const colourOf = (tokens: DesignTokens, path: string): ColourValue => {
  const colour = tokenAt(tokens, path).$value;

  if (typeof colour !== 'object' || !('components' in colour)) {
    throw new ThemeTokenError(`${path} holds no colour`);
  }

  return colour;
};

const measureOf = (tokens: DesignTokens, path: string): number => {
  const measure = tokenAt(tokens, path).$value;

  if (typeof measure !== 'object' || !('unit' in measure)) {
    throw new ThemeTokenError(`${path} holds no dimension or duration`);
  }

  return measure.value;
};

const curveOf = (tokens: DesignTokens, path: string): readonly number[] => {
  const curve = tokenAt(tokens, path).$value;

  if (!isNumberList(curve)) {
    throw new ThemeTokenError(`${path} holds no list of numbers`);
  }

  return curve;
};

const shadowOf = (tokens: DesignTokens, path: string): readonly ShadowLayer[] => {
  const shadow = tokenAt(tokens, path).$value;

  if (!isShadow(shadow)) {
    throw new ThemeTokenError(`${path} holds no shadow`);
  }

  return shadow;
};

const rolesOf = (tokens: DesignTokens): string[] =>
  pathsUnder(tokens, [
    TokenGroupPath.Colour,
  ]).filter((path) => !isPrimitive(tokens, path));

const cssNameOf = (path: string): string => path.replaceAll('.', '-');

export {
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
};
