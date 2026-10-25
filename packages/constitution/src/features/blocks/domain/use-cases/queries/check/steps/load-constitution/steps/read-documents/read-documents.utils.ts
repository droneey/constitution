import { splitFrontMatter } from '#/kernel/utils';

import { SKILL_FILE } from '../../../../../../../constants';
import type { FileTree, FrontMatterParser, ManifestParser } from '../../../../../../../contracts';
import type { Agent, Documents, Skill, SkillFrontMatterRead } from '../../../../../../../entities';
import { DocumentPath } from '../../../../../../../entities';

// <directory>/<skill>/SKILL.md, where no folder is hidden
const skillPath = new RegExp(`^((?:[^./][^/]*\\/)+)[^./][^/]*\\/${RegExp.escape(SKILL_FILE)}$`);
const AGENT_FILE = /^agents\/([^./][^/]*)\.md$/;

// A file that does not open with a front matter has none to read.
const skillFrontMatterOf = (input: {
  parser: FrontMatterParser;
  path: string;
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

const skillsOf = (input: {
  listed: readonly string[];
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
  readonly listed: readonly string[];
  readonly parser: ManifestParser;
  readonly paths: ReadonlySet<string>;
  readonly repository: FileTree;
  readonly repositoryPaths: ReadonlySet<string>;
  readonly tree: FileTree;
}

// A document whose file is absent is left out.
const readDocuments = (input: ReadDocumentsInput): Documents => {
  const textOf = (path: string): string | undefined =>
    input.paths.has(path) ? input.tree.read(path) : undefined;

  const repositoryTextOf = (path: string): string | undefined =>
    input.repositoryPaths.has(path) ? input.repository.read(path) : undefined;

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
