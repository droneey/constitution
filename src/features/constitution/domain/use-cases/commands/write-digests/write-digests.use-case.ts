import { DOCUMENT_PATHS } from '../../../constants';
import type { DigestWriter } from '../../../contracts';
import type { Digests } from '../../../entities';

const writeDigests = (input: {
  digests: Digests;
  writer: DigestWriter;
}): void => {
  input.writer.write({
    path: DOCUMENT_PATHS.digestIndex,
    text: input.digests.index,
  });
  input.writer.write({
    path: DOCUMENT_PATHS.digestCore,
    text: input.digests.core,
  });
};

export { writeDigests };
