import type { Finding } from '#/kernel/types';

import { DocumentPath } from '../../../../constants';
import { resolveLink } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { foldersOf, linkTargetsOf } from '../link-targets.utils';

interface Document {
  // The files and folders its links may reach.
  known: ReadonlySet<string>;
  path: string;
  text: string;
}

const knownOf = (paths: ReadonlySet<string>): ReadonlySet<string> =>
  new Set([
    ...paths,
    ...foldersOf(paths),
  ]);

const linksCheck: Check = ({ constitution }: CheckInput): readonly Finding[] => {
  const known = knownOf(constitution.paths);
  const repositoryKnown = knownOf(constitution.repositoryPaths);
  const { decisions, readme } = constitution.documents;
  const documents: readonly Document[] = [
    ...constitution.blocks.flatMap((block) =>
      block.files.map((file) => ({
        known,
        path: file.path,
        text: file.body,
      })),
    ),
    ...[
      {
        path: DocumentPath.Readme,
        text: readme,
      },
      {
        path: DocumentPath.Decisions,
        text: decisions,
      },
    ].flatMap(({ path, text }) =>
      text === undefined
        ? []
        : [
            {
              known: repositoryKnown,
              path,
              text,
            },
          ],
    ),
  ];

  return documents.flatMap((document) =>
    linkTargetsOf(document.text)
      .filter((target) => {
        const resolved = resolveLink({
          path: document.path,
          target,
        });

        return !document.known.has(resolved);
      })
      .map((target) => ({
        message: `links to a missing file "${target}"`,
        path: document.path,
      })),
  );
};

export { linksCheck };
