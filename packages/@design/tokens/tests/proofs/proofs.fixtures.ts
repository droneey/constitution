import type { PlainColorObject } from 'colorjs.io/fn';
import { contrastWCAG21, mix, OKLCH, sRGB_Linear, to, toGamut } from 'colorjs.io/fn';
import StyleDictionary from 'style-dictionary';

import type { ThemeModeFiles } from '#/features/themes';
import { readThemeModes } from '#/root';

import resolver from '../../tokens/design.resolver.json' with { type: 'json' };

type DesignTokens = ReadonlyMap<string, unknown>;

const resolverUrl = new URL('../../tokens/design.resolver.json', import.meta.url);

const READ_PLATFORM_NAME = 'tokens';

/** the surface a role laid over at a share of opacity is seen on */
const BASE_SURFACE_PATH = 'color.surface.base';

const LEADING_PREFIX = 'font.leading.';
const SIZE_PREFIX = 'font.size.';
const GRID_GROUP_PREFIXES: readonly string[] = [
  'dimension.',
  'spacing.',
  'size.',
  SIZE_PREFIX,
] as const;

/** the decimals a line height is rounded to, since a leading is a float a hair off its fraction */
const LINE_HEIGHT_PRECISION = 9;
const GRID_PIXELS: readonly number[] = [
  4,
  8,
  12,
  14,
  16,
  20,
  24,
  28,
  32,
  40,
  48,
  56,
  64,
  240,
  272,
  352,
  768,
] as const;

/** the pairs of roles whose contrast every mode must reach: 4.5 for text, 3 for a control and the focus ring, 7 for body text */
const CONTRAST_PAIRS = [
  [
    'text.primary',
    'surface.base',
    7,
  ],
  [
    'text.primary',
    'surface.level-1',
    7,
  ],
  [
    'text.primary',
    'selection.base',
    7,
  ],
  [
    'text.primary',
    'fill.hover',
    7,
  ],
  [
    'text.primary',
    'fill.danger',
    7,
  ],
  [
    'text.primary',
    'fill.success',
    7,
  ],
  [
    'text.muted',
    'surface.base',
    4.5,
  ],
  [
    'text.muted',
    'surface.level-1',
    4.5,
  ],
  [
    'text.muted',
    'surface.level-2',
    4.5,
  ],
  [
    'text.muted',
    'fill.muted',
    4.5,
  ],
  [
    'text.muted',
    'fill.field',
    4.5,
  ],
  [
    'text.muted',
    'fill.field-hover',
    4.5,
  ],
  [
    'text.danger',
    'surface.base',
    4.5,
  ],
  [
    'text.danger',
    'fill.danger',
    4.5,
  ],
  [
    'text.success',
    'surface.base',
    4.5,
  ],
  [
    'text.success',
    'fill.success',
    4.5,
  ],
  [
    'text.warning',
    'surface.base',
    4.5,
  ],
  [
    'text.info',
    'surface.base',
    4.5,
  ],
  [
    'accent.text',
    'surface.base',
    4.5,
  ],
  [
    'accent.text',
    'accent.muted',
    4.5,
  ],
  [
    'accent.text',
    'accent.subtle',
    4.5,
  ],
  [
    'accent.on-solid',
    'accent.solid',
    4.5,
  ],
  [
    'accent.on-solid',
    'accent.hover',
    4.5,
  ],
  [
    'accent.on-solid',
    'accent.pressed',
    4.5,
  ],
  [
    'accent.solid',
    'surface.base',
    3,
  ],
  [
    'accent.solid',
    'surface.level-1',
    3,
  ],
  [
    'border.strong',
    'surface.base',
    1.5,
  ],
  [
    'ring.focus',
    'surface.canvas',
    3,
  ],
  [
    'ring.focus',
    'surface.base',
    3,
  ],
  [
    'ring.focus',
    'surface.level-1',
    3,
  ],
] as const;

const readMode = async ({ ownPaths, sharedPaths }: ThemeModeFiles): Promise<DesignTokens> => {
  const dictionary = new StyleDictionary(
    {
      source: [
        ...sharedPaths,
        ...ownPaths,
      ],
      log: {
        verbosity: 'silent',
      },
      platforms: {
        [READ_PLATFORM_NAME]: {},
      },
    },
    {
      init: false,
    },
  );

  await dictionary.init();

  const { allTokens } = await dictionary.getPlatformTokens(READ_PLATFORM_NAME);

  return new Map(
    allTokens.map((token) => [
      token.path.join('.'),
      token.original.$value,
    ]),
  );
};

const themeModes = readThemeModes({
  resolver,
  resolverUrl,
});

const tokensByModeName: ReadonlyMap<string, DesignTokens> = new Map(
  await Promise.all(
    themeModes.map(
      async (mode) =>
        [
          mode.name,
          await readMode(mode),
        ] as const,
    ),
  ),
);

const tokensOf = (modeName: string | undefined): DesignTokens => {
  const tokens = modeName === undefined ? undefined : tokensByModeName.get(modeName);

  if (tokens === undefined) {
    throw new Error(`the resolver names no mode ${modeName}`);
  }

  return tokens;
};

const defaultTokens = tokensOf(themeModes.find(({ isDefault }) => isDefault)?.name);

const isRecord = (raw: unknown): raw is Readonly<Record<string, unknown>> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw);

const isComponents = (
  raw: unknown,
): raw is readonly [
  number,
  number,
  number,
] =>
  Array.isArray(raw) && raw.length === 3 && raw.every((component) => typeof component === 'number');

/** a role's colour in linear sRGB, laid over the base surface at its opacity */
const colourOf = (tokens: DesignTokens, tokenPath: string): PlainColorObject => {
  const reference = tokens.get(tokenPath);
  const colour = typeof reference === 'string' ? tokens.get(reference.slice(1, -1)) : reference;
  const components = isRecord(colour) ? colour['components'] : undefined;

  if (!(isRecord(colour) && isComponents(components))) {
    throw new Error(`the tokens hold no colour for ${tokenPath}`);
  }

  const alpha = typeof colour['alpha'] === 'number' ? colour['alpha'] : 1;
  const opaqueColour = toGamut(
    to(
      {
        space: OKLCH,
        coords: [
          ...components,
        ],
        alpha: 1,
      },
      sRGB_Linear,
    ),
    {
      method: 'clip',
    },
  );

  return alpha === 1
    ? opaqueColour
    : mix(colourOf(tokens, BASE_SURFACE_PATH), opaqueColour, alpha, {
        space: sRGB_Linear,
      });
};

interface ContrastPair {
  readonly background: string;
  readonly foreground: string;
  readonly modeName: string;
}

const contrastOf = (pair: ContrastPair): number =>
  contrastWCAG21(
    colourOf(tokensOf(pair.modeName), `color.${pair.foreground}`),
    colourOf(tokensOf(pair.modeName), `color.${pair.background}`),
  );

const pixelsOf = (tokenPath: string): number => {
  const measure = defaultTokens.get(tokenPath);

  if (typeof measure === 'string') {
    return pixelsOf(measure.slice(1, -1));
  }

  if (!(isRecord(measure) && typeof measure['value'] === 'number')) {
    throw new Error(`the tokens hold no measure in pixels for ${tokenPath}`);
  }

  return measure['value'];
};

const lineHeightPixelsOf = (leadingPath: string): number => {
  const leading = defaultTokens.get(leadingPath);

  if (typeof leading !== 'number') {
    throw new Error(`the tokens hold no leading for ${leadingPath}`);
  }

  // a leading's step names the size it serves before any suffix: `sm-relaxed` is a line for `sm`
  const [sizeStep] = leadingPath.slice(LEADING_PREFIX.length).split('-');
  const pixels = leading * pixelsOf(`${SIZE_PREFIX}${sizeStep}`);

  return Number(pixels.toFixed(LINE_HEIGHT_PRECISION));
};

/** whether the line a leading gives the size it serves measures a whole, even number of pixels */
const isLineOfEvenPixels = (leadingPath: string): boolean =>
  lineHeightPixelsOf(leadingPath) % 2 === 0;

const contrastCases = themeModes.flatMap(({ name: modeName }) =>
  CONTRAST_PAIRS.map(([foreground, background, minimum]) => ({
    background,
    foreground,
    minimum,
    modeName,
  })),
);

const sizeTokenPaths: readonly string[] = [
  ...defaultTokens.keys(),
].filter((tokenPath) =>
  GRID_GROUP_PREFIXES.some((groupPrefix) => tokenPath.startsWith(groupPrefix)),
);

const leadingTokenPaths: readonly string[] = [
  ...defaultTokens.keys(),
].filter((tokenPath) => tokenPath.startsWith(LEADING_PREFIX));

export {
  contrastCases,
  contrastOf,
  GRID_PIXELS,
  isLineOfEvenPixels,
  leadingTokenPaths,
  pixelsOf,
  sizeTokenPaths,
};
