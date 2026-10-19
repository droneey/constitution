import { expect } from 'bun:test';

import type { Finding } from '#/kernel/types';

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

interface FindingFixture {
  code: string;
  // The parts of the message the case proves, such as the id or the slug it names.
  names?: readonly string[] | undefined;
  path: string;
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

const passportFile = (block: BlockFixture): string =>
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

const AXIS_FOLDERS: readonly string[] = [
  'foundation',
  'architecture',
  'workflow',
];

/** a file's path in its block: a path with no axis folder is foundation's */
const inAxis = (path: string): string =>
  AXIS_FOLDERS.some((axis) => path.startsWith(`${axis}/`)) ? path : `foundation/${path}`;

/**
 * A block as its files: the passport holds the front matter and the body — its title, its setup and
 * an implementation's Requirements — and each of the files, a chapter or a seam, sits in its axis.
 */
const blockFiles = (input: BlockFilesFixture): Files => {
  const { dir, files = {}, ...card } = input;

  return {
    [`${dir}/${input.id}.md`]: passportFile({
      ...card,
      body: input.body ?? `# ${input.id}\n`,
    }),
    ...Object.fromEntries(
      Object.entries(files).map(([path, text]) => [
        `${dir}/${inAxis(path)}`,
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

/** a chapter or a seam in its form: its title, its Governs line and its rules under General */
const chapterFile = (title: string, ...rules: readonly string[]): string =>
  `# ${title}\n\n> Governs ${title.toLowerCase()}.\n\n## General\n\n${rules.join('\n')}`;

interface Source {
  bindingsParser: BindingsParser;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  repository: FileTree;
  tree: FileTree;
  vocabularyParser: VocabularyParser;
}

// A Constitution that is its repository, unless the repository's own files are given.
const sourceOf = (files: Readonly<Files>, repositoryFiles: Readonly<Files> = files): Source => ({
  bindingsParser: createYamlBindingsParser(),
  frontMatterParser: createYamlFrontMatterParser(),
  manifestParser: createJsonManifestParser(),
  repository: createFakeFileTree(repositoryFiles),
  tree: createFakeFileTree(files),
  vocabularyParser: createYamlVocabularyParser(),
});

// A pack checked against its base: the pack is its repository, the base a tree of its own.
const packSourceOf = (input: {
  base: Readonly<Files>;
  pack: Readonly<Files>;
}): Source & {
  base: FileTree;
} => ({
  ...sourceOf(input.pack),
  base: createFakeFileTree(input.base),
});

const loadedOf = (
  files: Readonly<Files>,
  repositoryFiles: Readonly<Files> = files,
): ConstitutionLoaded => loadConstitution(sourceOf(files, repositoryFiles));

const checkInputOf = (
  files: Readonly<Files>,
  repositoryFiles: Readonly<Files> = files,
): CheckInput => {
  const { constitution, findings } = loadedOf(files, repositoryFiles);

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

/**
 * A finding as a case expects it, whatever its wording: its code, its path and a message that is
 * never empty and names each of `names`.
 */
const findingOf = (input: FindingFixture): Finding => ({
  code: input.code,
  message: expect.stringMatching(
    new RegExp(
      `^${(input.names ?? []).map((name) => `(?=[\\s\\S]*${RegExp.escape(name)})`).join('')}[\\s\\S]`,
    ),
  ),
  path: input.path,
});

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
export {
  blockFiles,
  chapterFile,
  checkInputOf,
  findingOf,
  loadedOf,
  packSourceOf,
  passportFile,
  rule,
  sourceOf,
  textOf,
  without,
};
