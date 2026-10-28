import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

interface SyncpackInput {
  readonly args: readonly string[];
  readonly files: Readonly<Record<string, string>>;
}

interface Issues {
  readonly issues: readonly string[];
  readonly status: number;
}

const ISSUE_CODE = /\b(?:[A-Z][a-z]+){2,}\b/g;

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
