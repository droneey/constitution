import type { Met, ProjectWarning } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId, BlockSource, PackPath, RuleSlug } from '#/kernel/value-objects';

import { parsers } from '../../../../../../../../../__tests__/project.fixtures';
import type { BlockSetAnswer, BlockSetSource, SourceFile } from '../../../../../../../../entities';
import { SourceStatus } from '../../../../../../../../entities';
import { readBlockSet } from '../read-block-set';

// The folders a warning names the files of the release and of a pack under.
const RELEASE = '/release';
const PROJECT = '/project';

interface SourceFixture {
  readonly files?: Readonly<Record<string, string>>;
  readonly shownFolderPath?: string;
  readonly source?: string;
  readonly unreadable?: readonly string[];
}

// A source whose files are given by their path from its folder, the unreadable ones apart.
const sourceOf = (input: SourceFixture): BlockSetSource => ({
  files: [
    ...Object.entries(input.files ?? {}).map(
      ([path, text]): SourceFile => ({
        path,
        status: FileReadStatus.Read,
        text,
      }),
    ),
    ...(input.unreadable ?? []).map(
      (path): SourceFile => ({
        path,
        status: FileReadStatus.Unreadable,
      }),
    ),
  ],
  source: BlockSource.create(
    input.source === undefined ? undefined : PackPath.create(input.source),
  ),
  shownFolderPath: AbsolutePath.create(input.shownFolderPath ?? RELEASE),
  status: SourceStatus.Listed,
});

interface PackFixture {
  readonly files: Readonly<Record<string, string>>;
  readonly source: string;
  readonly unreadable?: readonly string[];
}

// A pack listed as source, under the project's folder.
const packOf = (input: PackFixture): BlockSetSource =>
  sourceOf({
    ...input,
    shownFolderPath: `${PROJECT}/${input.source}`,
  });

// Each block's bases, nearest first, by the ids a case writes.
const ancestorsOf = (
  bases: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<BlockId, readonly BlockId[]> =>
  new Map(
    Object.entries(bases).map(([id, ancestors]) => [
      BlockId.create(id),
      ancestors.map(BlockId.create),
    ]),
  );

interface BlockSetAnswerFixture {
  readonly block: string;
  readonly met?: Met;
  readonly requirement: string;
}

const blockSetAnswerOf = (answer: BlockSetAnswerFixture): BlockSetAnswer => ({
  block: BlockId.create(answer.block),
  ...(answer.met === undefined
    ? {}
    : {
        met: answer.met,
      }),
  requirement: RuleSlug.create(answer.requirement),
});

// The block set the sources read as, with the warnings given while reading it.
const blockSetOf = (
  sources: readonly BlockSetSource[],
): ReturnType<typeof readBlockSet>['blockSet'] & {
  warnings: readonly ProjectWarning[];
} => {
  const read = readBlockSet({
    parser: parsers().cardParser,
    sources,
  });

  return {
    ...read.blockSet,
    warnings: read.warnings,
  };
};

export { ancestorsOf, blockSetAnswerOf, blockSetOf, packOf, sourceOf };
