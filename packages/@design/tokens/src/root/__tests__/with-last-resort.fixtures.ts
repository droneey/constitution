import { ExitCode } from '#/features/themes';

import { withLastResort } from '../with-last-resort';

interface LastResortRun {
  readonly errorText: string;
  readonly exitCode: ExitCode;
}

const runUnderLastResort = async (failure?: unknown): Promise<LastResortRun> => {
  const errorTexts: string[] = [];
  const endedWith = await withLastResort({
    run: () =>
      failure === undefined ? Promise.resolve(ExitCode.Success) : Promise.reject(failure),
    writeError: (text) => {
      errorTexts.push(text);
    },
  });

  return {
    errorText: errorTexts.join(''),
    exitCode: endedWith,
  };
};

const lastResortTexts = async (): Promise<string> => {
  const runs = await Promise.all([
    runUnderLastResort(new Error('the build failed')),
    runUnderLastResort(42),
  ]);

  return runs.map(({ errorText }) => errorText).join('');
};

export { lastResortTexts, runUnderLastResort };
