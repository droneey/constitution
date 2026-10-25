import type { Finding } from '#/kernel/types';
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

const coreFindings = (core: Block): readonly Finding[] => {
  // the passport is core.md, which opens the Constitution: the list names the rest
  const chapters = core.parts.map((file) => file.path);
  const listed = listedIn(core);

  const findingOf = (code: CoreChaptersCode, message: string): Finding => ({
    code,
    message,
    path: core.passport.path,
  });

  return [
    ...chapters
      .filter((chapter) => !listed.includes(chapter))
      .map((chapter) =>
        findingOf(
          CoreChaptersCode.ChapterUnlisted,
          `leaves ${chapter} out of its list of core's chapters; it lists every chapter of core once`,
        ),
      ),
    ...listed
      .filter((entry) => !chapters.includes(entry))
      .map((entry) =>
        findingOf(
          CoreChaptersCode.ListsNoChapter,
          `lists ${entry}, which is not a chapter of core`,
        ),
      ),
    ...[
      ...new Set(listed.filter((entry, index) => listed.indexOf(entry) !== index)),
    ].map((entry) => findingOf(CoreChaptersCode.ListedTwice, `lists ${entry} twice`)),
  ];
};

// Core's passport lists its chapters in the order they are read, which the site follows.
const coreChaptersCheck: Check = ({ graph }: CheckInput): readonly Finding[] => {
  const core = graph.get(coreBlockId);

  return core === undefined ? [] : coreFindings(core);
};

export { coreChaptersCheck };
