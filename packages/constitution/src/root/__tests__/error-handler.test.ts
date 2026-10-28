import { describe, expect, it } from 'bun:test';

import { ColourLevel, createTheme, ThemeMode } from '@droneey/design-cli';
import { CommanderError } from 'commander';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { TreeError, TreeFailure } from '#/features/blocks';
import { ApplyError, ApplyFailure } from '#/features/presets';
import {
  ReleaseError,
  ReleaseFailure,
  UnreadableFileError,
  UnreadableFileFailure,
} from '#/features/project';
import { AbsolutePath } from '#/kernel/value-objects';
import { ExitCode, outputFlagsOf } from '#/shared/cli';

import { clockOf } from '../configuration';
import { createErrorHandler } from '../error-handler';

const testTheme = createTheme({
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: ThemeMode.Dark,
});

const handlerOf = (input: {
  isHook: boolean;
}): {
  errors: ReturnType<typeof createErrorHandler>;
  written: () => string;
} => {
  let written = '';

  return {
    errors: createErrorHandler({
      isHook: () => input.isHook,
      theme: () => testTheme,
      writeError: (text: string): void => {
        written += text;
      },
    }),
    written: () => written,
  };
};

const malformedDayFailure = ((): unknown => {
  try {
    return clockOf('2026-6-15').today();
  } catch (error) {
    return error;
  }
})();

const unparsedOptionsFailure = ((): unknown => {
  try {
    return outputFlagsOf({
      plain: 'yes',
    });
  } catch (error) {
    return error;
  }
})();

const failures: readonly {
  readonly failure: unknown;
  readonly name: string;
}[] = [
  {
    failure: new UnreadableFileError({
      code: UnreadableFileFailure.Config,
      details: {
        path: AbsolutePath.create('/work/constitution.yaml'),
      },
    }),
    name: 'constitution.yaml unreadable',
  },
  {
    failure: new ReleaseError({
      code: ReleaseFailure.BlocksUnlisted,
      details: {
        path: AbsolutePath.create('/work/.droneey/constitution'),
      },
    }),
    name: 'blocks unlisted',
  },
  {
    failure: new UnreadableFileError({
      code: UnreadableFileFailure.Core,
      details: {
        path: AbsolutePath.create('/work/.droneey/constitution/blocks/core/core.md'),
      },
    }),
    name: 'core unreadable',
  },
  {
    failure: new TreeError({
      code: TreeFailure.Failed,
      details: {
        path: AbsolutePath.create('/work/constitution'),
      },
    }),
    name: 'tree failed',
  },
  {
    failure: new TreeError({
      code: TreeFailure.TimedOut,
      details: {
        path: AbsolutePath.create('/work/constitution'),
      },
    }),
    name: 'tree timed out',
  },
  {
    failure: new TreeError({
      code: TreeFailure.Unreadable,
      details: {
        path: AbsolutePath.create('/work/constitution/blocks/core/core.md'),
      },
    }),
    name: 'tree file unreadable',
  },
  {
    failure: new TreeError({
      code: TreeFailure.TooLarge,
      details: {
        path: AbsolutePath.create('/work/constitution'),
      },
    }),
    name: 'tree too large',
  },
  {
    failure: new ApplyError({
      code: ApplyFailure.NotWritten,
      details: {
        filePath: AbsolutePath.create('/work/project/biome.json'),
      },
    }),
    name: 'apply not written',
  },
  {
    failure: malformedDayFailure,
    name: 'day malformed',
  },
  {
    failure: unparsedOptionsFailure,
    name: 'options unparsed',
  },
  {
    failure: new TypeError('undefined is not an object'),
    name: 'an error of its own',
  },
];

const usages: readonly {
  readonly name: string;
  readonly said: string;
}[] = [
  {
    name: 'usage with the prefix of commander',
    said: "error: unknown command 'chek'\n(Did you mean check?)\n",
  },
  {
    name: 'usage with no prefix of commander',
    said: 'too many arguments; error: see help',
  },
];

const failureWrittenOf = (failure: unknown): string => {
  const hook = handlerOf({
    isHook: true,
  });
  const person = handlerOf({
    isHook: false,
  });

  hook.errors.codeOf(failure);
  person.errors.codeOf(failure);

  return `${hook.written()}${person.written()}`;
};

const usageWrittenOf = (said: string): string => {
  const handler = handlerOf({
    isHook: false,
  });

  handler.errors.writeUsage(said);

  return handler.written();
};

const goldenText = (): string =>
  goldenOf(
    Object.fromEntries([
      ...failures.map(({ failure, name }) => [
        name,
        failureWrittenOf(failure),
      ]),
      ...usages.map(({ name, said }) => [
        name,
        usageWrittenOf(said),
      ]),
    ]),
  );

describe('createErrorHandler', () => {
  it('should word each failure as the golden file shows, a hook in one line and a person in a block', async () => {
    // Act
    const written = goldenText();

    // Assert
    expect(written).toBe(
      await goldenFileText(new URL('error-handler.golden.txt', import.meta.url), written),
    );
  });

  it.each([
    {
      code: ExitCode.Failure,
      condition: 'a project cannot be read',
      failure: new UnreadableFileError({
        code: UnreadableFileFailure.Config,
        details: {
          path: AbsolutePath.create('/work/constitution.yaml'),
        },
      }),
    },
    {
      code: ExitCode.Failure,
      condition: 'a tree cannot be listed',
      failure: new TreeError({
        code: TreeFailure.Failed,
        details: {
          path: AbsolutePath.create('/work/constitution'),
        },
      }),
    },
    {
      code: ExitCode.Failure,
      condition: 'an apply cannot write',
      failure: new ApplyError({
        code: ApplyFailure.NotWritten,
        details: {
          filePath: AbsolutePath.create('/work/project/biome.json'),
        },
      }),
    },
    {
      code: ExitCode.Usage,
      condition: 'a setting of the environment is malformed',
      failure: malformedDayFailure,
    },
    {
      code: ExitCode.Usage,
      condition: 'the options do not parse',
      failure: unparsedOptionsFailure,
    },
    {
      code: ExitCode.Defect,
      condition: 'the run throws an error of its own',
      failure: new TypeError('undefined is not an object'),
    },
  ])('should end with $code when $condition', ({ code, failure }) => {
    // Arrange
    const handler = handlerOf({
      isHook: true,
    });

    // Act
    const ended = handler.errors.codeOf(failure);

    // Assert
    expect(ended).toBe(code);
  });

  it.each([
    {
      code: ExitCode.Success,
      condition: 'help or the version was asked for',
      exitCode: 0,
    },
    {
      code: ExitCode.Usage,
      condition: 'the command line was typed wrong',
      exitCode: 1,
    },
  ])('should end with $code, writing nothing more, when $condition', ({ code, exitCode }) => {
    // Arrange
    const handler = handlerOf({
      isHook: false,
    });

    // Act
    const ended = handler.errors.codeOf(
      new CommanderError(exitCode, 'commander.unknownCommand', 'unknown'),
    );

    // Assert
    expect({
      code: ended,
      written: handler.written(),
    }).toStrictEqual({
      code,
      written: '',
    });
  });
});
