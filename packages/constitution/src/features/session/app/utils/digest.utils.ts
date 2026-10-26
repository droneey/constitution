import { ProjectWarning } from '#/kernel/entities';
import { warningTextOf } from '#/shared/cli';

import type { DigestContents, DigestRelease } from '../../domain/entities';
import { DigestKind } from '../../domain/entities';
import { blockListLines } from './block-list.utils';
import { budgetedBodyOf, coreBodyOf } from './digest-body.utils';
import { overrideListLines } from './override-list.utils';

/** The digest's text: the lines before the rules, and the rules. */
interface Digest {
  readonly body: readonly string[];
  readonly head: readonly string[];
}

const releaseLine = (release: DigestRelease): string =>
  `The Droneey Constitution ${release.version} supplies this repository's rules. Block files live under ${release.folder}.`;

const unparsedDigestOf = (input: {
  core: string;
  line: number;
  release: DigestRelease;
}): Digest => ({
  body: coreBodyOf(input.core),
  head: [
    releaseLine(input.release),
    `constitution.yaml does not parse at line ${input.line}; only core applies.`,
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
    releaseLine(contents.release),
    `constitution.yaml makes ${contents.count} ${contents.count === 1 ? 'block' : 'blocks'} active.`,
  ],
});

// One line in place of the rules when the release cannot give them: doctor tells what is wrong.
const doctorNoticeOf = (releaseFolder: string): Digest => ({
  body: [],
  head: [
    `The Droneey Constitution gives no rules here: ${releaseFolder} is missing or holds a release this executable cannot read. Tell the user to run constitution doctor.`,
  ],
});

/** The digest a session starts with, its block list within the budget the hook's context gives. */
const digestOf = (contents: DigestContents): Digest => {
  switch (contents.kind) {
    case DigestKind.NoRelease:
      return doctorNoticeOf(contents.releaseFolder);
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
