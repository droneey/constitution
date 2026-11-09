import type { ProjectWarning } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId, BlockSource, PackPath } from '#/kernel/value-objects';

import { cardsOf } from '../../../../../../../__tests__/project.fixtures';
import type { BlockSetSource, SourceFile } from '../../../../../../block-set/entities';
import { SourceStatus } from '../../../../../../block-set/entities';
import { readBlockSet } from '../read-block-set';

const RELEASE = '/release';
const PROJECT = '/project';

interface SourceFixture {
  readonly files?: Readonly<Record<string, string>>;
  readonly shownFolderPath?: string;
  readonly source?: string;
  readonly unreadable?: readonly string[];
}

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

const packOf = (input: PackFixture): BlockSetSource =>
  sourceOf({
    ...input,
    shownFolderPath: `${PROJECT}/${input.source}`,
  });

const ancestorsOf = (
  bases: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<BlockId, readonly BlockId[]> =>
  new Map(
    Object.entries(bases).map(([id, ancestors]) => [
      BlockId.create(id),
      ancestors.map(BlockId.create),
    ]),
  );

const blockSetOf = (
  sources: readonly BlockSetSource[],
): ReturnType<typeof readBlockSet>['blockSet'] & {
  warnings: readonly ProjectWarning[];
} => {
  const read = readBlockSet({
    cards: cardsOf(sources),
    sources,
  });

  return {
    ...read.blockSet,
    warnings: read.warnings,
  };
};

export { ancestorsOf, blockSetOf, packOf, sourceOf };
