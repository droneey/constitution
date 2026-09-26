import type { Finding } from '#/kernel';
import { compareFindings } from '#/kernel';

import type {
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '../../../contracts';
import type { Digests } from '../../../entities';
import { byIdOf } from '../../../utils';
import { generateDigests } from '../generate-digests';
import { loadConstitution } from '../load-constitution';

type DigestsPrepared =
  | {
      digests: Digests;
      status: 'prepared';
    }
  | {
      findings: readonly Finding[];
      status: 'refused';
    };

// Digests of a constitution that does not load would index a broken model, so
// they are refused until the loader has no finding.
const prepareDigests = (input: {
  frontMatterParser: FrontMatterParser;
  manifestParser: ManifestParser;
  tree: FileTree;
}): DigestsPrepared => {
  const { constitution, findings } = loadConstitution(input);

  return findings.length > 0
    ? {
        findings: findings.toSorted(compareFindings),
        status: 'refused',
      }
    : {
        digests: generateDigests({
          byId: byIdOf(constitution.blocks),
          constitution,
        }),
        status: 'prepared',
      };
};

export type { DigestsPrepared };
export { prepareDigests };
