import type { Dictionary, FormatFn, TransformedToken } from 'style-dictionary/types';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

import { TYPOGRAPHY_TYPE, TypographyPart } from '../constants';
import { referencedNameOf, referencesOf } from './references.utils';

interface WrittenVariable {
  readonly cssValue: string;
  readonly name: string;
}

// Why: CSS's `font` shorthand takes the parts in this order, and it has no letter spacing.
const FONT_SHORTHAND_PARTS = [
  [
    '',
    TypographyPart.FontWeight,
  ],
  [
    ' ',
    TypographyPart.FontSize,
  ],
  [
    '/',
    TypographyPart.LineHeight,
  ],
  [
    ' ',
    TypographyPart.FontFamily,
  ],
] as const;

/** @throws {MalformedTokenError} when a style of text has a part that refers to no token */
const fontShorthandOf = (token: TransformedToken, dictionary: Dictionary): string =>
  FONT_SHORTHAND_PARTS.map(
    ([separator, partName]) =>
      `${separator}var(--${referencedNameOf(token, partName, dictionary)})`,
  ).join('');

const withValueOf = (
  token: TransformedToken,
  { name, cssValue }: WrittenVariable,
): TransformedToken => ({
  ...token,
  name,
  $value: cssValue,
  // Stryker disable next-line ObjectLiteral: the formatter asks of the original only whether it holds a reference, and neither holds one
  original: {
    ...token.original,
    $value: cssValue,
  },
});

/** @throws {MalformedTokenError} when a style of text has a part that refers to no token */
const writtenTokensOf = (token: TransformedToken, dictionary: Dictionary): TransformedToken[] =>
  token.$type === TYPOGRAPHY_TYPE
    ? [
        withValueOf(token, {
          name: token.name,
          cssValue: fontShorthandOf(token, dictionary),
        }),
        withValueOf(token, {
          name: `${token.name}--letter-spacing`,
          cssValue: `var(--${referencedNameOf(token, TypographyPart.LetterSpacing, dictionary)})`,
        }),
      ]
    : [
        token,
      ];

const readsModeToken = (token: TransformedToken, dictionary: Dictionary): boolean => {
  const tokenValue: unknown = token.original.$value;

  return (
    token.isSource ||
    referencesOf(tokenValue, dictionary).some((reference) => readsModeToken(reference, dictionary))
  );
};

// Why: Style Dictionary's `css/variables` writes its `font` shorthand of resolved values, which a
// mode that redefines a weight never reaches; and a variable resolves its references where it is
// declared, so a mode that writes only its own tokens also writes every token that reads one.
/** @throws {MalformedTokenError} when a style of text has a part that refers to no token */
const modeVariables: FormatFn = async ({ dictionary, options }) => {
  const { outputReferences, usesDtcg } = options;
  const modeTokensOnly: unknown = options.modeTokensOnly;
  const selector: unknown = options.selector;
  const allTokens = dictionary.allTokens
    .filter((token) => modeTokensOnly !== true || readsModeToken(token, dictionary))
    .flatMap((token) => writtenTokensOf(token, dictionary));
  const variables = formattedVariables({
    format: 'css',
    dictionary: {
      ...dictionary,
      allTokens,
    },
    outputReferences,
    usesDtcg,
  });

  return `${await fileHeader({})}${typeof selector === 'string' ? selector : ':root'} {\n${variables}\n}\n`;
};

export { modeVariables };
