import { createConfigFileParser } from '../adapters/config-file';
import { createYamlFrontMatterParser } from '../adapters/yaml';
import type { ConfigParser, FrontMatterParser } from '../domain/contracts';
import type { FakeTree } from './project-files.fake';

// A project and the release it links, as the hooks and the commands find them: the project's
// folder, its constitution.yaml, and the archive under .droneey/constitution with its blocks.

const PROJECT = '/work/project';
const ARCHIVE = `${PROJECT}/.droneey/constitution`;
const CONFIG = `${PROJECT}/constitution.yaml`;
const MANIFEST = `${ARCHIVE}/package.json`;
const CORE = `${ARCHIVE}/blocks/core/core.md`;
const VERSION = '1.0.0';
const FORMAT = 3;

enum Folder {
  Domain = 'domains',
  Platform = 'contexts/platforms',
  Language = 'contexts/languages',
  Implementation = 'implementations',
}

interface BlockFixture {
  readonly abstract?: boolean;
  readonly body?: string;
  readonly extends?: string;
  // more files of the block, by their path in its folder: foundation/screens.md
  readonly files?: Readonly<Record<string, string>>;
  readonly folder?: Folder;
  readonly governs?: readonly string[];
  readonly id: string;
  readonly requires?: readonly string[];
  readonly summary?: string;
}

const listOf = (entries: readonly string[] | undefined): string =>
  `[${(entries ?? []).map((entry) => JSON.stringify(entry)).join(', ')}]`;

const passportOf = (block: BlockFixture): string =>
  [
    '---',
    `id: ${block.id}`,
    `summary: ${JSON.stringify(block.summary ?? `The ${block.id} block.`)}`,
    `requires: ${listOf(block.requires)}`,
    `extends: ${block.extends ?? 'null'}`,
    `abstract: ${String(block.abstract ?? false)}`,
    'languages: []',
    'dictionary: []',
    `governs: ${listOf(block.governs)}`,
    '---',
    '',
    `# ${block.id}`,
    '',
    block.body ?? '',
  ].join('\n');

const blockFolderOf = (input: { block: BlockFixture; root: string }): string =>
  `${input.root}/blocks/${input.block.folder ?? Folder.Domain}/${input.block.id}`;

// The files of blocks below a source's folder, the archive's by default.
const blockFilesOf = (input: {
  blocks: readonly BlockFixture[];
  root?: string;
}): Readonly<Record<string, string>> =>
  Object.fromEntries(
    input.blocks.flatMap((block) => {
      const folder = blockFolderOf({
        block,
        root: input.root ?? ARCHIVE,
      });

      return [
        [
          `${folder}/${block.id}.md`,
          passportOf(block),
        ],
        ...Object.entries(block.files ?? {}).map(([path, text]) => [
          `${folder}/${path}`,
          text,
        ]),
      ];
    }),
  );

const ruleOf = (input: { level?: string; parent?: string; slug: string }): string => {
  const arrow = input.parent === undefined ? '' : ` → ${input.parent}`;
  const level = input.level === undefined ? '' : ` · ${input.level}`;

  return [
    `### ${input.slug}${arrow}${level}`,
    '',
    'A rule.',
    '',
    '| Why | Tags |',
    '|---|---|',
    '| a reason. | [] |',
    '',
  ].join('\n');
};

const manifestOf = (input: { format?: number | string; version?: string } = {}): string =>
  `${JSON.stringify(
    {
      name: '@droneey/constitution',
      version: input.version ?? VERSION,
      constitutionFormat: input.format ?? FORMAT,
    },
    undefined,
    2,
  )}\n`;

// A project whose release holds core and the blocks given, and whose constitution.yaml is config.
const projectTreeOf = (input: {
  blocks?: readonly BlockFixture[];
  config: string;
  files?: Readonly<Record<string, string>>;
}): FakeTree => ({
  files: {
    [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
    [CONFIG]: input.config,
    [MANIFEST]: manifestOf(),
    [CORE]: '# Core\n\nThe rules of core.\n',
    ...blockFilesOf({
      blocks: input.blocks ?? [],
    }),
    ...input.files,
  },
});

const parsers = (): {
  configParser: ConfigParser;
  frontMatterParser: FrontMatterParser;
} => ({
  configParser: createConfigFileParser(),
  frontMatterParser: createYamlFrontMatterParser(),
});

export type { BlockFixture };
export {
  ARCHIVE,
  blockFilesOf,
  CONFIG,
  CORE,
  Folder,
  MANIFEST,
  manifestOf,
  PROJECT,
  parsers,
  passportOf,
  projectTreeOf,
  ruleOf,
};
