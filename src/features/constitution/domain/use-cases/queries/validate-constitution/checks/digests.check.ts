import type { Finding } from '#/kernel/types';

import { generateDigests } from '../../generate-digests';
import type { Check, CheckInput } from '../check.types';

const DIGESTS = 'digests/';

// The digests are generated when the plugin is released, never committed: the
// check holds their limits on a copy generated in memory, and refuses a file
// git tracks under digests/.
const digestsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => [
  ...generateDigests({
    byId,
    constitution,
  }).findings,
  ...[
    ...constitution.paths,
  ]
    .filter((path) => path.startsWith(DIGESTS))
    .map((path) => ({
      message:
        'is generated when the plugin is released and ignored by git; run git rm --cached on it',
      path,
    })),
];

export { digestsCheck };
