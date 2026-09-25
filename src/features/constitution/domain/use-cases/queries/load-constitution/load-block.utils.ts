import type { Finding } from '#/kernel';
import { splitFrontMatter } from '#/libs/markdown';

import type { FileTree } from '../../../contracts/file-tree.port';
import type { Block, BlockFile } from '../../../entities';
import type { BlockPath } from './block-path.utils';
import { readFrontMatter } from './read-front-matter.utils';

interface Located {
  block: BlockPath;
  path: string;
}

type Group = readonly [
  Located,
  ...Located[],
];

interface Secondary {
  entry: Located;
  text: string;
}

interface BlockLoaded {
  block?: Block;
  findings: readonly Finding[];
}

const groupByFolder = (located: readonly Located[]): readonly Group[] => [
  ...located
    .reduce((groups, entry) => {
      const group = groups.get(entry.block.dir);
      const grown: Group =
        group === undefined
          ? [
              entry,
            ]
          : [
              ...group,
              entry,
            ];

      return new Map(groups).set(entry.block.dir, grown);
    }, new Map<string, Group>())
    .values(),
];

const secondaryFindings = (input: {
  chapters: readonly Located[];
  id: string;
  listed: readonly string[];
  mainPath: string;
  secondary: readonly Secondary[];
}): readonly Finding[] => [
  ...input.secondary
    .filter(({ text }) => splitFrontMatter(text).frontMatter !== undefined)
    .map(({ entry }) => ({
      message: 'has front matter; only the main file of a block carries it',
      path: entry.path,
    })),
  ...input.chapters
    .filter((entry) => !input.listed.includes(entry.block.name))
    .map((entry) => ({
      message: `is not listed in the chapters of ${input.id}`,
      path: entry.path,
    })),
  ...input.listed
    .filter(
      (name) => !input.chapters.some((entry) => entry.block.name === name),
    )
    .map((name) => ({
      message: `lists the chapter ${name}, which does not exist`,
      path: input.mainPath,
    })),
];

const filesOf = (input: {
  body: string;
  listed: readonly string[];
  mainPath: string;
  secondary: readonly Secondary[];
}): readonly BlockFile[] => [
  {
    path: input.mainPath,
    role: 'main',
    text: input.body,
    with: null,
  },
  ...input.listed.flatMap((name) =>
    input.secondary
      .filter(
        ({ entry }) =>
          entry.block.file === 'chapter' && entry.block.name === name,
      )
      .map(({ entry, text }) => ({
        path: entry.path,
        role: 'chapter' as const,
        text,
        with: null,
      })),
  ),
  ...input.secondary
    .filter(({ entry }) => entry.block.file === 'with')
    .map(({ entry, text }) => ({
      path: entry.path,
      role: 'with' as const,
      text,
      with: entry.block.with,
    })),
];

const loadBlock = (input: { entries: Group; tree: FileTree }): BlockLoaded => {
  const { dir, id, layer } = input.entries[0].block;
  const main = input.entries.find((entry) => entry.block.file === 'main');

  if (main === undefined) {
    return {
      findings: [
        {
          message: `has no main file ${id}.md`,
          path: dir,
        },
      ],
    };
  }

  const read = readFrontMatter({
    path: main.path,
    text: input.tree.read(main.path),
  });

  if (read.frontMatter === undefined) {
    return {
      findings: read.findings,
    };
  }

  const listed = read.frontMatter.chapters;
  const chapters = input.entries.filter(
    (entry) => entry.block.file === 'chapter',
  );
  const secondary = input.entries
    .filter(
      (entry) => entry.block.file === 'chapter' || entry.block.file === 'with',
    )
    .map((entry) => ({
      entry,
      text: input.tree.read(entry.path),
    }));

  return {
    block: {
      dir,
      files: filesOf({
        body: read.body,
        listed,
        mainPath: main.path,
        secondary,
      }),
      frontMatter: read.frontMatter,
      id,
      layer,
    },
    findings: secondaryFindings({
      chapters,
      id,
      listed,
      mainPath: main.path,
      secondary,
    }),
  };
};

export type { Group, Located };
export { groupByFolder, loadBlock };
