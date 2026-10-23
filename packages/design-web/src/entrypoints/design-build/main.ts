import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import StyleDictionary from 'style-dictionary';

import type { DesignTokens, ModeTokens } from '#/libs/ui';
import { emitTailwindTheme, emitThemeCss, readTokens, TAILWIND_RADIUS, ThemeMode } from '#/libs/ui';

const BASE_SETS = [
  'color.tokens.json',
  'size.tokens.json',
  'motion.tokens.json',
  'shadow.tokens.json',
  'layer.tokens.json',
];
const BANNER = '/* Generated from @droneey/design-tokens: bun run design:build; do not edit. */';
const STALE_EXIT_CODE = 1;

const readMode = (mode: ThemeMode): Promise<DesignTokens> =>
  readTokens(
    {
      source: [
        ...BASE_SETS,
        `theme/${mode}.tokens.json`,
      ].map((set) => fileURLToPath(import.meta.resolve(`@droneey/design-tokens/tokens/${set}`))),
    },
    StyleDictionary,
  );

const modes: ModeTokens = {
  [ThemeMode.Light]: await readMode(ThemeMode.Light),
  [ThemeMode.Dark]: await readMode(ThemeMode.Dark),
};

const outputs: Readonly<Record<string, readonly string[]>> = {
  'src/libs/ui/theme/theme.gen.css': emitThemeCss(modes),
  'src/libs/ui/theme/tailwind.gen.css': emitTailwindTheme(modes, TAILWIND_RADIUS),
};

const stale = Object.entries(outputs).flatMap(([path, lines]) => {
  const built = [
    BANNER,
    ...lines,
  ].join('\n');

  if (process.argv.includes('check')) {
    return readFileSync(path, 'utf8') === built
      ? []
      : [
          path,
        ];
  }

  writeFileSync(path, built);

  return [];
});

if (stale.length > 0) {
  process.stderr.write(`stale, run bun run design:build: ${stale.join(', ')}\n`);
  process.exitCode = STALE_EXIT_CODE;
}
