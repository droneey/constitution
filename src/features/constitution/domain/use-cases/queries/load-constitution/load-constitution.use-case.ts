import type { Finding } from '#/kernel';

import type { FileTree } from '../../../contracts/file-tree.port';
import type {
  Block,
  Constitution,
  RequirementAnswer,
  Rule,
  StrayHeading,
} from '../../../entities';
import { classifyBlockPath } from './block-path.utils';
import type { Located } from './load-block.utils';
import { groupByFolder, loadBlock } from './load-block.utils';
import { parseRequirements } from './requirements.utils';
import { parseRules } from './rules.utils';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';
const README = 'README.md';
const BLOCKS = 'blocks/';
const OUTSIDE =
  'is not inside a layer folder: core, domains, contexts/platforms, contexts/languages or implementations';
const STRAY =
  'is not a block file; a block holds its main file, its chapters and with/<block>.md';

interface ConstitutionLoaded {
  constitution: Constitution;
  findings: readonly Finding[];
}

const optional = (input: {
  path: string;
  paths: ReadonlySet<string>;
  tree: FileTree;
}): string | undefined =>
  input.paths.has(input.path) ? input.tree.read(input.path) : undefined;

const parsedOf = (
  blocks: readonly Block[],
): {
  answers: readonly RequirementAnswer[];
  rules: readonly Rule[];
  strayHeadings: readonly StrayHeading[];
} => {
  const sources = blocks.flatMap((block) =>
    block.files.map((file) => ({
      block: block.id,
      file: file.path,
      text: file.text,
      with: file.with,
    })),
  );
  const parsed = sources.map(parseRules);

  return {
    answers: sources.flatMap(parseRequirements),
    rules: parsed.flatMap((result) => result.rules),
    strayHeadings: parsed.flatMap((result) => result.strayHeadings),
  };
};

const byId = (left: Block, right: Block): number =>
  left.id < right.id ? -1 : 1;

const locate = (paths: readonly string[]): readonly Located[] =>
  paths.flatMap((path) => {
    const block = classifyBlockPath(path);

    return block === undefined
      ? []
      : [
          {
            block,
            path,
          },
        ];
  });

const loadConstitution = (input: { tree: FileTree }): ConstitutionLoaded => {
  const listed = input.tree.list();
  const paths: ReadonlySet<string> = new Set(listed);
  const underBlocks = listed.filter((path) => path.startsWith(BLOCKS));
  const located = locate(underBlocks);
  const loaded = groupByFolder(
    located.filter((entry) => entry.block.file !== 'stray'),
  ).map((entries) =>
    loadBlock({
      entries,
      tree: input.tree,
    }),
  );
  const blocks = loaded
    .flatMap((result) =>
      result.block === undefined
        ? []
        : [
            result.block,
          ],
    )
    .toSorted(byId);
  const parsed = parsedOf(blocks);
  const document = (path: string): string | undefined =>
    optional({
      path,
      paths,
      tree: input.tree,
    });

  return {
    constitution: {
      blocks,
      documents: {
        hooks: document(HOOKS),
        marketplace: document(MARKETPLACE),
        plugin: document(PLUGIN),
        readme: document(README),
      },
      paths,
      requirementAnswers: parsed.answers,
      rules: parsed.rules,
      strayHeadings: parsed.strayHeadings,
    },
    findings: [
      ...underBlocks
        .filter((path) => classifyBlockPath(path) === undefined)
        .map((path) => ({
          message: OUTSIDE,
          path,
        })),
      ...located
        .filter((entry) => entry.block.file === 'stray')
        .map((entry) => ({
          message: STRAY,
          path: entry.path,
        })),
      ...loaded.flatMap((result) => result.findings),
    ],
  };
};

export { loadConstitution };
