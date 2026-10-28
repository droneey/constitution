import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

// Why: the presets are data: the program that applies them names no tool it configures, no file a
// tool reads and no key of one, so a new tool is a preset file and never a change of the program.

// Why: read beside the e2e specs, which mutation testing leaves out: it rewrites the sources it
// tests.
const packageFolder = join(import.meta.dir, '..', '..');
const featureFolder = join(packageFolder, 'src', 'features', 'presets');

const toolWords: readonly string[] = [
  ...readdirSync(join(packageFolder, 'blocks', 'implementations')),
  '.dependency-cruiser',
  '.editorconfig',
  '.gitignore',
  'biome.jsonc',
  'bunfig',
  'forbidden',
  'jobs',
  'knip.json',
  'lefthook.yaml',
  'mise.toml',
  'package.json',
  'preload',
  'pyproject',
  'scripts',
  'stryker.config',
  'tsconfig',
];

const IMPORT = /^import .* from '[^']+';$/gm;
const MUTATION_DIRECTIVE = /\/\/ Stryker (?:disable|restore) .*$/gm;

const filesOf = (folder: string): readonly string[] =>
  readdirSync(folder, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith('.ts') && !path.includes('__tests__'));

const wordsIn = (path: string): readonly string[] => {
  const text = readFileSync(join(featureFolder, path), 'utf8')
    .replace(IMPORT, '')
    .replace(MUTATION_DIRECTIVE, '');

  return toolWords.filter((word) =>
    new RegExp(`(?<![\\w-])${RegExp.escape(word)}(?![\\w-])`, 'i').test(text),
  );
};

describe('the presets feature', () => {
  it.each(filesOf(featureFolder))('should name no tool in %s', (path) => {
    // Act
    const named = wordsIn(path);

    // Assert
    expect(named).toStrictEqual([]);
  });
});
