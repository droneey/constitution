import { ExitCode } from '#/features/themes';

import { lastResortLine } from './with-last-resort.messages';

interface LastResortInput {
  readonly run: () => Promise<ExitCode>;
  readonly writeError: (text: string) => void;
}

/** The handler of last resort: a failure the run lets through ends it with one written line and the failure code. */
const withLastResort = async ({ run, writeError }: LastResortInput): Promise<ExitCode> => {
  try {
    return await run();
  } catch (error) {
    writeError(lastResortLine(error instanceof Error ? error.message : String(error)));

    return ExitCode.Failure;
  }
};

export { withLastResort };
