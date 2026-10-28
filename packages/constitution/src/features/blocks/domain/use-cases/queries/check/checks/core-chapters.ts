import type { FindingOf } from '#/kernel/types';
import { withoutCodeFences } from '#/kernel/utils';
import { coreBlockId } from '#/kernel/value-objects';

import type { Block } from '../../../../entities';
import { repeatsOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { localLinkTargets, resolveLink } from '../utils';

enum CoreChaptersCode {
  ChapterUnlisted = 'core-chapter-unlisted',
  ListsNoChapter = 'core-list-names-no-chapter',
  ListedTwice = 'core-chapter-listed-twice',
}

interface CoreChaptersDetails {
  readonly [CoreChaptersCode.ChapterUnlisted]: {
    readonly chapter: string;
  };
  readonly [CoreChaptersCode.ListsNoChapter]: {
    readonly entry: string;
  };
  readonly [CoreChaptersCode.ListedTwice]: {
    readonly entry: string;
  };
}

type CoreChaptersFinding = FindingOf<CoreChaptersDetails>;

const AXIS_ITEM = /^- `[a-z]+\/`:/;

const listedIn = (core: Block): readonly string[] =>
  withoutCodeFences(core.passport.body)
    .split('\n')
    .filter((line) => AXIS_ITEM.test(line))
    .flatMap(localLinkTargets)
    .map((target) =>
      resolveLink({
        path: core.passport.path,
        target,
      }),
    );

const coreFindings = (core: Block): readonly CoreChaptersFinding[] => {
  const chapters = core.parts.map((file) => file.path);
  const listed = listedIn(core);
  const { path } = core.passport;

  return [
    ...chapters
      .filter((chapter) => !listed.includes(chapter))
      .map(
        (chapter): CoreChaptersFinding => ({
          code: CoreChaptersCode.ChapterUnlisted,
          details: {
            chapter,
          },
          path,
        }),
      ),
    ...listed
      .filter((entry) => !chapters.includes(entry))
      .map(
        (entry): CoreChaptersFinding => ({
          code: CoreChaptersCode.ListsNoChapter,
          details: {
            entry,
          },
          path,
        }),
      ),
    ...repeatsOf(listed).map(
      (entry): CoreChaptersFinding => ({
        code: CoreChaptersCode.ListedTwice,
        details: {
          entry,
        },
        path,
      }),
    ),
  ];
};

const coreChaptersCheck: Check<CoreChaptersFinding> = ({
  graph,
}: CheckInput): readonly CoreChaptersFinding[] => {
  const core = graph.get(coreBlockId);

  return core === undefined ? [] : coreFindings(core);
};

export type { CoreChaptersDetails };
export { CoreChaptersCode, coreChaptersCheck };
