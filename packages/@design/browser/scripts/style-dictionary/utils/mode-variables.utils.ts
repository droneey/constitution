import type { Dictionary, FormatFn, TransformedToken } from 'style-dictionary/types';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

import { TYPOGRAPHY_TYPE, TypographyPart } from '../constants';
import { referencedNameOf, referencesOf } from './references.utils';

interface WrittenVariable {
  readonly cssValue: string;
  readonly name: string;
}

/** the parts of a typography token in the order the `font` shorthand takes them, each after its separator; the shorthand has no letter spacing */
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

/** a typography token as the `font` shorthand of its parts and, apart, the letter spacing the shorthand lacks */
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

/** a token of the mode's own file, or one that reads such a token through its references */
const readsModeToken = (token: TransformedToken, dictionary: Dictionary): boolean => {
  const tokenValue: unknown = token.original.$value;

  return (
    token.isSource ||
    referencesOf(tokenValue, dictionary).some((reference) => readsModeToken(reference, dictionary))
  );
};

/**
 * Style Dictionary's `css/variables`, whose own `font` shorthand writes resolved values, which a
 * mode that redefines a weight never reaches; and a variable resolves its references where it is
 * declared, so a mode that writes only its own tokens, `modeTokensOnly`, also writes every token
 * that reads one of them.
 *
 * @throws MalformedTokenError, of the references it reads, when a style of text has a part that
 * refers to no token
 */
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
