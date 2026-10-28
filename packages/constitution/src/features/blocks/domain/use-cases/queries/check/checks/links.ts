import type { FindingOf } from '#/kernel/types';

import { Block, DocumentPath } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { foldersOf, linkTargetsOf, resolveLink } from '../utils';

enum LinksCode {
  MissingTarget = 'link-to-missing-file',
}

interface LinksDetails {
  readonly [LinksCode.MissingTarget]: {
    readonly target: string;
  };
}

type LinksFinding = FindingOf<LinksDetails>;

interface Document {
  readonly known: ReadonlySet<string>;
  readonly path: string;
  readonly text: string;
}

const knownOf = (paths: ReadonlySet<string>): ReadonlySet<string> =>
  new Set([
    ...paths,
    ...foldersOf(paths),
  ]);

const linksCheck: Check<LinksFinding> = ({ constitution }: CheckInput): readonly LinksFinding[] => {
  const known = knownOf(constitution.paths);
  const repositoryKnown = knownOf(constitution.repositoryPaths);
  const { decisions, readme } = constitution.documents;
  const documents: readonly Document[] = [
    ...constitution.blocks.flatMap((block) =>
      Block.filesOf(block).map((file) => ({
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
        code: LinksCode.MissingTarget,
        details: {
          target,
        },
        path: document.path,
      })),
  );
};

export type { LinksDetails };
export { LinksCode, linksCheck };
