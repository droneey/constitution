import type StyleDictionary from 'style-dictionary';
import type { DesignTokens as Source } from 'style-dictionary/types';

import { ThemeTokenError } from '../errors';
import type { ColourValue, DesignTokens, MeasureValue, TokenValue } from '../types';
import { isNumberList, isOklch, isRecord } from './guards.utils';

/** a platform that writes no file */
const READ_PLATFORM = 'tokens';

const colourValueOf = (raw: Readonly<Record<string, unknown>>): ColourValue | undefined => {
  const { alpha, colorSpace, components, hex } = raw;

  if (
    colorSpace !== 'oklch' ||
    !isOklch(components) ||
    !(hex === undefined || typeof hex === 'string') ||
    !(alpha === undefined || typeof alpha === 'number')
  ) {
    return undefined;
  }

  return {
    colorSpace,
    components,
    ...(alpha === undefined
      ? {}
      : {
          alpha,
        }),
    ...(hex === undefined
      ? {}
      : {
          hex,
        }),
  };
};

const measureValueOf = ({
  unit,
  value: amount,
}: Readonly<Record<string, unknown>>): MeasureValue | undefined =>
  typeof unit === 'string' && typeof amount === 'number'
    ? {
        unit,
        value: amount,
      }
    : undefined;

const tokenValueOf = (raw: unknown, path: string): TokenValue => {
  if (typeof raw === 'string' || typeof raw === 'number' || isNumberList(raw)) {
    return raw;
  }

  const read = isRecord(raw) ? (colourValueOf(raw) ?? measureValueOf(raw)) : undefined;

  if (read === undefined) {
    throw new ThemeTokenError(`${path} holds a value of no form the theme reads`);
  }

  return read;
};

/**
 * A later source wins; each value stays as written, so a role still names its step. The build
 * passes Style Dictionary in, so only the build needs it.
 *
 * @throws {@link ThemeTokenError} when a token holds a value of no form the theme reads
 */
const readTokens = async (
  input:
    | {
        source: readonly string[];
      }
    | {
        tokens: Source;
      },
  Dictionary: typeof StyleDictionary,
): Promise<DesignTokens> => {
  const dictionary = new Dictionary(
    {
      ...('source' in input
        ? {
            source: [
              ...input.source,
            ],
          }
        : {
            tokens: input.tokens,
          }),
      // Stryker disable ObjectLiteral,StringLiteral: the log only quiets the run
      log: {
        // a brand overrides the design system's tokens on purpose
        verbosity: 'silent',
        warnings: 'disabled',
      },
      // Stryker restore ObjectLiteral,StringLiteral
      platforms: {
        [READ_PLATFORM]: {},
      },
    },
    // Stryker disable next-line ObjectLiteral: only a failure tells it apart, by a hang
    {
      // a constructor that initialises leaves a failure unawaited, and every later call waiting
      // Stryker disable next-line BooleanLiteral: only a failure tells it apart, by a hang
      init: false,
    },
  );

  await dictionary.init();

  const { allTokens } = await dictionary.getPlatformTokens(READ_PLATFORM);

  return new Map(
    allTokens.map((token) => {
      const path = token.path.join('.');

      return [
        path,
        {
          $value: tokenValueOf(token.original.$value, path),
        },
      ];
    }),
  );
};

export { readTokens };
