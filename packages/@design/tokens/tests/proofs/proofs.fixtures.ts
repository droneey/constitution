import type { PlainColorObject } from 'colorjs.io/fn';
import { contrastWCAG21, mix, OKLCH, sRGB_Linear, to, toGamut } from 'colorjs.io/fn';
import StyleDictionary from 'style-dictionary';

import type { ThemeModeFiles } from '#/libs/resolver';
import { themeModesOf } from '#/libs/resolver';

import resolver from '../../tokens/design.resolver.json' with { type: 'json' };

type DesignTokens = ReadonlyMap<string, unknown>;

const resolverUrl = new URL('../../tokens/design.resolver.json', import.meta.url).href;

const READ_PLATFORM = 'tokens';

/** the surface a role laid over at a share of opacity is seen on */
const BASE_SURFACE = 'color.surface.base';

const GRID_GROUPS: readonly string[] = [
  'dimension.',
  'spacing.',
  'size.',
  'text.',
  'leading.',
] as const;
const GRID: readonly number[] = [
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
const PAIRS = [
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

const readMode = async ({ own, shared }: ThemeModeFiles): Promise<DesignTokens> => {
  const dictionary = new StyleDictionary(
    {
      source: [
        ...shared,
        ...own,
      ],
      log: {
        verbosity: 'silent',
      },
      platforms: {
        [READ_PLATFORM]: {},
      },
    },
    {
      init: false,
    },
  );

  await dictionary.init();

  const { allTokens } = await dictionary.getPlatformTokens(READ_PLATFORM);

  return new Map(
    allTokens.map((token) => [
      token.path.join('.'),
      token.original.$value,
    ]),
  );
};

const themeModes = themeModesOf(resolver, resolverUrl);

const modes: ReadonlyMap<string, DesignTokens> = new Map(
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

const tokensOf = (mode: string | undefined): DesignTokens => {
  const tokens = mode === undefined ? undefined : modes.get(mode);

  if (tokens === undefined) {
    throw new Error(`the resolver names no mode ${mode}`);
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
const colourOf = (tokens: DesignTokens, path: string): PlainColorObject => {
  const reference = tokens.get(path);
  const colour = typeof reference === 'string' ? tokens.get(reference.slice(1, -1)) : reference;
  const components = isRecord(colour) ? colour['components'] : undefined;

  if (!(isRecord(colour) && isComponents(components))) {
    throw new Error(`the tokens hold no colour for ${path}`);
  }

  const alpha = typeof colour['alpha'] === 'number' ? colour['alpha'] : 1;
  const own = toGamut(
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
    ? own
    : mix(colourOf(tokens, BASE_SURFACE), own, alpha, {
        space: sRGB_Linear,
      });
};

interface ContrastPair {
  readonly background: string;
  readonly foreground: string;
  readonly mode: string;
}

const contrastOf = (pair: ContrastPair): number =>
  contrastWCAG21(
    colourOf(tokensOf(pair.mode), `color.${pair.foreground}`),
    colourOf(tokensOf(pair.mode), `color.${pair.background}`),
  );

const pixelsOf = (path: string): number => {
  const measure = defaultTokens.get(path);

  if (typeof measure === 'string') {
    return pixelsOf(measure.slice(1, -1));
  }

  return isRecord(measure) && typeof measure['value'] === 'number' ? measure['value'] : Number.NaN;
};

const contrastCases = themeModes.flatMap(({ name: mode }) =>
  PAIRS.map(([foreground, background, minimum]) => ({
    background,
    foreground,
    minimum,
    mode,
  })),
);

const sizePaths: readonly string[] = [
  ...defaultTokens.keys(),
].filter((path) => GRID_GROUPS.some((group) => path.startsWith(group)));

export { contrastCases, contrastOf, GRID, pixelsOf, sizePaths };
