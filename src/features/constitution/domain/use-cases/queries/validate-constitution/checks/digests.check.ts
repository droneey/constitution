import type { Finding } from '#/kernel';

import { DocumentPath } from '../../../../constants';
import { generateDigests } from '../../generate-digests';
import type { Check, CheckInput } from '../check.types';

const RUN = 'run bun run digests:write';
const DIGESTS = 'digests/';
const WRITTEN: ReadonlySet<string> = new Set([
  DocumentPath.DigestCore,
  DocumentPath.DigestIndex,
]);

const staleMessage = (input: {
  committed: string | undefined;
  generated: string;
}): string | undefined => {
  if (input.committed === undefined) {
    return `is missing; ${RUN}`;
  }

  return input.committed === input.generated
    ? undefined
    : `differs from its regeneration; ${RUN}`;
};

const digestsCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] => {
  const generated = generateDigests({
    byId,
    constitution,
  });
  const { core, index } = constitution.documents.digests;

  return [
    ...generated.findings,
    ...[
      ...constitution.paths,
    ]
      .filter((path) => path.startsWith(DIGESTS) && !WRITTEN.has(path))
      .map((path) => ({
        message: 'is not a digest the generator writes; delete it',
        path,
      })),
    ...[
      {
        message: staleMessage({
          committed: index,
          generated: generated.index,
        }),
        path: DocumentPath.DigestIndex,
      },
      {
        message: staleMessage({
          committed: core,
          generated: generated.core,
        }),
        path: DocumentPath.DigestCore,
      },
    ].flatMap(({ message, path }) =>
      message === undefined
        ? []
        : [
            {
              message,
              path,
            },
          ],
    ),
  ];
};

export { digestsCheck };
