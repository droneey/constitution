import type { FormatFn, TransformedToken } from 'style-dictionary/types';
import { fileHeader } from 'style-dictionary/utils';

/** the names Tailwind's utilities read a group by, besides its own */
const tailwindAliases: Readonly<Record<string, (step: string) => string>> = {
  size: (step) => `spacing-${step}`,
  leading: (step) => `text-${step}--line-height`,
  layer: (step) => `z-index-${step}`,
};

/** Tailwind's radius names, each on the radius primitive of its pixels */
const TAILWIND_RADII: Readonly<Record<string, number>> = {
  xs: 4,
  sm: 4,
  md: 8,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
} as const;

const tailwindNamesOf = ({ name, path: [first] }: TransformedToken): string[] => [
  name,
  ...Object.entries(tailwindAliases).flatMap(([group, alias]) =>
    group === first
      ? [
          alias(name.slice(group.length + 1)),
        ]
      : [],
  ),
];

/**
 * Style Dictionary has no format for Tailwind's `@theme`, which reads each custom property by its
 * own name, so a utility follows the mode.
 */
const tailwindTheme: FormatFn = async ({ dictionary }) => {
  const lines = [
    ...dictionary.allTokens.flatMap((token) =>
      tailwindNamesOf(token).map((name) => `  --${name}: var(--${token.name});`),
    ),
    ...Object.entries(TAILWIND_RADII).map(
      ([name, pixels]) => `  --radius-${name}: var(--radius-${pixels});`,
    ),
  ];

  return `${await fileHeader({})}@theme inline reference {\n${lines.join('\n')}\n}\n`;
};

export { tailwindTheme };
