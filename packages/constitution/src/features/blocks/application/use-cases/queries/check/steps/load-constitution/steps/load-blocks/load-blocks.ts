import type {
  BlockGroup,
  BlockLoadFinding,
  BlockLoadStep,
  PlaceFinding,
} from '../../../../../../../../domain/entities';
import { Block, BlockFile, BlockLoadStatus } from '../../../../../../../../domain/entities';
import type { FileTree, FrontMatterParser } from '../../../../../../../contracts';

type BlocksLoadedFinding = BlockLoadFinding | PlaceFinding;

type BlockLoaded = BlockLoadStep<{
  readonly block: Block;
  readonly findings: readonly BlockLoadFinding[];
}>;

/** @throws {TreeError} when a file of the block cannot be read */
const loadBlock = (input: {
  group: BlockGroup;
  parser: FrontMatterParser;
  tree: FileTree;
}): BlockLoaded => {
  const passport = Block.passportIn(input.group);

  if (passport.status === BlockLoadStatus.Unloaded) {
    return passport;
  }

  const { path } = passport;
  const text = input.tree.read(path);
  const opened = Block.openPassport({
    path,
    text,
  });

  if (opened.status === BlockLoadStatus.Unloaded) {
    return opened;
  }

  const parsed = Block.parsePassport({
    path,
    read: input.parser.parse(opened.frontMatter),
  });

  if (parsed.status === BlockLoadStatus.Unloaded) {
    return parsed;
  }

  return {
    ...Block.fromFiles({
      folder: input.group.folder,
      frontMatter: parsed.frontMatter,
      parts: Block.partsIn(input.group).map((part) => ({
        ...part,
        text: input.tree.read(part.path),
      })),
      passport: {
        body: opened.body,
        path,
        text,
      },
    }),
    status: BlockLoadStatus.Loaded,
  };
};

interface BlocksLoaded {
  readonly blocks: readonly Block[];
  readonly findings: readonly BlocksLoadedFinding[];
}

interface LoadBlocksInput {
  readonly parser: FrontMatterParser;
  readonly tree: FileTree;
}

/** @throws {TreeError} when git cannot list the files, or a file of a block cannot be read */
const loadBlocks = (input: LoadBlocksInput): BlocksLoaded => {
  const located = BlockFile.locate(input.tree.list());
  const loaded = located.groups.map((group) =>
    loadBlock({
      group,
      parser: input.parser,
      tree: input.tree,
    }),
  );

  return {
    blocks: loaded.flatMap((outcome) =>
      outcome.status === BlockLoadStatus.Loaded
        ? [
            outcome.block,
          ]
        : [],
    ),
    findings: [
      ...located.findings,
      ...loaded.flatMap((outcome) => outcome.findings),
    ],
  };
};

export { loadBlocks };
