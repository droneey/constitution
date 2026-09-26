import type { Finding } from '#/kernel';

import { DOCUMENT_PATHS } from '../../../../constants';
import type { Check, CheckInput } from '../check.types';
import { foldersOf, linkTargetsOf, resolveLink } from '../link-targets.utils';

interface Document {
  path: string;
  text: string;
}

const linksCheck: Check = ({
  constitution,
}: CheckInput): readonly Finding[] => {
  const folders = foldersOf(constitution.paths);
  const readme = constitution.documents.readme;
  const documents: readonly Document[] = [
    ...constitution.blocks.flatMap((block) =>
      block.files.map((file) => ({
        path: file.path,
        text: file.body,
      })),
    ),
    ...(readme === undefined
      ? []
      : [
          {
            path: DOCUMENT_PATHS.readme,
            text: readme,
          },
        ]),
  ];

  return documents.flatMap((document) =>
    linkTargetsOf(document.text)
      .filter((target) => {
        const resolved = resolveLink({
          path: document.path,
          target,
        });

        return !(constitution.paths.has(resolved) || folders.has(resolved));
      })
      .map((target) => ({
        message: `links to a missing file "${target}"`,
        path: document.path,
      })),
  );
};

export { linksCheck };
