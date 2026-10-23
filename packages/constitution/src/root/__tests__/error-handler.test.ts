import { describe, expect, it } from 'bun:test';

import { ProjectError, ProjectFailure } from '#/features/constitution';

import { createErrorHandler } from '../error-handler';
import type { ExitCode } from '../exit-codes';

const PREFIX = 'constitution hook';

// The handler over a run that keeps every exit code and every line written to standard error.
const handlerOf = (): {
  codes: ExitCode[];
  errors: ReturnType<typeof createErrorHandler>;
  lines: string[];
} => {
  const codes: ExitCode[] = [];
  const lines: string[] = [];

  return {
    codes,
    errors: createErrorHandler({
      setExitCode: (code: ExitCode): void => {
        codes.push(code);
      },
      writeError: (text: string): void => {
        lines.push(text);
      },
    }),
    lines,
  };
};

describe('createErrorHandler', () => {
  it.each([
    {
      condition: 'the archive is missing',
      failure: {
        code: ProjectFailure.ArchiveMissing,
        path: '.droneey/constitution',
      },
      line: 'constitution hook: .droneey/constitution does not exist — run mise install\n',
    },
    {
      condition: 'the blocks cannot be listed',
      failure: {
        code: ProjectFailure.BlocksUnlisted,
        path: '/archive/blocks',
      },
      line: 'constitution hook: cannot list the blocks of /archive/blocks\n',
    },
    {
      condition: 'constitution.yaml does not parse at a line',
      failure: {
        code: ProjectFailure.ConfigUnparsed,
        line: 12,
        path: 'constitution.yaml',
      },
      line: 'constitution hook: constitution.yaml does not parse at line 12\n',
    },
    {
      condition: 'constitution.yaml does not parse at no known line',
      failure: {
        code: ProjectFailure.ConfigUnparsed,
        path: 'constitution.yaml',
      },
      line: 'constitution hook: constitution.yaml does not parse at line 0\n',
    },
    {
      condition: 'constitution.yaml cannot be read',
      failure: {
        code: ProjectFailure.ConfigUnreadable,
        path: '/work/constitution.yaml',
      },
      line: 'constitution hook: cannot read /work/constitution.yaml\n',
    },
    {
      condition: 'the core cannot be read',
      failure: {
        code: ProjectFailure.CoreUnreadable,
        path: '/archive/blocks/core/core.md',
      },
      line: 'constitution hook: cannot build the digest\n',
    },
    {
      condition: 'the manifest cannot be read',
      failure: {
        code: ProjectFailure.ManifestUnreadable,
        path: '/archive/package.json',
      },
      line: 'constitution hook: cannot read /archive/package.json\n',
    },
    {
      condition: 'no project is found',
      failure: {
        code: ProjectFailure.NoProject,
        path: '/work',
      },
      line: 'constitution hook: no constitution.yaml in this folder or above it\n',
    },
    {
      condition: 'the manifest has no version',
      failure: {
        code: ProjectFailure.VersionMissing,
        path: '/archive/package.json',
      },
      line: 'constitution hook: /archive/package.json has no version\n',
    },
  ])(
    'should write its line and end with the failure code when $condition',
    async ({ failure, line }) => {
      // Arrange
      const handler = handlerOf();
      const work = (): void => {
        throw new ProjectError(failure);
      };

      // Act
      await handler.errors.run({
        prefix: PREFIX,
        work,
      });

      // Assert
      expect({
        codes: handler.codes,
        lines: handler.lines,
      }).toStrictEqual({
        codes: [
          1,
        ],
        lines: [
          line,
        ],
      });
    },
  );

  it.each([
    {
      condition: 'the work throws an error of its own',
      work: (): void => {
        throw new TypeError('undefined is not an object');
      },
    },
    {
      condition: 'the work rejects',
      work: async (): Promise<void> => {
        await Promise.reject(new RangeError('Maximum call stack size exceeded'));
      },
    },
  ])('should ask for a report and end with the defect code when $condition', async ({ work }) => {
    // Arrange
    const handler = handlerOf();

    // Act
    await handler.errors.run({
      prefix: 'constitution check',
      work,
    });

    // Assert
    expect({
      codes: handler.codes,
      lines: handler.lines,
    }).toStrictEqual({
      codes: [
        70,
      ],
      lines: [
        'constitution check: the run stopped on an error of its own; report it at https://github.com/droneey/constitution/issues\n',
      ],
    });
  });

  it('should write nothing, set no code and say the work started when the work succeeds', async () => {
    // Arrange
    const handler = handlerOf();
    const done: string[] = [];

    // Act
    await handler.errors.run({
      prefix: PREFIX,
      work: async (): Promise<void> => {
        await Promise.resolve();
        done.push('work');
      },
    });

    // Assert
    expect({
      codes: handler.codes,
      done,
      hasStarted: handler.errors.hasStarted(),
      lines: handler.lines,
    }).toStrictEqual({
      codes: [],
      done: [
        'work',
      ],
      hasStarted: true,
      lines: [],
    });
  });

  it('should say no work started when no command ran', () => {
    // Arrange
    const handler = handlerOf();

    // Act
    const hasStarted = handler.errors.hasStarted();

    // Assert
    expect(hasStarted).toBe(false);
  });
});
