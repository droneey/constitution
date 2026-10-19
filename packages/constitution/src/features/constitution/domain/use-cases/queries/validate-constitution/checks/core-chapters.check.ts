import type { Finding } from '#/kernel/types';

import type { Block, BlockFile } from '../../../../entities';
import { BlockFileRole } from '../../../../entities';
import { directoryOf, localLinkTargets, resolveLink } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

const CORE = 'core';

/** core's chapter whose list gives core's chapters in the order they are read */
const PLACEMENT = 'placement.md';

const LIST_ITEM = '- ';

/** the chapters the list's items link, each by its path */
const listedIn = (placement: BlockFile): readonly string[] =>
  placement.body
    .split('\n')
    .filter((line) => line.startsWith(LIST_ITEM))
    .flatMap(localLinkTargets)
    .map((target) =>
      resolveLink({
        path: placement.path,
        target,
      }),
    );

const listFindings = (input: { core: Block; placement: BlockFile }): readonly Finding[] => {
  const chapters = input.core.files
    .filter((file) => file.role === BlockFileRole.Chapter)
    .map((file) => file.path);
  const listed = listedIn(input.placement);
  const findingOf = (message: string): Finding => ({
    message,
    path: input.placement.path,
  });

  return [
    ...chapters
      .filter((chapter) => !listed.includes(chapter))
      .map((chapter) =>
        findingOf(`leaves ${chapter} out of its list; it lists every chapter of core once`),
      ),
    ...listed
      .filter((entry) => !chapters.includes(entry))
      .map((entry) => findingOf(`lists ${entry}, which is not a chapter of core`)),
    ...[
      ...new Set(listed.filter((entry, index) => listed.indexOf(entry) !== index)),
    ].map((entry) => findingOf(`lists ${entry} twice`)),
  ];
};

const coreFindings = (core: Block): readonly Finding[] => {
  const placement = core.files.find(
    (file) => file.path === `${directoryOf(core.path)}/${PLACEMENT}`,
  );

  return placement === undefined
    ? []
    : listFindings({
        core,
        placement,
      });
};

// Placement's list is the order core's chapters are read in, which the site and the digest follow.
const coreChaptersCheck: Check = ({ byId }: CheckInput): readonly Finding[] => {
  const core = byId.get(CORE);

  return core === undefined ? [] : coreFindings(core);
};

export { coreChaptersCheck };
