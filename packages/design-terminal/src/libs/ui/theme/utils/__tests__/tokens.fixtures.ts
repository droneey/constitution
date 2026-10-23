import { ThemeMode } from '../../constants';
import type { DesignToken, DesignTokenGroup, DesignTokens, ModeTokens } from '../../types';

const colourOf = (lightness: number, alpha?: number): DesignToken => ({
  $value: {
    colorSpace: 'oklch',
    components: [
      lightness,
      0,
      0,
    ],
    ...(alpha === undefined
      ? {}
      : {
          alpha,
        }),
    hex: lightness === 1 ? '#ffffff' : '#000000',
  },
});

/** a token of every group the theme writes, the same in every mode; white and black its colours */
const createBaseGroup = (overrides: DesignTokenGroup = {}): DesignTokenGroup => ({
  $description: 'A small source.',
  dimension: {
    $type: 'dimension',
    '8': {
      $value: {
        unit: 'px',
        value: 8,
      },
    },
    '16': {
      $value: {
        unit: 'px',
        value: 16,
      },
    },
  },
  spacing: {
    sm: {
      $value: '{dimension.8}',
    },
  },
  size: {
    control: {
      md: {
        $value: '{dimension.16}',
      },
    },
  },
  text: {
    sm: {
      $value: '{dimension.16}',
    },
  },
  leading: {
    sm: {
      $value: '{dimension.8}',
    },
  },
  radius: {
    '4': {
      $value: {
        unit: 'px',
        value: 4,
      },
    },
  },
  duration: {
    fast: {
      $value: {
        unit: 'ms',
        value: 100,
      },
    },
  },
  ease: {
    out: {
      $value: [
        0.23,
        1,
        0.32,
        1,
      ],
    },
  },
  color: {
    $type: 'color',
    neutral: {
      '0': colourOf(1),
      '1000': colourOf(0),
    },
    overlay: {
      'neutral-1000-50': colourOf(0, 0.5),
    },
  },
  ...overrides,
});

/** the roles of a mode over the base: light reads black on white, dark white on black */
const createModeGroup = (mode: ThemeMode, overrides: DesignTokenGroup = {}): DesignTokenGroup => {
  const isLight = mode === ThemeMode.Light;
  const base = createBaseGroup();

  return {
    ...base,
    color: {
      ...(typeof base['color'] === 'object' ? base['color'] : {}),
      surface: {
        base: {
          $value: isLight ? '{color.neutral.0}' : '{color.neutral.1000}',
        },
      },
      text: {
        primary: {
          $value: isLight ? '{color.neutral.1000}' : '{color.neutral.0}',
        },
      },
      fill: {
        hover: {
          $value: '{color.overlay.neutral-1000-50}',
        },
      },
    },
    font: {
      weight: {
        normal: {
          $value: isLight ? 400 : 370,
        },
      },
    },
    stroke: {
      icon: {
        $value: isLight ? 2 : 1.5,
      },
    },
    ...overrides,
  };
};

const isToken = (member: DesignToken | DesignTokenGroup): member is DesignToken =>
  '$value' in member;

const entriesOf = (
  group: DesignTokenGroup,
  path: readonly string[],
): [
  string,
  DesignToken,
][] =>
  Object.entries(group).flatMap(([name, member]) => {
    if (name.startsWith('$') || typeof member === 'string') {
      return [];
    }

    const memberPath = [
      ...path,
      name,
    ];

    return isToken(member)
      ? [
          [
            memberPath.join('.'),
            member,
          ],
        ]
      : entriesOf(member, memberPath);
  });

const collectTokens = (group: DesignTokenGroup): DesignTokens => new Map(entriesOf(group, []));

/** the tokens of both modes, a mode's groups replaced where a spec gives its own */
const createModeTokens = (
  overrides: Partial<Record<ThemeMode, DesignTokenGroup>> = {},
): ModeTokens => ({
  [ThemeMode.Light]: collectTokens(createModeGroup(ThemeMode.Light, overrides[ThemeMode.Light])),
  [ThemeMode.Dark]: collectTokens(createModeGroup(ThemeMode.Dark, overrides[ThemeMode.Dark])),
});

export { createModeTokens };
