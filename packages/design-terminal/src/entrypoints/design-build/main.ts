import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import StyleDictionary from 'style-dictionary';

import type { DesignTokens, ModeTokens } from '#/libs/ui';
import { emitTerminalModule, readTokens, ThemeMode } from '#/libs/ui';

const BASE_SETS = [
  'color.tokens.json',
  'size.tokens.json',
  'motion.tokens.json',
];
const OUTPUT = 'src/libs/ui/theme/constants/tokens.gen.ts';
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

const built = [
  BANNER,
  ...emitTerminalModule(modes),
].join('\n');

if (!process.argv.includes('check')) {
  writeFileSync(OUTPUT, built);
} else if (readFileSync(OUTPUT, 'utf8') !== built) {
  process.stderr.write(`stale, run bun run design:build: ${OUTPUT}\n`);
  process.exitCode = STALE_EXIT_CODE;
}
