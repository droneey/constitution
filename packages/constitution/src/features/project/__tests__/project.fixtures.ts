import type { FakeTree } from '#/__tests__/project-files.fake';
import { corePassport, PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';

import { createJsonReleaseManifestParser } from '../infrastructure/json';
import { createYamlBlockCardParser, createYamlConfigFileParser } from '../infrastructure/yaml';
import type { BlockCardParser, ConfigParser, ReleaseManifestParser } from '../application/contracts';
import type { ProjectError } from '../domain/errors';
import { isProjectError } from '../domain/errors';

const configPath = `${PROJECT}/constitution.yaml`;
const manifest = `${releaseFolderPath}/package.json`;
const VERSION = '1.0.0';
const FORMAT = 4;

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
  readonly files?: Readonly<Record<string, string>>;
  readonly folder?: Folder;
  readonly governs?: readonly string[];
  readonly id: string;
  readonly languages?: readonly string[];
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
    `languages: ${listOf(block.languages)}`,
    `governs: ${listOf(block.governs)}`,
    '---',
    '',
    `# ${block.id}`,
    '',
    block.body ?? '',
  ].join('\n');

const blockFolderOf = (input: { block: BlockFixture; root: string }): string =>
  `${input.root}/blocks/${input.block.folder ?? Folder.Domain}/${input.block.id}`;

interface BlockFilesFixture {
  readonly blocks: readonly BlockFixture[];
  readonly root?: string;
}

const blockFilesOf = (input: BlockFilesFixture): Readonly<Record<string, string>> =>
  Object.fromEntries(
    input.blocks.flatMap((block) => {
      const folder = blockFolderOf({
        block,
        root: input.root ?? releaseFolderPath,
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

interface RuleFixture {
  readonly level?: string;
  readonly slug: string;
  readonly tightens?: string;
}

const ruleOf = (input: RuleFixture): string => {
  const arrow = input.tightens === undefined ? '' : ` → ${input.tightens}`;
  const level = input.level === undefined ? '' : ` · ${input.level}`;

  return [
    `### ${input.slug}${arrow}${level}`,
    '',
    'A rule.',
    '',
    '| Why |',
    '|---|',
    '| a reason. |',
    '',
  ].join('\n');
};

interface ManifestFixture {
  readonly format?: number | string;
  readonly version?: string;
}

const manifestOf = (input: ManifestFixture = {}): string =>
  `${JSON.stringify(
    {
      name: '@droneey/constitution',
      version: input.version ?? VERSION,
      constitutionFormat: input.format ?? FORMAT,
    },
    undefined,
    2,
  )}\n`;

interface ProjectTreeFixture {
  readonly blocks?: readonly BlockFixture[];
  readonly config: string;
  readonly files?: Readonly<Record<string, string>>;
}

const projectTreeOf = (input: ProjectTreeFixture): FakeTree => ({
  files: {
    [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
    [configPath]: input.config,
    [manifest]: manifestOf(),
    [corePassport]: '# Core\n\nThe rules of core.\n',
    ...blockFilesOf({
      blocks: input.blocks ?? [],
    }),
    ...input.files,
  },
});

const parsers = (): {
  configParser: ConfigParser;
  cardParser: BlockCardParser;
  manifestParser: ReleaseManifestParser;
} => ({
  configParser: createYamlConfigFileParser(),
  cardParser: createYamlBlockCardParser(),
  manifestParser: createJsonReleaseManifestParser(),
});

interface Failure {
  readonly cause: unknown;
  readonly code: ProjectError['code'];
  readonly details: unknown;
}

const failureOf = (act: () => unknown): Failure | undefined => {
  try {
    act();

    return undefined;
  } catch (error) {
    if (!isProjectError(error)) {
      throw error;
    }

    return {
      cause: error.cause,
      code: error.code,
      details: error.details,
    };
  }
};

export type { BlockFixture };
export {
  blockFilesOf,
  configPath,
  Folder,
  failureOf,
  manifest,
  manifestOf,
  parsers,
  passportOf,
  projectTreeOf,
  ruleOf,
};
