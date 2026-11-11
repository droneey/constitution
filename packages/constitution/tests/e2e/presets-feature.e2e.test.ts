import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { describe, expect, it } from 'bun:test';

// Why: the presets are data: the program that applies them names no tool it configures, no file a
// tool reads and no key of one, so a new tool is a preset file and never a change of the program.

// Why: read beside the e2e specs, which mutation testing leaves out: it rewrites the sources it
// tests.
const packageFolder = join(import.meta.dir, '..', '..');
const featureFolder = join(packageFolder, 'src', 'features', 'presets');
const AXIS_MARK = '@';

const implementationsFolder = join(packageFolder, 'blocks', 'implementations');
const PASSPORT_EXTENSION = '.md';
const ID_SEPARATOR = '/';

const implementationIds: readonly string[] = readdirSync(implementationsFolder, {
  recursive: true,
})
  .map(String)
  .filter(
    (path) =>
      `${basename(dirname(path))}${PASSPORT_EXTENSION}` === basename(path) &&
      !path.includes(AXIS_MARK),
  )
  .map(dirname);

// Why: a block that holds others, as js-runtime or schema does, names a kind of tool and no tool.
const toolWords: readonly string[] = [
  ...implementationIds
    .filter((id) => !implementationIds.some((other) => other.startsWith(`${id}${ID_SEPARATOR}`)))
    .map((id) => id.split(ID_SEPARATOR).at(-1) ?? id),
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
    new RegExp(String.raw`(?<![\w-])${RegExp.escape(word)}(?![\w-])`, 'i').test(text),
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
