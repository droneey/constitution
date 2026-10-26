import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

// The presets are data: the program that applies them names no tool it configures, no file a tool
// reads and no key of one, so a new tool is a catalogue and never a change of the program.

// Read beside the e2e specs, which mutation testing leaves out: it rewrites the sources it tests.
const packageFolder = join(import.meta.dir, '..', '..');
const featureFolder = join(packageFolder, 'src', 'features', 'presets');

const toolWords: readonly string[] = [
  ...readdirSync(join(packageFolder, 'blocks', 'implementations')),
  '.dependency-cruiser',
  '.editorconfig',
  '.gitignore',
  'biome.json',
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

// What the program's own text cannot help naming: the modules it imports, and the directives the
// mutation testing of this repository reads.
const IMPORT = /^import .* from '[^']+';$/gm;
const MUTATION_DIRECTIVE = /\/\/ Stryker (?:disable|restore) .*$/gm;

// The parser of the wiring check, which the switch to catalogues removes with the check.
const WIRING_PARSER = 'adapters/configuration/configuration-parser.adapter.ts';

const filesOf = (folder: string): readonly string[] =>
  readdirSync(folder, {
    recursive: true,
  })
    .map(String)
    .filter(
      (path) => path.endsWith('.ts') && !path.includes('__tests__') && path !== WIRING_PARSER,
    );

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
