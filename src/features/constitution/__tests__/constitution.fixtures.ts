import { createJsonManifestParser } from '../adapters/json';
import {
  createYamlBindingsParser,
  createYamlFrontMatterParser,
  createYamlVocabularyParser,
} from '../adapters/yaml';
import type {
  BindingsParser,
  FileTree,
  FrontMatterParser,
  ManifestParser,
  VocabularyParser,
} from '../domain/contracts';
import type { ConstitutionLoaded } from '../domain/use-cases/queries/load-constitution';
import { loadConstitution } from '../domain/use-cases/queries/load-constitution';
import type { CheckInput } from '../domain/use-cases/queries/validate-constitution';
import { byIdOf } from '../domain/utils';
import { createFakeFileTree } from './file-tree.fake';

type Files = Record<string, string>;

interface CardFixture {
  abstract?: boolean;
  dictionary?: readonly string[];
  extends?: string | undefined;
  governs?: readonly string[];
  id: string;
  languages?: readonly string[];
  requires?: readonly string[];
  summary?: string;
}

interface BlockFixture extends CardFixture {
  body: string;
}

interface BlockFilesFixture extends CardFixture {
  body?: string;
  dir: string;
  files?: Readonly<Files>;
}

interface RuleFixture {
  // false leaves the level out of a heading that carries out another rule.
  isLevelStated?: boolean;
  level?: string;
  parent?: string;
  slug: string;
  statement?: string;
  tags?: string;
  why?: string;
}

const list = (items: readonly string[] | undefined): string => JSON.stringify(items ?? []);

const mainFile = (block: BlockFixture): string =>
  [
    '---',
    `id: ${block.id}`,
    `summary: ${block.summary ?? `The ${block.id} block.`}`,
    `requires: ${list(block.requires)}`,
    `extends: ${block.extends ?? 'null'}`,
    `abstract: ${String(block.abstract ?? false)}`,
    `languages: ${list(block.languages)}`,
    `dictionary: ${list(block.dictionary)}`,
    `governs: ${list(block.governs)}`,
    '---',
    '',
    block.body,
  ].join('\n');

const blockFiles = (input: BlockFilesFixture): Files => {
  const { dir, files = {}, ...card } = input;

  return {
    [`${dir}/${input.id}.md`]: mainFile({
      ...card,
      body: input.body ?? `# ${input.id}\n`,
    }),
    ...Object.fromEntries(
      Object.entries(files).map(([path, text]) => [
        `${dir}/${path}`,
        text,
      ]),
    ),
  };
};

const headingOf = (input: RuleFixture): string =>
  input.parent === undefined
    ? `### ${input.slug} · ${input.level ?? 'MUST'}`
    : `### ${input.slug} → ${input.parent}${input.isLevelStated === false ? '' : ` · ${input.level ?? 'MUST'}`}`;

const rule = (input: RuleFixture): string =>
  [
    headingOf(input),
    input.statement ?? `The ${input.slug} rule holds.`,
    '',
    '| Why | Tags |',
    '|---|---|',
    `| ${input.why ?? 'it keeps the code honest.'} | ${input.tags ?? '[]'} |`,
    '',
  ].join('\n');

interface Source {
  bindingsParser: BindingsParser;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  tree: FileTree;
  vocabularyParser: VocabularyParser;
}

const sourceOf = (files: Readonly<Files>): Source => ({
  bindingsParser: createYamlBindingsParser(),
  frontMatterParser: createYamlFrontMatterParser(),
  manifestParser: createJsonManifestParser(),
  tree: createFakeFileTree(files),
  vocabularyParser: createYamlVocabularyParser(),
});

const loadedOf = (files: Readonly<Files>): ConstitutionLoaded => loadConstitution(sourceOf(files));

const checkInputOf = (files: Readonly<Files>): CheckInput => {
  const { constitution, findings } = loadedOf(files);

  if (findings.length > 0) {
    throw new Error(
      `The fixture does not load: ${findings.map((finding) => `${finding.path}: ${finding.message}`).join('; ')}`,
    );
  }

  return {
    byId: byIdOf(constitution.blocks),
    constitution,
  };
};

const textOf = (input: { files: Readonly<Files>; path: string }): string => {
  const text: string | undefined = input.files[input.path];

  if (text === undefined) {
    throw new Error(`The fixture has no file ${input.path}`);
  }

  return text;
};

const without = (input: { files: Readonly<Files>; path: string }): Files =>
  Object.fromEntries(Object.entries(input.files).filter(([candidate]) => candidate !== input.path));

export type { BlockFixture, Files, RuleFixture };
export { blockFiles, checkInputOf, loadedOf, mainFile, rule, sourceOf, textOf, without };
