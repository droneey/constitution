import { mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { temporaryFolder } from '#/__tests__/temporary-folder.fixtures';

import {
  configModuleLoaderSuite,
  MISSING_CONFIG_PATH,
  OUTSIDE_CONFIG_PATH,
  refusalOf,
  SCENARIO_CONFIG_PATH,
  UNCONFIGURED_MODE_NAME,
} from '../../../__tests__/config-module-loader.suite';
import { ConfigModuleError, ConfigModuleFailure } from '../../../domain/errors';
import { AbsolutePath } from '../../../domain/value-objects';
import { createConfigModuleLoader } from '../config-module-loader.adapter';

const sandboxPath = temporaryFolder();

/** a working folder inside the sandbox that holds `configText` at the scenario's path, beside a module that throws when it runs */
const workingFolderWith = (configText: string): AbsolutePath => {
  const workingFolderPath = AbsolutePath.create(join(sandboxPath(), 'platform'));

  mkdirSync(workingFolderPath);
  writeFileSync(join(workingFolderPath, SCENARIO_CONFIG_PATH), configText);
  writeFileSync(join(workingFolderPath, OUTSIDE_CONFIG_PATH), "throw new Error('ran');");

  return workingFolderPath;
};

const codeOf = (candidate: unknown): unknown =>
  candidate instanceof Object && 'code' in candidate ? candidate.code : undefined;

const failureCodesOf = (loading: Promise<unknown>): Promise<unknown> =>
  loading.then(
    () => undefined,
    (error: unknown) => ({
      code: codeOf(error),
      causeCode: error instanceof Error ? codeOf(error.cause) : undefined,
    }),
  );

configModuleLoaderSuite({
  implementationName: 'createConfigModuleLoader',
  loaderOfScenario: () =>
    createConfigModuleLoader({
      workingFolderPath: workingFolderWith(
        `export default ({ name }) => (name === '${UNCONFIGURED_MODE_NAME}' ? 'text' : { name });`,
      ),
    }),
});

describe('createConfigModuleLoader', () => {
  it('should keep the failure of the file system as the cause when nothing lies at the path', async () => {
    // Arrange
    const loader = createConfigModuleLoader({
      workingFolderPath: workingFolderWith('export default () => ({});'),
    });

    // Act
    const codes = await failureCodesOf(loader.load(MISSING_CONFIG_PATH));

    // Assert
    expect(codes).toStrictEqual({
      code: ConfigModuleFailure.NotFound,
      causeCode: 'ENOENT',
    });
  });

  it('should pass on a failure of the file system that tells no missing path', async () => {
    // Arrange
    const workingFolderPath = workingFolderWith('export default () => ({});');

    symlinkSync('loop-b.config.ts', join(workingFolderPath, 'loop-a.config.ts'));
    symlinkSync('loop-a.config.ts', join(workingFolderPath, 'loop-b.config.ts'));

    const loader = createConfigModuleLoader({
      workingFolderPath,
    });

    // Act
    const codes = await failureCodesOf(loader.load('loop-a.config.ts'));

    // Assert
    expect(codes).toStrictEqual({
      code: 'ELOOP',
      causeCode: undefined,
    });
  });

  it.each([
    {
      condition: 'null',
      returned: 'null',
    },
    {
      condition: 'a list',
      returned: '[{}]',
    },
  ])(
    'should give a function that refuses a mode whose configuration is $condition',
    async ({ returned }) => {
      // Arrange
      const configOf = await createConfigModuleLoader({
        workingFolderPath: workingFolderWith(`export default () => ${returned};`),
      }).load(SCENARIO_CONFIG_PATH);

      // Act
      const refusal = refusalOf(() =>
        configOf({
          name: 'light',
          isDefault: true,
        }),
      );

      // Assert
      expect(refusal).toStrictEqual({
        code: ConfigModuleFailure.ReturnsNoObject,
        modeName: 'light',
      });
    },
  );

  it.each([
    {
      condition: 'an object',
      configText: 'export default { platforms: {} };',
    },
    {
      condition: 'nothing',
      configText: 'export const platforms = {};',
    },
  ])('should refuse a module whose default export is $condition', async ({ configText }) => {
    // Arrange
    const loader = createConfigModuleLoader({
      workingFolderPath: workingFolderWith(configText),
    });

    // Act
    const refusal = await loader.load(SCENARIO_CONFIG_PATH).catch((error: unknown) => error);

    // Assert
    expect(refusal).toStrictEqual(
      new ConfigModuleError({
        code: ConfigModuleFailure.ExportsNoFunction,
        configPath: SCENARIO_CONFIG_PATH,
      }),
    );
  });
});
