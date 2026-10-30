import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { AXES, Axis } from '#/kernel/constants';
import { AbsolutePath } from '#/kernel/value-objects';

import type { FileTree, FrontMatterParser, ManifestParser } from '../application/contracts';
import type { CheckBlocksInput } from '../application/use-cases/queries/check';
import { createJsonManifestParser } from '../infrastructure/json';
import { createYamlFrontMatterParser } from '../infrastructure/yaml';
import { createFakeFileTree } from './file-tree.fake';

type Files = Record<string, string>;

interface CardFixture {
  abstract?: boolean;
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
  isLevelStated?: boolean;
  level?: string;
  slug: string;
  statement?: string;
  tightens?: string;
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
    `governs: ${list(block.governs)}`,
    '---',
    '',
    block.body,
  ].join('\n');

const inAxis = (path: string): string =>
  AXES.some((axis) => path.startsWith(`${axis}/`)) ? path : `${Axis.Foundation}/${path}`;

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
  input.tightens === undefined
    ? `### ${input.slug} · ${input.level ?? 'MUST'}`
    : `### ${input.slug} → ${input.tightens}${input.isLevelStated === false ? '' : ` · ${input.level ?? 'MUST'}`}`;

const rule = (input: RuleFixture): string =>
  [
    headingOf(input),
    input.statement ?? `The ${input.slug} rule holds.`,
    '',
    '| Why |',
    '|---|',
    `| ${input.why ?? 'it keeps the code honest.'} |`,
    '',
  ].join('\n');

const chapterFile = (title: string, ...rules: readonly string[]): string =>
  `# ${title}\n\n> Governs ${title.toLowerCase()}.\n\n## General\n\n${rules.join('\n')}`;

interface Source {
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  repository: FileTree;
  tree: FileTree;
}

const sourceOf = (files: Readonly<Files>, repositoryFiles: Readonly<Files> = files): Source => ({
  frontMatterParser: createYamlFrontMatterParser(),
  manifestParser: createJsonManifestParser(),
  repository: createFakeFileTree(repositoryFiles),
  tree: createFakeFileTree(files),
});

const FOLDER = '/work/constitution';
const BASE_FOLDER = '.droneey/constitution';
const basePath = `${FOLDER}/${BASE_FOLDER}`;

interface CheckSourceInput {
  readonly base?: Readonly<Files>;
  readonly baseFolder?: string;
  readonly files: Readonly<Files>;
}

const checkSourceOf = (input: CheckSourceInput): CheckBlocksInput => ({
  ...sourceOf(input.files),
  ...(input.base === undefined
    ? {}
    : {
        base: {
          folder: input.baseFolder ?? BASE_FOLDER,
          folderPath: AbsolutePath.join(
            AbsolutePath.create(FOLDER),
            input.baseFolder ?? BASE_FOLDER,
          ),
        },
      }),
  files: createFakeProjectFiles({
    files: Object.fromEntries(
      Object.entries(input.files).map(([path, text]) => [
        `${FOLDER}/${path}`,
        text,
      ]),
    ),
  }),
  folderPath: AbsolutePath.create(FOLDER),
  trees: {
    installed: (folderPath: AbsolutePath): FileTree =>
      createFakeFileTree(folderPath === basePath ? (input.base ?? {}) : {}),
    repository: (): FileTree => createFakeFileTree(input.files),
    tracked: (): FileTree => createFakeFileTree(input.files),
  },
});

interface FixtureFileInput {
  readonly files: Readonly<Files>;
  readonly path: string;
}

const textOf = (input: FixtureFileInput): string => {
  const text: string | undefined = input.files[input.path];

  if (text === undefined) {
    throw new Error(`The fixture has no file ${input.path}`);
  }

  return text;
};

const without = (input: FixtureFileInput): Files =>
  Object.fromEntries(Object.entries(input.files).filter(([candidate]) => candidate !== input.path));

export type { BlockFixture, Files, RuleFixture, Source };
export { blockFiles, chapterFile, checkSourceOf, passportFile, rule, sourceOf, textOf, without };
