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

const declarationOf = (name: string, source: string): string => `  --${name}: var(--${source});`;

const aliasesOf = ({ name, path: [first] }: TransformedToken): string[] =>
  Object.entries(tailwindAliases).flatMap(([group, alias]) =>
    group === first
      ? [
          declarationOf(alias(name.slice(group.length + 1)), name),
        ]
      : [],
  );

/**
 * Style Dictionary has no format for Tailwind's `@theme`, whose `inline` utilities read each
 * custom property of the theme by its own name, so a utility follows the mode. A token's own name
 * is `reference`, never written out: on the root, `--x: var(--x)` would be a cycle that voids the
 * theme's value. An alias is written on the root once a stylesheet reads it, as a library's
 * stylesheet reads Tailwind's names.
 */
const tailwindTheme: FormatFn = async ({ dictionary }) => {
  const own = dictionary.allTokens.map(({ name }) => declarationOf(name, name));
  const aliases = [
    ...dictionary.allTokens.flatMap(aliasesOf),
    ...Object.entries(TAILWIND_RADII).map(([name, pixels]) =>
      declarationOf(`radius-${name}`, `radius-${pixels}`),
    ),
  ];

  return `${await fileHeader({})}@theme inline reference {\n${own.join('\n')}\n}\n\n@theme inline {\n${aliases.join('\n')}\n}\n`;
};

export { tailwindTheme };
