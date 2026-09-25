import { posix } from 'node:path';

import type { Constitution } from '#/features/constitution';
import type { Finding } from '#/kernel';
import { localLinkTargets } from '#/libs/markdown';

import type { Check } from '../check.types';

const README = 'README.md';

interface Document {
  path: string;
  text: string;
}

const resolveFrom = (input: { path: string; target: string }): string =>
  posix.normalize(posix.join(posix.dirname(input.path), input.target));

const brokenLinks = (input: {
  document: Document;
  paths: ReadonlySet<string>;
}): readonly Finding[] =>
  localLinkTargets(input.document.text)
    .filter(
      (target) =>
        !input.paths.has(
          resolveFrom({
            path: input.document.path,
            target,
          }),
        ),
    )
    .map((target) => ({
      message: `links to a missing file "${target}"`,
      path: input.document.path,
    }));

const linksCheck: Check = (constitution: Constitution): readonly Finding[] =>
  [
    ...constitution.blocks.flatMap((block) => block.files),
    ...(constitution.documents.readme === undefined
      ? []
      : [
          {
            path: README,
            text: constitution.documents.readme,
          },
        ]),
  ].flatMap((document) =>
    brokenLinks({
      document,
      paths: constitution.paths,
    }),
  );

export { linksCheck };
