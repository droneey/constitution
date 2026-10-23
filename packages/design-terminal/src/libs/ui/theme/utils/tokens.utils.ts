import { TokenGroupPath } from '../constants';
import { ThemeTokenError } from '../errors';
import type { ColourValue, DesignToken, DesignTokens, TokenValue } from '../types';

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

const pathsUnder = (tokens: DesignTokens, group: string): string[] =>
  [
    ...tokens.keys(),
  ].filter((path) => path.startsWith(group));

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

const pixelsOf = (tokens: DesignTokens, path: string): number => {
  const target = referenceOf(tokenAt(tokens, path).$value);

  return target === undefined ? measureOf(tokens, path) : pixelsOf(tokens, target);
};

const roleTargetsOf = (
  tokens: DesignTokens,
): (readonly [
  string,
  string,
])[] =>
  pathsUnder(tokens, TokenGroupPath.Colour).flatMap((path) => {
    const target = referenceOf(tokenAt(tokens, path).$value);

    return target === undefined
      ? []
      : [
          [
            path,
            target,
          ] as const,
        ];
  });

export { colourOf, measureOf, pathsUnder, pixelsOf, roleTargetsOf };
