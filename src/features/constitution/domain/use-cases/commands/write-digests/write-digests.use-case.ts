import { DocumentPath } from '../../../constants';
import type { DigestWriter } from '../../../contracts';
import type { Digests } from '../../../entities';

const writeDigests = (input: { digests: Digests; writer: DigestWriter }): void => {
  input.writer.write({
    path: DocumentPath.DigestIndex,
    text: input.digests.index,
  });
  input.writer.write({
    path: DocumentPath.DigestCore,
    text: input.digests.core,
  });
};

export { writeDigests };
