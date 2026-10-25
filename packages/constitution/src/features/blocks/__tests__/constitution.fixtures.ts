import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { AXES, Axis } from '#/kernel/constants';

import { createJsonManifestParser } from '../adapters/json';
import { createYamlBindingsParser, createYamlFrontMatterParser } from '../adapters/yaml';
import type {
  BindingsParser,
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '../domain/contracts';
import { BlockGraph } from '../domain/entities';
import type { CheckBlocksInput, CheckInput } from '../domain/use-cases/queries/check';
import type {
  Base,
  ConstitutionLoaded,
} from '../domain/use-cases/queries/check/steps/load-constitution';
import { loadConstitution } from '../domain/use-cases/queries/check/steps/load-constitution';
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
  // false leaves the level out of a heading that carries out another rule.
  isLevelStated?: boolean;
  level?: string;
  slug: string;
  statement?: string;
  tags?: string;
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

/** a path with no axis folder is foundation's */
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
    '| Why | Tags |',
    '|---|---|',
    `| ${input.why ?? 'it keeps the code honest.'} | ${input.tags ?? '[]'} |`,
    '',
  ].join('\n');

const chapterFile = (title: string, ...rules: readonly string[]): string =>
  `# ${title}\n\n> Governs ${title.toLowerCase()}.\n\n## General\n\n${rules.join('\n')}`;

interface Source {
  bindingsParser: BindingsParser;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  repository: FileTree;
  tree: FileTree;
}

const sourceOf = (files: Readonly<Files>, repositoryFiles: Readonly<Files> = files): Source => ({
  bindingsParser: createYamlBindingsParser(),
  frontMatterParser: createYamlFrontMatterParser(),
  manifestParser: createJsonManifestParser(),
  repository: createFakeFileTree(repositoryFiles),
  tree: createFakeFileTree(files),
});

interface PackSourceInput {
  readonly base: Readonly<Files>;
  readonly folder?: string;
  readonly pack: Readonly<Files>;
}

// A pack beside the base it extends, installed where a project keeps it unless the case says otherwise.
const packSourceOf = (
  input: PackSourceInput,
): Source & {
  base: Base;
} => ({
  ...sourceOf(input.pack),
  base: {
    folder: input.folder ?? '.droneey/constitution',
    tree: createFakeFileTree(input.base),
  },
});

// The blocks of a folder as their check reads them: the files git holds there, those of its
// repository, and those of the installed Constitution a pack extends.
const FOLDER = '/work/constitution';
const BASE = '/work/base';

interface CheckSourceInput {
  readonly base?: Readonly<Files>;
  readonly files: Readonly<Files>;
}

const checkSourceOf = (input: CheckSourceInput): CheckBlocksInput => ({
  ...sourceOf(input.files),
  ...(input.base === undefined
    ? {}
    : {
        base: BASE,
      }),
  files: createFakeProjectFiles({
    files: Object.fromEntries(
      Object.entries(input.files).map(([path, text]) => [
        `${FOLDER}/${path}`,
        text,
      ]),
    ),
  }),
  folder: FOLDER,
  trees: {
    installed: (): FileTree => createFakeFileTree(input.base ?? {}),
    repository: (): FileTree => createFakeFileTree(input.files),
    tracked: (): FileTree => createFakeFileTree(input.files),
  },
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
      `The fixture does not load: ${findings.map((finding) => `${finding.path}: ${finding.code} ${JSON.stringify(finding.details)}`).join('; ')}`,
    );
  }

  return {
    graph: BlockGraph.create(constitution.blocks),
    constitution,
  };
};

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

export type { BlockFixture, Files, RuleFixture };
export {
  blockFiles,
  chapterFile,
  checkInputOf,
  checkSourceOf,
  loadedOf,
  packSourceOf,
  passportFile,
  rule,
  textOf,
  without,
};
