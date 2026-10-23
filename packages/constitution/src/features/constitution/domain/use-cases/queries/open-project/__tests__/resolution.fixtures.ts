import { Axis } from '#/kernel/constants';

import type { BlockFixture } from '../../../../../__tests__/project.fixtures';
import { blockFilesOf, parsers } from '../../../../../__tests__/project.fixtures';
import type { ProjectConfig, ProjectFailure, ProjectUnit } from '../../../../entities';
import { ConfigReadStatus } from '../../../../entities';
import { isProjectError } from '../../../../errors';
import type { CatalogueSource } from '../catalogue.utils';

// The sources and the constitution.yaml a resolution reads, built from blocks and the keys of a
// declaration.

const ROOT = '/source';
const ARCHIVE_WHERE = '/work/project/.droneey/constitution';
const TODAY = '2026-06-15';
const CORE = 'core';
const CORE_FOLDER = 'blocks/core/';
const CORE_AS_DOMAIN = 'blocks/domains/core/';

// Every key constitution.yaml needs, each written so it warns of nothing.
const KEYS: Readonly<Record<string, string>> = {
  axes: 'axes: [architecture, workflow]',
  domains: 'domains: []',
  platforms: 'platforms: []',
  languages: 'languages: []',
  implementations: 'implementations: []',
  packages: 'packages: {}',
  packs: 'packs: []',
  check: 'check: null',
  overrides: 'overrides: []',
};

// A constitution.yaml of every key, the given ones written as given.
const yamlOf = (keys: Readonly<Record<string, string>> = {}): string =>
  `${Object.values({
    ...KEYS,
    ...keys,
  }).join('\n')}\n`;

// The declaration the real parser reads of a constitution.yaml that parses.
const parsedOf = (text: string): ProjectConfig => {
  const read = parsers().configParser.parse(text);

  if (read.status === ConfigReadStatus.Unparsed) {
    throw new Error(`constitution.yaml stops at line ${read.line}`);
  }

  return read.config;
};

const configOf = (keys: Readonly<Record<string, string>> = {}): ProjectConfig =>
  parsedOf(yamlOf(keys));

// The files of blocks, by their path from the source's folder.
const filesOf = (blocks: readonly BlockFixture[]): NonNullable<CatalogueSource['files']> =>
  Object.entries(
    blockFilesOf({
      blocks,
      root: ROOT,
    }),
  ).map(([path, text]) => ({
    path: path.slice(ROOT.length + 1),
    text,
  }));

// A source of the blocks given: the Constitution's by default, with core, or a pack's.
const sourceOf = (
  input: {
    blocks?: readonly BlockFixture[];
    // core's rules, globs and more files
    core?: Omit<BlockFixture, 'folder' | 'id'>;
    source?: string;
  } = {},
): CatalogueSource => {
  const source = input.source ?? '';
  // core is written as a domain, then moved to its own folder
  const core = filesOf([
    {
      ...input.core,
      id: CORE,
    },
  ]).map((file) => ({
    ...file,
    path: `${CORE_FOLDER}${file.path.slice(CORE_AS_DOMAIN.length)}`,
  }));

  return {
    files: [
      ...(source === '' ? core : []),
      ...filesOf(input.blocks ?? []),
    ],
    source,
    where: source === '' ? ARCHIVE_WHERE : source,
  };
};

// A unit of the repository with core alone on every axis, unless overridden.
const unitOf = (overrides: Partial<ProjectUnit> = {}): ProjectUnit => ({
  axes: [
    Axis.Foundation,
    Axis.Architecture,
    Axis.Workflow,
  ],
  blocks: new Set([
    CORE,
  ]),
  lowered: new Set(),
  path: '',
  scope: 0,
  ...overrides,
});

// A Requirements table answering each requirement as met or not.
const requirementsOf = (answers: Readonly<Record<string, string>>): string =>
  [
    '## Requirements',
    '',
    '| Requirement | How | Met |',
    '|---|---|---|',
    ...Object.entries(answers).map(
      ([requirement, met]) => `| \`${requirement}\` | A way. | ${met} |`,
    ),
    '',
  ].join('\n');

interface Failure {
  readonly code: ProjectFailure;
  readonly line: number | undefined;
  readonly path: string;
}

// The ProjectError an act throws, as its fields; undefined when it throws none.
const failureOf = (act: () => unknown): Failure | undefined => {
  try {
    act();

    return undefined;
  } catch (error) {
    if (!isProjectError(error)) {
      throw error;
    }

    return {
      code: error.code,
      line: error.line,
      path: error.path,
    };
  }
};

export { configOf, failureOf, parsedOf, requirementsOf, sourceOf, TODAY, unitOf, yamlOf };
