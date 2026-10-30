import { ProjectWarning } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';
import { atLinesText, warningTextOf } from '#/shared/cli';

import type { DigestContents, DigestRelease } from '../../domain/entities';
import { DigestKind } from '../../domain/entities';
import { blockListLines } from './block-list.utils';
import {
  activeMessage,
  doctorNoticeMessage,
  oneActiveMessage,
  releaseMessage,
  unparsedMessage,
} from './digest.messages';
import { budgetedBodyOf, coreBodyOf } from './digest-body.utils';
import { overrideListLines } from './override-list.utils';

interface Digest {
  readonly body: readonly string[];
  readonly head: readonly string[];
}

const unparsedDigestOf = (input: {
  core: string;
  lines: readonly number[];
  release: DigestRelease;
}): Digest => ({
  body: coreBodyOf(input.core),
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
  body: budgetedBodyOf({
    blockList: blockListLines(contents.listing),
    core: contents.core,
    isStartup: contents.isStartup,
    overrides: overrideListLines(contents.listing.overrides),
    warnings: contents.warnings.map(
      (warning) => `- ${ProjectWarning.codeOf(warning)}: ${warningTextOf(warning)}`,
    ),
  }),
  head: [
    releaseMessage(contents.release),
    contents.count === 1 ? oneActiveMessage() : activeMessage(contents.count),
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
