import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { transformSync } from '@babel/core';
import reactCompiler from 'babel-plugin-react-compiler';

import { pluginFingerprintOf } from '#/libs/claude-plugin';
import { ExitCode } from '#/shared/cli';

import { BuildError, BuildFailure, isBuildError } from './errors';

// Builds the constitution executable: `--target`, one of Bun's, the host's by default;
// `--outfile`, from the folder it runs in, dist/cli/constitution by default. The React Compiler
// memoises every component and hook of constitution and of the design system on the way, and the
// fingerprint of the plugin's files in the package is built in, for doctor to compare the installed
// plugin's with.
const entryFile = resolve(import.meta.dir, '../../src/main.ts');
const packageFolder = resolve(import.meta.dir, '../..');
const TARGETS: readonly Bun.Build.CompileTarget[] = [
  'bun-linux-x64',
  'bun-linux-arm64',
  'bun-darwin-x64',
  'bun-darwin-arm64',
] as const;
const COMPONENTS = /\/packages\/[^/]+\/src\/.+\.(?:tsx|hooks\.ts)$/;
const DEVTOOLS = /^react-devtools-core$/;
const STUB_NAMESPACE = 'stub';

const writeError = (text: string): void => {
  process.stderr.write(text);
};

const buildMessages: Readonly<Record<BuildFailure, (given: string) => string>> = {
  [BuildFailure.TargetUnknown]: (given) => `--target ${given} is none of ${TARGETS.join(', ')}`,
  [BuildFailure.PluginUnreadable]: (given) => `the plugin's files under ${given} cannot be read`,
  [BuildFailure.CompilerGaveNothing]: (given) => `the React Compiler gave nothing for ${given}`,
};

const messageOf = (error: unknown): string => {
  if (isBuildError(error)) {
    return buildMessages[error.code](error.details.given);
  }

  return error instanceof Error ? error.message : String(error);
};

const reactCompilerPlugin: Bun.BunPlugin = {
  name: 'react-compiler',
  setup: (build): void => {
    build.onLoad(
      {
        filter: COMPONENTS,
      },
      async ({ path }) => {
        const isJsx = path.endsWith('.tsx');
        const compiled = transformSync(await Bun.file(path).text(), {
          babelrc: false,
          configFile: false,
          filename: path,
          parserOpts: {
            plugins: isJsx
              ? [
                  'typescript',
                  'jsx',
                ]
              : [
                  'typescript',
                ],
          },
          plugins: [
            [
              reactCompiler,
              {
                panicThreshold: 'all_errors',
              },
            ],
          ],
        });

        if (typeof compiled?.code !== 'string') {
          throw new BuildError({
            code: BuildFailure.CompilerGaveNothing,
            details: {
              given: path,
            },
          });
        }

        return {
          contents: compiled.code,
          loader: isJsx ? 'tsx' : 'ts',
        };
      },
    );
  },
};

// Ink reaches react-devtools-core only when DEV is set, and no install of the executable holds it,
// so the bundle takes an empty module in its place.
const devtoolsStubPlugin: Bun.BunPlugin = {
  name: 'devtools-stub',
  setup: (build): void => {
    build.onResolve(
      {
        filter: DEVTOOLS,
      },
      ({ path }) => ({
        namespace: STUB_NAMESPACE,
        path,
      }),
    );
    build.onLoad(
      {
        filter: DEVTOOLS,
        namespace: STUB_NAMESPACE,
      },
      () => ({
        contents: 'export default {};',
        loader: 'js',
      }),
    );
  },
};

/** The logs of a build that failed are printed. */
const buildExecutable = async (): Promise<boolean> => {
  const { values } = parseArgs({
    options: {
      outfile: {
        default: 'dist/cli/constitution',
        type: 'string',
      },
      target: {
        type: 'string',
      },
    },
  });

  const target = TARGETS.find((known) => known === values.target);

  if (values.target !== undefined && target === undefined) {
    throw new BuildError({
      code: BuildFailure.TargetUnknown,
      details: {
        given: values.target,
      },
    });
  }

  const fingerprint = pluginFingerprintOf(packageFolder);

  if (fingerprint === undefined) {
    throw new BuildError({
      code: BuildFailure.PluginUnreadable,
      details: {
        given: packageFolder,
      },
    });
  }

  const built = await Bun.build({
    compile: {
      autoloadBunfig: false,
      autoloadDotenv: false,
      outfile: values.outfile,
      ...(target === undefined
        ? {}
        : {
            target,
          }),
    },
    define: Object.fromEntries([
      [
        'CONSTITUTION_PLUGIN_FINGERPRINT',
        JSON.stringify(fingerprint),
      ],
      [
        'process.env.NODE_ENV',
        '"production"',
      ],
    ]),
    entrypoints: [
      entryFile,
    ],
    minify: true,
    plugins: [
      reactCompilerPlugin,
      devtoolsStubPlugin,
    ],
    target: 'bun',
    throw: false,
  });

  if (!built.success) {
    for (const log of built.logs) {
      writeError(`${String(log)}\n`);
    }
  }

  return built.success;
};

// A build Bun refuses, or a failure the build foresees, is one the user can act on; any other is
// the build's own defect.
try {
  process.exitCode = (await buildExecutable()) ? ExitCode.Success : ExitCode.Failure;
} catch (error) {
  writeError(`cli-build: ${messageOf(error)}\n`);
  process.exitCode = isBuildError(error) ? ExitCode.Failure : ExitCode.Defect;
}
