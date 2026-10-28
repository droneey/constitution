import type { Dictionary, FormatFn, TransformedToken } from 'style-dictionary/types';
import { fileHeader } from 'style-dictionary/utils';

import { TYPOGRAPHY_TYPE, TypographyPart } from '../constants';
import { MalformedTokenError } from '../errors';
import { referencedNameOf } from './references.utils';

type AliasOf = (step: string) => string;

interface ThemeDeclarations {
  readonly aliases: readonly string[];
  readonly own: readonly string[];
}

/** the group of the tokens of text, whose names Tailwind reads as families */
const FONT_GROUP_NAME = 'font';
/** the one scale of text Tailwind reads by its own name, `--font-weight-*` */
const FONT_WEIGHT_SCALE_NAME = 'weight';

/** the names Tailwind's utilities read a group by, besides its own */
const tailwindAliases = {
  size: (step): string => `spacing-${step}`,
  layer: (step): string => `z-index-${step}`,
} satisfies Readonly<Record<string, AliasOf>>;

const LINE_HEIGHT_SUFFIX = '--line-height';

/** the name of Tailwind's text utility, its size and the composite of a style of text */
const textAliasOf: AliasOf = (step) => `text-${step}`;

const familyAliasOf: AliasOf = (familyName) => `font-${familyName}`;

/** the names Tailwind's utilities read each scale of text by, in place of its own */
const tailwindFontAliases = {
  size: [
    textAliasOf,
  ],
  leading: [
    (step): string => `leading-${step}`,
    (step): string => `${textAliasOf(step)}${LINE_HEIGHT_SUFFIX}`,
  ],
  family: [
    familyAliasOf,
  ],
  tracking: [
    (step): string => `tracking-${step}`,
  ],
} satisfies Readonly<Record<string, readonly AliasOf[]>>;

/** Tailwind's text composite, the suffix of each of its properties with the part of a typography token it reads; the family stays its own utility */
const TEXT_COMPOSITE_PARTS = [
  [
    '',
    TypographyPart.FontSize,
  ],
  [
    LINE_HEIGHT_SUFFIX,
    TypographyPart.LineHeight,
  ],
  [
    '--letter-spacing',
    TypographyPart.LetterSpacing,
  ],
  [
    '--font-weight',
    TypographyPart.FontWeight,
  ],
] as const;

/** Tailwind's radius names, each on the radius primitive of its pixels, which the tokens must hold */
const TAILWIND_RADIUS_PIXELS = {
  xs: 4,
  sm: 4,
  md: 8,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
} as const satisfies Readonly<Record<string, number>>;

/** how deep below its group, and below its scale of text, a token's path names its step */
const GROUP_STEP_DEPTH = 1;
const SCALE_STEP_DEPTH = 2;

interface Declaration {
  readonly propertyName: string;
  readonly sourceName: string;
}

const declarationOf = ({ propertyName, sourceName }: Declaration): string =>
  `  --${propertyName}: var(--${sourceName});`;

const stepOf = ({ path }: TransformedToken, depth: number): string => path.slice(depth).join('-');

const aliasesOf = (token: TransformedToken): string[] =>
  Object.entries(tailwindAliases).flatMap(([groupName, aliasOf]) =>
    groupName === token.path[0]
      ? [
          declarationOf({
            propertyName: aliasOf(stepOf(token, GROUP_STEP_DEPTH)),
            sourceName: token.name,
          }),
        ]
      : [],
  );

const fontDeclarationsOf = (
  token: TransformedToken,
  dictionary: Dictionary,
  scaleName: string | undefined,
): string[] => {
  const { $type, name } = token;

  if ($type === TYPOGRAPHY_TYPE) {
    const textName = textAliasOf(stepOf(token, GROUP_STEP_DEPTH));

    return TEXT_COMPOSITE_PARTS.map(([suffix, partName]) =>
      declarationOf({
        propertyName: `${textName}${suffix}`,
        sourceName: referencedNameOf(token, partName, dictionary),
      }),
    );
  }

  const step = stepOf(token, SCALE_STEP_DEPTH);

  return Object.entries(tailwindFontAliases)
    .filter(([aliasedScaleName]) => aliasedScaleName === scaleName)
    .flatMap(([, scaleAliases]) =>
      scaleAliases.map((aliasOf) =>
        declarationOf({
          propertyName: aliasOf(step),
          sourceName: name,
        }),
      ),
    );
};

const declarationsOf = (token: TransformedToken, dictionary: Dictionary): ThemeDeclarations => {
  const {
    name,
    path: [groupName, scaleName],
  } = token;

  return groupName === FONT_GROUP_NAME && scaleName !== FONT_WEIGHT_SCALE_NAME
    ? {
        own: [],
        aliases: fontDeclarationsOf(token, dictionary, scaleName),
      }
    : {
        own: [
          declarationOf({
            propertyName: name,
            sourceName: name,
          }),
        ],
        aliases: aliasesOf(token),
      };
};

/**
 * The alias of each kind of text's family, `--font-code`, which Tailwind's text composite lacks.
 *
 * @throws {@link MalformedTokenError} when a style of text has no kind, or names another family than the rest of its kind
 */
const kindFamilyDeclarationsOf = (dictionary: Dictionary): string[] => {
  const familyNameByKind = new Map<string, string>();

  for (const token of dictionary.allTokens) {
    if (token.$type !== TYPOGRAPHY_TYPE) {
      continue;
    }

    const [, kindName] = token.path;

    if (kindName === undefined) {
      throw new MalformedTokenError(token.name);
    }

    const familyName = referencedNameOf(token, TypographyPart.FontFamily, dictionary);
    const kindFamilyName = familyNameByKind.get(kindName);

    if (kindFamilyName !== undefined && kindFamilyName !== familyName) {
      throw new MalformedTokenError(token.name);
    }

    familyNameByKind.set(kindName, familyName);
  }

  return [
    ...familyNameByKind,
  ].map(([kindName, familyName]) =>
    declarationOf({
      propertyName: familyAliasOf(kindName),
      sourceName: familyName,
    }),
  );
};

/**
 * Tailwind's radius names, each on its primitive.
 *
 * @throws {@link MalformedTokenError} when the tokens hold no primitive of a radius's pixels
 */
const radiusDeclarationsOf = ({ unfilteredTokenMap }: Dictionary): string[] =>
  Object.entries(TAILWIND_RADIUS_PIXELS).map(([radiusName, pixels]) => {
    const primitiveName = `radius-${pixels}`;

    // Stryker disable next-line OptionalChaining: Style Dictionary hands every format the unfiltered tokens, so the map is never missing
    if (unfilteredTokenMap?.has(`{radius.${pixels}}`) !== true) {
      throw new MalformedTokenError(primitiveName);
    }

    return declarationOf({
      propertyName: `radius-${radiusName}`,
      sourceName: primitiveName,
    });
  });

/**
 * Style Dictionary has no format for Tailwind's `@theme`. A token whose name is Tailwind's is
 * `reference`, never written out: on the root, `--x: var(--x)` would be a cycle that voids the
 * theme's value.
 *
 * @throws {@link MalformedTokenError} when a style of text has a part that refers to no token, has
 * no kind or names another family than the rest of its kind, or the tokens hold no primitive of a
 * radius's pixels
 */
const tailwindTheme: FormatFn = async ({ dictionary }) => {
  const declarations = dictionary.allTokens.map((token) => declarationsOf(token, dictionary));
  const ownDeclarations = declarations.flatMap((declaration) => declaration.own);
  const aliasDeclarations = [
    ...declarations.flatMap((declaration) => declaration.aliases),
    ...kindFamilyDeclarationsOf(dictionary),
    ...radiusDeclarationsOf(dictionary),
  ];

  return `${await fileHeader({})}@theme inline reference {\n${ownDeclarations.join('\n')}\n}\n\n@theme inline {\n${aliasDeclarations.join('\n')}\n}\n`;
};

export { tailwindTheme };
