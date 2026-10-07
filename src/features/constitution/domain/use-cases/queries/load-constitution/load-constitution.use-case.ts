import { LAYERS } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';
import { compareText } from '#/kernel/utils';

import { DocumentPath } from '../../../constants';
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

// Five layers, not four ranks: the index groups platforms, then languages, and
// the hook never sorts.
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
  frontMatterParser: FrontMatterParser;
  listed: readonly string[];
  parser: ManifestParser;
  paths: ReadonlySet<string>;
  tree: FileTree;
  vocabularyParser: VocabularyParser;
}): Documents => {
  const textOf = (path: string): string | undefined =>
    input.paths.has(path) ? input.tree.read(path) : undefined;
  const hooks = textOf(DocumentPath.Hooks);
  const marketplace = textOf(DocumentPath.Marketplace);
  const plugin = textOf(DocumentPath.Plugin);
  const vocabulary = textOf(DocumentPath.Vocabulary);

  return {
    agents: agentsOf({
      listed: input.listed,
      parser: input.frontMatterParser,
      tree: input.tree,
    }),
    decisions: textOf(DocumentPath.Decisions),
    digests: {
      core: textOf(DocumentPath.DigestCore),
      index: textOf(DocumentPath.DigestIndex),
    },
    hooks: hooks === undefined ? undefined : input.parser.hooks(hooks),
    marketplace: marketplace === undefined ? undefined : input.parser.marketplace(marketplace),
    plugin: plugin === undefined ? undefined : input.parser.plugin(plugin),
    readme: textOf(DocumentPath.Readme),
    skills: skillsOf({
      listed: input.listed,
      parser: input.frontMatterParser,
      tree: input.tree,
    }),
    vocabulary: vocabulary === undefined ? undefined : input.vocabularyParser.parse(vocabulary),
  };
};

const loadConstitution = (input: {
  bindingsParser: BindingsParser;
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  tree: FileTree;
  vocabularyParser: VocabularyParser;
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
    .flatMap((outcome) =>
      outcome.block === undefined
        ? []
        : [
            outcome.block,
          ],
    )
    .toSorted(byLayerThenId);
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
        frontMatterParser: input.frontMatterParser,
        listed,
        parser: input.manifestParser,
        paths,
        tree: input.tree,
        vocabularyParser: input.vocabularyParser,
      }),
      paths,
      presets,
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
      ...loaded.flatMap((outcome) => outcome.findings),
      ...duplicateIdFindings(blocks),
      ...parsed.findings,
      ...bindings.findings,
    ],
  };
};

export type { ConstitutionLoaded };
export { loadConstitution };
