import { splitFrontMatter } from '#/kernel/utils';

import { SKILL_FILE_NAME } from '../../../../../../../../domain/constants';
import type {
  Agent,
  Documents,
  Skill,
  SkillFrontMatterRead,
} from '../../../../../../../../domain/entities';
import { DocumentPath } from '../../../../../../../../domain/entities';
import { TreePath } from '../../../../../../../../domain/value-objects';
import type { FileTree, FrontMatterParser, ManifestParser } from '../../../../../../../contracts';

// Why: Claude Code reads a skill at <directory>/<skill>/SKILL.md, where no folder is hidden.
const skillPath = new RegExp(
  `^((?:[^./][^/]*\\/)+)[^./][^/]*\\/${RegExp.escape(SKILL_FILE_NAME)}$`,
);
const AGENT_FILE = /^agents\/([^./][^/]*)\.md$/;

/** @throws {TreeError} when the skill's file cannot be read */
const skillFrontMatterOf = (input: {
  parser: FrontMatterParser;
  path: TreePath;
  tree: FileTree;
}): {
  readonly frontMatter?: SkillFrontMatterRead;
} => {
  const { frontMatter } = splitFrontMatter(input.tree.read(input.path));

  return frontMatter === undefined
    ? {}
    : {
        frontMatter: input.parser.skill(frontMatter),
      };
};

/** @throws {TreeError} when a skill's file cannot be read */
const skillsOf = (input: {
  listed: readonly TreePath[];
  parser: FrontMatterParser;
  tree: FileTree;
}): readonly Skill[] =>
  input.listed.flatMap((path) => {
    const directory = skillPath.exec(path)?.[1];

    if (directory === undefined) {
      return [];
    }

    return [
      {
        directory,
        ...skillFrontMatterOf({
          parser: input.parser,
          path,
          tree: input.tree,
        }),
        path,
      },
    ];
  });

/** @throws {TreeError} when an agent's file cannot be read */
const agentsOf = (input: {
  listed: readonly TreePath[];
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
        ...skillFrontMatterOf({
          parser: input.parser,
          path,
          tree: input.tree,
        }),
        path,
      },
    ];
  });

interface ReadDocumentsInput {
  readonly frontMatterParser: FrontMatterParser;
  readonly listed: readonly TreePath[];
  readonly parser: ManifestParser;
  readonly paths: ReadonlySet<TreePath>;
  readonly repository: FileTree;
  readonly repositoryPaths: ReadonlySet<TreePath>;
  readonly tree: FileTree;
}

/** @throws {TreeError} when a document cannot be read */
const readDocuments = (input: ReadDocumentsInput): Documents => {
  /** @throws {TreeError} when the document cannot be read */
  const textOf = (path: DocumentPath): string | undefined => {
    const treePath = TreePath.create(path);

    return input.paths.has(treePath) ? input.tree.read(treePath) : undefined;
  };

  /** @throws {TreeError} when the document cannot be read */
  const repositoryTextOf = (path: DocumentPath): string | undefined => {
    const treePath = TreePath.create(path);

    return input.repositoryPaths.has(treePath) ? input.repository.read(treePath) : undefined;
  };

  const decisions = repositoryTextOf(DocumentPath.Decisions);
  const hooks = textOf(DocumentPath.Hooks);
  const marketplace = repositoryTextOf(DocumentPath.Marketplace);
  const plugin = textOf(DocumentPath.Plugin);
  const readme = repositoryTextOf(DocumentPath.Readme);

  return {
    agents: agentsOf({
      listed: input.listed,
      parser: input.frontMatterParser,
      tree: input.tree,
    }),
    ...(decisions === undefined
      ? {}
      : {
          decisions,
        }),
    ...(hooks === undefined
      ? {}
      : {
          hooks: input.parser.hooks(hooks),
        }),
    ...(marketplace === undefined
      ? {}
      : {
          marketplace: input.parser.marketplace(marketplace),
        }),
    ...(plugin === undefined
      ? {}
      : {
          plugin: input.parser.plugin(plugin),
        }),
    ...(readme === undefined
      ? {}
      : {
          readme,
        }),
    skills: skillsOf({
      listed: input.listed,
      parser: input.frontMatterParser,
      tree: input.tree,
    }),
  };
};

export { readDocuments };
