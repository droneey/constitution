import { ConfigModuleError, ConfigModuleFailure } from '../../../../../domain/errors';
import type { ExitCode } from '../../../../constants';
import { runGenerateThemes } from '../generate-themes';

const CONFIG_PATH = 'style-dictionary.config.ts';

const GENERATE_ARGS = [
  'generate',
  CONFIG_PATH,
] as const;

const refusalOfEachCode = [
  new ConfigModuleError({
    code: ConfigModuleFailure.NotFound,
    configPath: CONFIG_PATH,
  }),
  new ConfigModuleError({
    code: ConfigModuleFailure.OutsideWorkingFolder,
    configPath: `../${CONFIG_PATH}`,
  }),
  new ConfigModuleError({
    code: ConfigModuleFailure.ExportsNoFunction,
    configPath: CONFIG_PATH,
  }),
  new ConfigModuleError({
    code: ConfigModuleFailure.ReturnsNoObject,
    modeName: 'dark',
  }),
];

interface Run {
  readonly errorText: string;
  readonly exitCode: ExitCode;
  readonly generatedPaths: readonly string[];
}

const runWith = async (args: readonly string[], failure?: Error): Promise<Run> => {
  const generatedPaths: string[] = [];
  const errorTexts: string[] = [];
  const exitCode = await runGenerateThemes({
    args,
    generateThemes: (configPath): Promise<void> => {
      if (failure !== undefined) {
        return Promise.reject(failure);
      }

      generatedPaths.push(configPath);

      return Promise.resolve();
    },
    writeError: (text) => {
      errorTexts.push(text);
    },
  });

  return {
    errorText: errorTexts.join(''),
    exitCode,
    generatedPaths,
  };
};

const failureTexts = async (): Promise<string> => {
  const runs = await Promise.all([
    runWith([
      'generate',
    ]),
    ...refusalOfEachCode.map((refusal) => runWith(GENERATE_ARGS, refusal)),
  ]);

  return runs.map(({ errorText }) => errorText).join('');
};

export { CONFIG_PATH, failureTexts, GENERATE_ARGS, refusalOfEachCode, runWith };
