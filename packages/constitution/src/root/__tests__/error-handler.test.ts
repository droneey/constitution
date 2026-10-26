import { describe, expect, it } from 'bun:test';

import { ColourLevel, createTheme, ThemeMode } from '@droneey/design-cli';
import { CommanderError } from 'commander';

import { TreeError, TreeFailure } from '#/features/blocks';
import { ApplyError, ApplyFailure } from '#/features/presets';
import { ProjectError, ProjectFailure } from '#/kernel/errors';
import { ExitCode, outputFlagsOf } from '#/shared/cli';

import { clockOf } from '../configuration';
import { createErrorHandler } from '../error-handler';

const testTheme = createTheme({
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: ThemeMode.Dark,
});

// The handler of a run of a hook, or of a person's command, that keeps what it writes.
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

// What the root's clock throws when the environment fixes a day written otherwise than YYYY-MM-DD.
const malformedDayFailure = ((): unknown => {
  try {
    return clockOf('2026-6-15').today();
  } catch (error) {
    return error;
  }
})();

// What the output flags throw when an option does not parse.
const unparsedOptionsFailure = ((): unknown => {
  try {
    return outputFlagsOf({
      plain: 'yes',
    });
  } catch (error) {
    return error;
  }
})();

describe('createErrorHandler', () => {
  it.each([
    {
      condition: 'the distribution is missing',
      failure: {
        code: ProjectFailure.ReleaseMissing,
        details: {
          path: '.droneey/constitution',
        },
      },
      line: 'constitution hook: .droneey/constitution does not exist — run mise install\n',
    },
    {
      condition: 'the blocks cannot be listed',
      failure: {
        code: ProjectFailure.BlocksUnlisted,
        details: {
          path: '/distribution/blocks',
        },
      },
      line: 'constitution hook: cannot list the blocks of /distribution/blocks\n',
    },
    {
      condition: 'constitution.yaml does not parse at a line',
      failure: {
        code: ProjectFailure.ConfigUnparsed,
        details: {
          line: 12,
          path: 'constitution.yaml',
        },
      },
      line: 'constitution hook: constitution.yaml does not parse at line 12\n',
    },
    {
      condition: 'constitution.yaml does not parse at no known line',
      failure: {
        code: ProjectFailure.ConfigUnparsed,
        details: {
          path: 'constitution.yaml',
        },
      },
      line: 'constitution hook: constitution.yaml does not parse\n',
    },
    {
      condition: 'constitution.yaml cannot be read',
      failure: {
        code: ProjectFailure.ConfigUnreadable,
        details: {
          path: '/work/constitution.yaml',
        },
      },
      line: 'constitution hook: cannot read /work/constitution.yaml\n',
    },
    {
      condition: 'the core cannot be read',
      failure: {
        code: ProjectFailure.CoreUnreadable,
        details: {
          path: '/distribution/blocks/core/core.md',
        },
      },
      line: 'constitution hook: cannot build the digest\n',
    },
    {
      condition: 'the manifest cannot be read',
      failure: {
        code: ProjectFailure.ManifestUnreadable,
        details: {
          path: '/distribution/package.json',
        },
      },
      line: 'constitution hook: cannot read /distribution/package.json\n',
    },
    {
      condition: 'no project is found',
      failure: {
        code: ProjectFailure.NoProject,
        details: {
          path: '/work',
        },
      },
      line: 'constitution hook: no constitution.yaml in this folder or above it\n',
    },
    {
      condition: 'the manifest has no version',
      failure: {
        code: ProjectFailure.VersionMissing,
        details: {
          path: '/distribution/package.json',
        },
      },
      line: 'constitution hook: /distribution/package.json has no version\n',
    },
  ])(
    'should write its one line and end with the failure code when a hook fails as $condition',
    ({ failure, line }) => {
      // Arrange
      const handler = handlerOf({
        isHook: true,
      });

      // Act
      const code = handler.errors.codeOf(new ProjectError(failure));

      // Assert
      expect({
        code,
        written: handler.written(),
      }).toStrictEqual({
        code: ExitCode.Failure,
        written: line,
      });
    },
  );

  it.each([
    {
      failure: ProjectFailure.NoProject,
      written:
        '✗ no constitution.yaml in this folder or above it\n  → run /constitution:ratify in a Claude Code session to write one\n',
    },
    {
      failure: ProjectFailure.ConfigUnparsed,
      written: '✗ constitution.yaml does not parse\n  → fix constitution.yaml at that line\n',
    },
    {
      failure: ProjectFailure.ConfigUnreadable,
      written: '✗ cannot read /work/constitution.yaml\n  → make constitution.yaml readable\n',
    },
    {
      failure: ProjectFailure.ReleaseMissing,
      written:
        '✗ /work/constitution.yaml does not exist — run mise install\n  → run constitution doctor, which says what is wrong with the installation\n',
    },
    {
      failure: ProjectFailure.BlocksUnlisted,
      written:
        '✗ cannot list the blocks of /work/constitution.yaml\n  → run constitution doctor, which says what is wrong with the installation\n',
    },
    {
      failure: ProjectFailure.CoreUnreadable,
      written:
        '✗ cannot build the digest\n  → run constitution doctor, which says what is wrong with the installation\n',
    },
    {
      failure: ProjectFailure.ManifestUnreadable,
      written:
        '✗ cannot read /work/constitution.yaml\n  → run constitution doctor, which says what is wrong with the installation\n',
    },
    {
      failure: ProjectFailure.VersionMissing,
      written:
        '✗ /work/constitution.yaml has no version\n  → run constitution doctor, which says what is wrong with the installation\n',
    },
  ])(
    'should write the failure block, and end with the failure code, when a command fails as $failure',
    ({ failure, written }) => {
      // Arrange
      const handler = handlerOf({
        isHook: false,
      });

      // Act
      const code = handler.errors.codeOf(
        new ProjectError({
          code: failure,
          details: {
            path: '/work/constitution.yaml',
          },
        }),
      );

      // Assert
      expect({
        code,
        written: handler.written(),
      }).toStrictEqual({
        code: ExitCode.Failure,
        written,
      });
    },
  );

  it.each([
    {
      code: TreeFailure.TimedOut,
      written:
        '✗ git did not list the files of /work/constitution in time\n  → run git status there, which says what git cannot read\n',
    },
    {
      code: TreeFailure.Failed,
      written:
        '✗ git could not list the files of /work/constitution\n  → run git status there, which says what git cannot read\n',
    },
    {
      code: TreeFailure.TooLarge,
      written:
        '✗ the blocks of /work/constitution hold more files than a release does\n  → run constitution doctor, which says what is wrong with the installation\n',
    },
  ])(
    'should name the folder whose files could not be listed, and end with the failure code, when it is $code',
    ({ code, written }) => {
      // Arrange
      const handler = handlerOf({
        isHook: false,
      });

      // Act
      const exit = handler.errors.codeOf(
        new TreeError({
          code,
          details: {
            path: '/work/constitution',
          },
        }),
      );

      // Assert
      expect({
        exit,
        written: handler.written(),
      }).toStrictEqual({
        exit: ExitCode.Failure,
        written,
      });
    },
  );

  it('should name the file it could not read, with what to do, and end with the failure code, when a listed file is unreadable', () => {
    // Arrange
    const handler = handlerOf({
      isHook: false,
    });

    // Act
    const exit = handler.errors.codeOf(
      new TreeError({
        code: TreeFailure.Unreadable,
        details: {
          path: '/work/constitution/blocks/core/core.md',
        },
      }),
    );

    // Assert
    expect({
      exit,
      written: handler.written(),
    }).toStrictEqual({
      exit: ExitCode.Failure,
      written:
        '✗ cannot read /work/constitution/blocks/core/core.md\n  → make the file readable, or remove it from the tree\n',
    });
  });

  it('should name the file an apply could not write, with what to do, and end with the failure code', () => {
    // Arrange
    const handler = handlerOf({
      isHook: false,
    });

    // Act
    const exit = handler.errors.codeOf(
      new ApplyError({
        code: ApplyFailure.NotWritten,
        details: {
          path: '/work/project/biome.json',
        },
      }),
    );

    // Assert
    expect({
      exit,
      written: handler.written(),
    }).toStrictEqual({
      exit: ExitCode.Failure,
      written:
        '✗ cannot write /work/project/biome.json, so the apply wrote nothing\n  → make the file writable, then run constitution presets apply again\n',
    });
  });

  it.each([
    {
      isHook: true,
      written:
        'constitution hook: CONSTITUTION_TODAY is "2026-6-15", which is no date written YYYY-MM-DD\n',
    },
    {
      isHook: false,
      written:
        '✗ CONSTITUTION_TODAY is "2026-6-15", which is no date written YYYY-MM-DD\n  → unset CONSTITUTION_TODAY, which only the program\'s specs set\n',
    },
  ])(
    'should say which setting it cannot take and end with the usage code when the hook is $isHook',
    ({ isHook, written }) => {
      // Arrange
      const handler = handlerOf({
        isHook,
      });

      // Act
      const exit = handler.errors.codeOf(malformedDayFailure);

      // Assert
      expect({
        exit,
        written: handler.written(),
      }).toStrictEqual({
        exit: ExitCode.Usage,
        written,
      });
    },
  );

  it.each([
    {
      condition: 'a hook',
      isHook: true,
      written:
        'constitution hook: the run stopped on an error of its own; report it at https://github.com/droneey/constitution/issues\n',
    },
    {
      condition: 'a command',
      isHook: false,
      written:
        '✗ the run stopped on an error of its own\n  → report it at https://github.com/droneey/constitution/issues\n',
    },
  ])(
    'should ask for a report and end with the defect code when $condition throws an error of its own',
    ({ isHook, written }) => {
      // Arrange
      const handler = handlerOf({
        isHook,
      });

      // Act
      const code = handler.errors.codeOf(new TypeError('undefined is not an object'));

      // Assert
      expect({
        code,
        written: handler.written(),
      }).toStrictEqual({
        code: ExitCode.Defect,
        written,
      });
    },
  );

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

  it.each([
    {
      condition: 'a command',
      isHook: false,
      written:
        '✗ the options do not parse\n  plain: Invalid input: expected boolean, received string\n',
    },
    {
      condition: 'a hook',
      isHook: true,
      written: 'constitution hook: the options do not parse\n',
    },
  ])(
    'should end with the usage code, what does not parse said, when the options of $condition do not parse',
    ({ isHook, written }) => {
      // Arrange
      const handler = handlerOf({
        isHook,
      });

      // Act
      const code = handler.errors.codeOf(unparsedOptionsFailure);

      // Assert
      expect({
        code,
        written: handler.written(),
      }).toStrictEqual({
        code: ExitCode.Usage,
        written,
      });
    },
  );

  it.each([
    {
      condition: 'its message opens with the prefix of commander',
      said: "error: unknown command 'chek'\n(Did you mean check?)\n",
      written: "✗ unknown command 'chek'\n  (Did you mean check?)\n",
    },
    {
      condition: 'its message opens with no prefix of commander',
      said: 'too many arguments; error: see help',
      written: '✗ too many arguments; error: see help\n',
    },
  ])(
    'should write what commander says of a command line typed wrong as a failure block when $condition',
    ({ said, written }) => {
      // Arrange
      const handler = handlerOf({
        isHook: false,
      });

      // Act
      handler.errors.writeUsage(said);

      // Assert
      expect(handler.written()).toBe(written);
    },
  );
});
