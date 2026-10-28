import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

interface SyncpackInput {
  readonly args: readonly string[];
  readonly files: Readonly<Record<string, string>>;
}

interface Issues {
  /** the codes of the issues syncpack names, in the order it names them */
  readonly issues: readonly string[];
  readonly status: number;
}

// syncpack names each issue by a code of capitalised words joined, beside the dependency or the
// property it finds it in.
const ISSUE_CODE = /\b(?:[A-Z][a-z]+){2,}\b/g;

/** syncpack's run in the widest unit, which holds the files given. */
const syncpackIssues = async (input: SyncpackInput): Promise<Issues> => {
  const { output, status } = await loadOf('syncpack', {
    command: [
      nodeBinary('syncpack'),
      ...input.args,
    ],
    files: input.files,
  });

  return {
    issues: output.flatMap((line) => line.match(ISSUE_CODE) ?? []),
    status,
  };
};

export { syncpackIssues };
