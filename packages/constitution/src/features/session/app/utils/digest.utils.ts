import { ProjectWarning } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';
import { atLinesText, warningTextOf } from '#/shared/cli';

import type { DigestContents, DigestRelease } from '../../domain/entities';
import { DigestKind } from '../../domain/entities';
import { blockListLines } from './block-list.utils';
import {
  doctorNoticeMessage,
  dutyLines,
  releaseMessage,
  unparsedMessage,
  warningLineMessage,
} from './digest.messages';
import { coreBodyOf, digestBodyOf } from './digest-body.utils';

interface Digest {
  readonly body: readonly string[];
  readonly head: readonly string[];
}

const unparsedDigestOf = (input: {
  core: string;
  lines: readonly number[];
  release: DigestRelease;
}): Digest => ({
  body: [
    ...coreBodyOf(input.core),
    '',
    ...dutyLines(),
  ],
  head: [
    releaseMessage(input.release),
    unparsedMessage(atLinesText(input.lines)),
  ],
});

const resolvedDigestOf = (
  contents: Extract<
    DigestContents,
    {
      kind: DigestKind.Resolved;
    }
  >,
): Digest => ({
  body: digestBodyOf({
    blockList: blockListLines(contents.listing),
    core: contents.core,
    duty: dutyLines(),
    isStartup: contents.isStartup,
    warnings: contents.warnings.map((warning) =>
      warningLineMessage({
        code: ProjectWarning.codeOf(warning),
        text: warningTextOf(warning),
      }),
    ),
  }),
  head: [
    releaseMessage(contents.release),
  ],
});

const doctorNoticeOf = (releaseFolderPath: AbsolutePath): Digest => ({
  body: [],
  head: [
    doctorNoticeMessage(releaseFolderPath),
  ],
});

const digestOf = (contents: DigestContents): Digest => {
  switch (contents.kind) {
    case DigestKind.NoRelease:
      return doctorNoticeOf(contents.releaseFolderPath);
    case DigestKind.Unparsed:
      return unparsedDigestOf(contents);
    case DigestKind.Resolved:
      return resolvedDigestOf(contents);
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return contents satisfies never;
  }
};

export { digestOf };
