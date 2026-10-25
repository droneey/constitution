import type { FindingOf } from '#/kernel/types';
import { withoutCodeFences } from '#/kernel/utils';
import { coreBlockId } from '#/kernel/value-objects';

import type { Block } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { localLinkTargets, resolveLink } from '../shared/markdown';

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

/** an item of the passport's list of core's chapters, which opens with its axis folder: "- `foundation/`: …" */
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
  // the passport is core.md, which opens the Constitution: the list names the rest
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
    ...[
      ...new Set(listed.filter((entry, index) => listed.indexOf(entry) !== index)),
    ].map(
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

// Core's passport lists its chapters in the order they are read, which the site follows.
const coreChaptersCheck: Check<CoreChaptersFinding> = ({
  graph,
}: CheckInput): readonly CoreChaptersFinding[] => {
  const core = graph.get(coreBlockId);

  return core === undefined ? [] : coreFindings(core);
};

export type { CoreChaptersDetails };
export { CoreChaptersCode, coreChaptersCheck };
