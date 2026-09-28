import type { Finding } from '#/kernel';
import { compareText, LAYERS } from '#/kernel';

import { DocumentPath } from '../../../constants';
import type {
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '../../../contracts';
import type {
  Block,
  Constitution,
  Documents,
  RequirementAnswer,
  Rule,
  Skill,
} from '../../../entities';
import { splitFrontMatter, withoutCodeFences } from '../../../utils';
import { BlockPathFile, classifyBlockPath } from './block-path.utils';
import type { Located } from './load-block.utils';
import { groupByFolder, loadBlock } from './load-block.utils';
import { parseRequirements } from './requirements.utils';
import { resolveRules } from './rule-chain.utils';
import { parseRules } from './rules.utils';

interface ConstitutionLoaded {
  constitution: Constitution;
  findings: readonly Finding[];
}

interface Parsed {
  answers: readonly RequirementAnswer[];
  findings: readonly Finding[];
  rules: readonly Rule[];
}

const BLOCKS = 'blocks/';
const OUTSIDE =
  'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations';
const STRAY =
  'is not a block file; a block holds its card <id>.md and, in foundation/, architecture/ or workflow/, its chapters and with/<block>.md';
// <directory>/<skill>/SKILL.md, where no folder is hidden
const SKILL_FILE = /^((?:[^./][^/]*\/)+)[^./][^/]*\/SKILL\.md$/;

// Five layers, not four ranks: the index groups platforms, then languages, and
// the hook never sorts.
const byLayerThenId = (left: Block, right: Block): number =>
  LAYERS.indexOf(left.layer) - LAYERS.indexOf(right.layer) ||
  compareText(left.id, right.id);

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

const parsedOf = (blocks: readonly Block[]): Parsed => {
  const sources = blocks.flatMap((block) =>
    block.files.map((file) => ({
      axis: file.axis,
      block: block.id,
      file: file.path,
      text: withoutCodeFences(file.body),
      with: file.with,
    })),
  );
  const rules = sources.map(parseRules);
  const answers = sources.map(parseRequirements);

  return {
    answers: answers.flatMap((parsed) => parsed.answers),
    findings: [
      ...rules.flatMap((parsed) => parsed.findings),
      ...answers.flatMap((parsed) => parsed.findings),
    ],
    rules: resolveRules(rules.flatMap((parsed) => parsed.rules)),
  };
};

const duplicateIdFindings = (blocks: readonly Block[]): readonly Finding[] =>
  blocks.flatMap((block) => {
    const others = blocks.filter(
      (other) => other.id === block.id && other.path !== block.path,
    );

    return others.length === 0
      ? []
      : [
          {
            message: `shares the id "${block.id}" with ${others.map((other) => other.path).join(', ')}; an id names one block`,
            path: block.path,
          },
        ];
  });

const skillsOf = (input: {
  listed: readonly string[];
  parser: FrontMatterParser;
  tree: FileTree;
}): readonly Skill[] =>
  input.listed.flatMap((path) => {
    const directory = SKILL_FILE.exec(path)?.[1];

    if (directory === undefined) {
      return [];
    }

    const { frontMatter } = splitFrontMatter(input.tree.read(path));

    return [
      {
        directory,
        frontMatter:
          frontMatter === undefined
            ? undefined
            : input.parser.skill(frontMatter),
        path,
      },
    ];
  });

const documentsOf = (input: {
  frontMatterParser: FrontMatterParser;
  listed: readonly string[];
  parser: ManifestParser;
  paths: ReadonlySet<string>;
  tree: FileTree;
}): Documents => {
  const textOf = (path: string): string | undefined =>
    input.paths.has(path) ? input.tree.read(path) : undefined;
  const hooks = textOf(DocumentPath.Hooks);
  const marketplace = textOf(DocumentPath.Marketplace);
  const plugin = textOf(DocumentPath.Plugin);

  return {
    decisions: textOf(DocumentPath.Decisions),
    digests: {
      core: textOf(DocumentPath.DigestCore),
      index: textOf(DocumentPath.DigestIndex),
    },
    hooks: hooks === undefined ? undefined : input.parser.hooks(hooks),
    marketplace:
      marketplace === undefined
        ? undefined
        : input.parser.marketplace(marketplace),
    plugin: plugin === undefined ? undefined : input.parser.plugin(plugin),
    readme: textOf(DocumentPath.Readme),
    skills: skillsOf({
      listed: input.listed,
      parser: input.frontMatterParser,
      tree: input.tree,
    }),
  };
};

const loadConstitution = (input: {
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  tree: FileTree;
}): ConstitutionLoaded => {
  const listed = input.tree.list();
  const paths: ReadonlySet<string> = new Set(listed);
  const underBlocks = listed.filter((path) => path.startsWith(BLOCKS));
  const located = locate(underBlocks);
  const loaded = groupByFolder(
    located.filter((entry) => entry.block.file !== BlockPathFile.Stray),
  ).map((folder) =>
    loadBlock({
      folder,
      parser: input.frontMatterParser,
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
    .toSorted(byLayerThenId);
  const parsed = parsedOf(blocks);

  return {
    constitution: {
      blocks,
      documents: documentsOf({
        frontMatterParser: input.frontMatterParser,
        listed,
        parser: input.manifestParser,
        paths,
        tree: input.tree,
      }),
      paths,
      requirementAnswers: parsed.answers,
      rules: parsed.rules,
    },
    findings: [
      ...underBlocks
        .filter((path) => classifyBlockPath(path) === undefined)
        .map((path) => ({
          message: OUTSIDE,
          path,
        })),
      ...located
        .filter((entry) => entry.block.file === BlockPathFile.Stray)
        .map((entry) => ({
          message: STRAY,
          path: entry.path,
        })),
      ...loaded.flatMap((result) => result.findings),
      ...duplicateIdFindings(blocks),
      ...parsed.findings,
    ],
  };
};

export type { ConstitutionLoaded };
export { loadConstitution };
