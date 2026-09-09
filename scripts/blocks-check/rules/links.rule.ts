import { posix } from 'node:path';

import type { Constitution, Finding, Rule } from '../models';

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
const EXTERNAL = /^(?:[a-z]+:|#)/;
const README = 'README.md';

interface Document {
  path: string;
  text: string;
}

const localTargets = (text: string): readonly string[] =>
  [
    ...text.matchAll(LINK),
  ]
    .map((match) => match[1] ?? '')
    .filter((target) => !EXTERNAL.test(target))
    .map((target) => target.split('#')[0] ?? '');

const resolveFrom = (path: string, target: string): string =>
  posix.normalize(posix.join(posix.dirname(path), target));

const brokenLinks = (
  document: Document,
  paths: ReadonlySet<string>,
): readonly Finding[] =>
  localTargets(document.text)
    .filter((target) => !paths.has(resolveFrom(document.path, target)))
    .map((target) => ({
      message: `links to a missing file "${target}"`,
      path: document.path,
    }));

const documentsOf = (constitution: Constitution): readonly Document[] => [
  ...constitution.blocks.flatMap((block) => block.chapters),
  ...(constitution.readme === undefined
    ? []
    : [
        {
          path: README,
          text: constitution.readme,
        },
      ]),
];

const linksRule: Rule = (constitution: Constitution): readonly Finding[] =>
  documentsOf(constitution).flatMap((document) =>
    brokenLinks(document, constitution.paths),
  );

export { linksRule };
