import { splitFrontMatter } from '#/kernel/utils';

import type { FileTree, FrontMatterParser, ManifestParser } from '../../../../../../../contracts';
import type { Agent, Documents, Skill, SkillFrontMatterRead } from '../../../../../../../entities';
import { DocumentPath } from '../../../../../../../entities';

// <directory>/<skill>/SKILL.md, where no folder is hidden
const SKILL_FILE = /^((?:[^./][^/]*\/)+)[^./][^/]*\/SKILL\.md$/;
const AGENT_FILE = /^agents\/([^./][^/]*)\.md$/;

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

const readDocuments = (input: {
  frontMatterParser: FrontMatterParser;
  listed: readonly string[];
  parser: ManifestParser;
  paths: ReadonlySet<string>;
  repository: FileTree;
  repositoryPaths: ReadonlySet<string>;
  tree: FileTree;
}): Documents => {
  const textOf = (path: string): string | undefined =>
    input.paths.has(path) ? input.tree.read(path) : undefined;

  const repositoryTextOf = (path: string): string | undefined =>
    input.repositoryPaths.has(path) ? input.repository.read(path) : undefined;

  const hooks = textOf(DocumentPath.Hooks);
  const marketplace = repositoryTextOf(DocumentPath.Marketplace);
  const plugin = textOf(DocumentPath.Plugin);

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
  };
};

export { readDocuments };
