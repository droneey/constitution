import { createJsonManifestParser } from '../adapters/json';
import { createYamlFrontMatterParser } from '../adapters/yaml';
import type {
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '../domain/contracts';
import type { Block, Constitution } from '../domain/entities';
import type { ConstitutionLoaded } from '../domain/use-cases/queries/load-constitution';
import { loadConstitution } from '../domain/use-cases/queries/load-constitution';
import type { CheckInput } from '../domain/use-cases/queries/validate-constitution/check.types';
import type { BlocksById } from '../domain/utils';
import { byIdOf } from '../domain/utils';
import { createFakeFileTree } from './fake-file-tree';

type Files = Record<string, string>;

interface BlockFixture {
  abstract?: boolean;
  body: string;
  chapters?: readonly string[];
  checks?: readonly string[];
  extends?: string | null;
  governs?: readonly string[];
  id: string;
  kind: string;
  owns?: readonly string[];
  requires?: readonly string[];
  status?: string;
  summary?: string;
}

interface RuleFixture {
  check?: string;
  implementsSlug?: string;
  level?: string;
  slug: string;
  statement?: string;
  tags?: string;
  why?: string;
}

const list = (items: readonly string[] | undefined): string =>
  JSON.stringify(items ?? []);

const mainFile = (block: BlockFixture): string =>
  [
    '---',
    `id: ${block.id}`,
    `kind: ${block.kind}`,
    `summary: ${block.summary ?? `The ${block.id} block.`}`,
    `chapters: ${list(block.chapters)}`,
    `requires: ${list(block.requires)}`,
    `extends: ${block.extends ?? 'null'}`,
    `abstract: ${String(block.abstract ?? false)}`,
    `checks: ${list(block.checks)}`,
    `owns: ${list(block.owns)}`,
    `governs: ${list(block.governs)}`,
    `status: ${block.status ?? 'stable'}`,
    '---',
    '',
    block.body,
  ].join('\n');

const rule = (input: RuleFixture): string =>
  [
    `## ${input.slug} · ${input.level ?? 'MUST'}`,
    input.statement ?? `The ${input.slug} rule holds.`,
    `**Why:** ${input.why ?? 'it keeps the code honest.'}`,
    `**Check:** ${input.check ?? 'review'}`,
    `**Tags:** ${input.tags ?? 'architecture'}`,
    ...(input.implementsSlug === undefined
      ? []
      : [
          `**Implements:** \`${input.implementsSlug}\``,
        ]),
    '',
  ].join('\n');

interface Source {
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  tree: FileTree;
}

const sourceOf = (files: Readonly<Files>): Source => ({
  frontMatterParser: createYamlFrontMatterParser(),
  manifestParser: createJsonManifestParser(),
  tree: createFakeFileTree(files),
});

const loadedOf = (files: Readonly<Files>): ConstitutionLoaded =>
  loadConstitution(sourceOf(files));

const loadFiles = (files: Readonly<Files>): Constitution =>
  loadedOf(files).constitution;

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

const blockOf = (input: { byId: BlocksById; id: string }): Block => {
  const block = input.byId.get(input.id);

  if (block === undefined) {
    throw new Error(`The fixture has no block ${input.id}`);
  }

  return block;
};

const textOf = (input: { files: Readonly<Files>; path: string }): string => {
  const text: string | undefined = input.files[input.path];

  if (text === undefined) {
    throw new Error(`The fixture has no file ${input.path}`);
  }

  return text;
};

const without = (input: { files: Readonly<Files>; path: string }): Files =>
  Object.fromEntries(
    Object.entries(input.files).filter(
      ([candidate]) => candidate !== input.path,
    ),
  );

export type { BlockFixture, Files, RuleFixture, Source };
export {
  blockOf,
  checkInputOf,
  loadedOf,
  loadFiles,
  mainFile,
  rule,
  sourceOf,
  textOf,
  without,
};
