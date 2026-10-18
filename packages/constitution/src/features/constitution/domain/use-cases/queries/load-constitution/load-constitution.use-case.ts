import { LAYERS } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';
import { compareText } from '#/kernel/utils';

import { BASE_PREFIX, DocumentPath } from '../../../constants';
import type {
  BindingsParser,
  FileTree,
  FrontMatterParser,
  ManifestParser,
  VocabularyParser,
} from '../../../contracts';
import type {
  Agent,
  Block,
  Constitution,
  Documents,
  PresetFile,
  RequirementAnswer,
  Rule,
  Skill,
  SkillFrontMatterRead,
} from '../../../entities';
import { splitFrontMatter, withoutCodeFences } from '../../../utils';
import { bindingsOf } from './bindings.utils';
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
const PRESETS = 'presets/';
const OUTSIDE =
  'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations';
const STRAY =
  "is not a block file; a block holds at its root its card <id>.md, its chapters and with/<block>.md, and in architecture/ or workflow/ that axis's chapters and with/<block>.md";
// <directory>/<skill>/SKILL.md, where no folder is hidden
const SKILL_FILE = /^((?:[^./][^/]*\/)+)[^./][^/]*\/SKILL\.md$/;
const AGENT_FILE = /^agents\/([^./][^/]*)\.md$/;

const byLayerThenId = (left: Block, right: Block): number =>
  LAYERS.indexOf(left.layer) - LAYERS.indexOf(right.layer) || compareText(left.id, right.id);

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
    const others = blocks.filter((other) => other.id === block.id && other.path !== block.path);

    return others.length === 0
      ? []
      : [
          {
            message: `shares the id "${block.id}" with ${others.map((other) => other.path).join(', ')}; an id names one block`,
            path: block.path,
          },
        ];
  });

const manifestOf = (input: {
  parser: FrontMatterParser;
  path: string;
  tree: FileTree;
}): SkillFrontMatterRead | undefined => {
  const { frontMatter } = splitFrontMatter(input.tree.read(input.path));

  return frontMatter === undefined ? undefined : input.parser.skill(frontMatter);
};

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

    return [
      {
        directory,
        frontMatter: manifestOf({
          parser: input.parser,
          path,
          tree: input.tree,
        }),
        path,
      },
    ];
  });

const agentsOf = (input: {
  listed: readonly string[];
  parser: FrontMatterParser;
  tree: FileTree;
}): readonly Agent[] =>
  input.listed.flatMap((path) => {
    const file = AGENT_FILE.exec(path)?.[1];

    if (file === undefined) {
      return [];
    }

    return [
      {
        file,
        frontMatter: manifestOf({
          parser: input.parser,
          path,
          tree: input.tree,
        }),
        path,
      },
    ];
  });

const documentsOf = (input: {
  base: FileTree | undefined;
  frontMatterParser: FrontMatterParser;
  listed: readonly string[];
  parser: ManifestParser;
  paths: ReadonlySet<string>;
  repository: FileTree;
  repositoryPaths: ReadonlySet<string>;
  tree: FileTree;
  vocabularyParser: VocabularyParser;
}): Documents => {
  const textOf = (path: string): string | undefined =>
    input.paths.has(path) ? input.tree.read(path) : undefined;
  const repositoryTextOf = (path: string): string | undefined =>
    input.repositoryPaths.has(path) ? input.repository.read(path) : undefined;
  const hooks = textOf(DocumentPath.Hooks);
  const marketplace = repositoryTextOf(DocumentPath.Marketplace);
  const plugin = textOf(DocumentPath.Plugin);
  // A pack holds no vocabulary of its own: the words are its base's.
  const vocabulary =
    textOf(DocumentPath.Vocabulary) ??
    (input.base?.list().includes(DocumentPath.Vocabulary)
      ? input.base.read(DocumentPath.Vocabulary)
      : undefined);

  return {
    agents: agentsOf({
      listed: input.listed,
      parser: input.frontMatterParser,
      tree: input.tree,
    }),
    decisions: repositoryTextOf(DocumentPath.Decisions),
    hooks: hooks === undefined ? undefined : input.parser.hooks(hooks),
    marketplace: marketplace === undefined ? undefined : input.parser.marketplace(marketplace),
    plugin: plugin === undefined ? undefined : input.parser.plugin(plugin),
    readme: repositoryTextOf(DocumentPath.Readme),
    skills: skillsOf({
      listed: input.listed,
      parser: input.frontMatterParser,
      tree: input.tree,
    }),
    vocabulary: vocabulary === undefined ? undefined : input.vocabularyParser.parse(vocabulary),
  };
};

interface BlocksLoaded {
  blocks: readonly Block[];
  findings: readonly Finding[];
}

const blocksOf = (input: { parser: FrontMatterParser; tree: FileTree }): BlocksLoaded => {
  const underBlocks = input.tree.list().filter((path) => path.startsWith(BLOCKS));
  const located = locate(underBlocks);
  const loaded = groupByFolder(
    located.filter((entry) => entry.block.file !== BlockPathFile.Stray),
  ).map((folder) =>
    loadBlock({
      folder,
      parser: input.parser,
      tree: input.tree,
    }),
  );

  return {
    blocks: loaded.flatMap((outcome) =>
      outcome.block === undefined
        ? []
        : [
            outcome.block,
          ],
    ),
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
      ...loaded.flatMap((outcome) => outcome.findings),
    ],
  };
};

// A block of the base keeps its place in the paths apart from the pack's.
const rebased = (block: Block): Block => ({
  ...block,
  files: block.files.map((file) => ({
    ...file,
    path: `${BASE_PREFIX}${file.path}`,
  })),
  path: `${BASE_PREFIX}${block.path}`,
});

const BASE_BROKEN =
  'is the Constitution this pack extends, and it does not load; check it before the pack';

// The tree is the Constitution's own package; the repository is the one that
// holds it, the same tree when the package is the repository. A pack is loaded
// beside the base it extends, so its arrows and requires resolve against it.
const loadConstitution = (input: {
  base?: FileTree;
  bindingsParser: BindingsParser;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  repository: FileTree;
  tree: FileTree;
  vocabularyParser: VocabularyParser;
}): ConstitutionLoaded => {
  const listed = input.tree.list();
  const paths: ReadonlySet<string> = new Set(listed);
  const repositoryPaths: ReadonlySet<string> = new Set(input.repository.list());
  const own = blocksOf({
    parser: input.frontMatterParser,
    tree: input.tree,
  });
  const base =
    input.base === undefined
      ? undefined
      : blocksOf({
          parser: input.frontMatterParser,
          tree: input.base,
        });
  const blocks = [
    ...own.blocks,
    ...(base?.blocks ?? []).map(rebased),
  ].toSorted(byLayerThenId);
  const parsed = parsedOf(blocks);
  const filesUnder = (folder: string): readonly PresetFile[] =>
    listed
      .filter((path) => path.startsWith(folder))
      .map((path) => ({
        path,
        text: input.tree.read(path),
      }));
  const presets = filesUnder(PRESETS);
  const bindings = bindingsOf({
    parser: input.bindingsParser,
    presets,
  });

  return {
    constitution: {
      bindings: bindings.bindings,
      blocks,
      documents: documentsOf({
        base: input.base,
        frontMatterParser: input.frontMatterParser,
        listed,
        parser: input.manifestParser,
        paths,
        repository: input.repository,
        repositoryPaths,
        tree: input.tree,
        vocabularyParser: input.vocabularyParser,
      }),
      paths,
      presets,
      repositoryPaths,
      requirementAnswers: parsed.answers,
      rules: parsed.rules,
    },
    findings: [
      ...own.findings,
      ...((base?.findings.length ?? 0) > 0
        ? [
            {
              message: BASE_BROKEN,
              path: BASE_PREFIX,
            },
          ]
        : []),
      ...duplicateIdFindings(blocks),
      ...parsed.findings,
      ...bindings.findings,
    ],
  };
};

export type { ConstitutionLoaded };
export { loadConstitution };
