import type { AbsolutePath } from '#/kernel/value-objects';

import type { DigestRelease } from '../../domain/entities';

const releaseMessage = (release: DigestRelease): string =>
  `The Droneey Constitution ${release.version} supplies this repository's rules. Block files live under ${release.folderPath}.`;

/** atLines is the " at line …" the text goes on with, or empty when no line is known. */
const unparsedMessage = (atLines: string): string =>
  `constitution.yaml does not parse${atLines}; only core applies.`;

const oneActiveMessage = (): string => 'constitution.yaml makes 1 block active.';

const activeMessage = (count: number): string => `constitution.yaml makes ${count} blocks active.`;

const doctorNoticeMessage = (releaseFolderPath: AbsolutePath): string =>
  `The Droneey Constitution gives no rules here: ${releaseFolderPath} is missing or holds a release this executable cannot read. Tell the user to run constitution doctor.`;

export { activeMessage, doctorNoticeMessage, oneActiveMessage, releaseMessage, unparsedMessage };
