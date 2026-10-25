import { PassThrough } from 'node:stream';

import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { linesSection } from '#/shared/cli';

import { createPresentation } from '../presentation';

const accentStyle = {
  color: {
    brand: {},
  },
};

interface Written {
  readonly stderr: string;
  readonly stdout: string;
}

const presentationOf = (input: {
  env?: Readonly<Record<string, string | undefined>>;
  flags?: {
    colour?: boolean;
    plain?: boolean;
  };
  isTerminal: boolean;
}): {
  asked: () => number;
  presentation: ReturnType<typeof createPresentation>;
  streams: {
    stderr: PassThrough;
    stdout: PassThrough;
  };
  written: () => Written;
} => {
  let asked = 0;
  let stderr = '';
  let stdout = '';
  const streams = {
    stderr: new PassThrough(),
    stdout: new PassThrough(),
  };

  return {
    asked: () => asked,
    presentation: createPresentation({
      accent: accentStyle,
      env: input.env ?? {},
      flags: () => {
        asked += 1;

        return input.flags ?? {};
      },
      io: {
        readInput: async (): Promise<string> => await Promise.resolve(''),
        write: (text: string): void => {
          stdout += text;
        },
        writeError: (text: string): void => {
          stderr += text;
        },
      },
      isTerminal: input.isTerminal,
      streams: {
        ...streams,
        stdin: new PassThrough(),
      },
    }),
    streams,
    written: () => ({
      stderr,
      stdout,
    }),
  };
};

const task = {
  label: 'Blocks',
  outcomeOf: () => ({
    status: StepStatus.Done,
  }),
  run: () => 'done',
};

describe('createPresentation', () => {
  it.each([
    {
      condition: 'the run is no terminal',
      flags: {},
      isTerminal: false,
    },
    {
      condition: 'the plain flag is given on a terminal',
      flags: {
        plain: true,
      },
      isTerminal: true,
    },
  ])(
    'should write plain text through the run streams when $condition',
    async ({ flags, isTerminal }) => {
      // Arrange
      const { presentation, written } = presentationOf({
        flags,
        isTerminal,
      });

      // Act
      await presentation.renderer.run(task);
      await presentation.renderer.print([
        linesSection([
          'a line',
        ]),
      ]);
      await presentation.close();

      // Assert
      expect(written()).toStrictEqual({
        stderr: '✓ Blocks\n',
        stdout: 'a line\n',
      });
    },
  );

  it('should choose the output once, however often it is asked', () => {
    // Arrange
    const { asked, presentation } = presentationOf({
      isTerminal: false,
    });

    // Act
    const themes = [
      presentation.theme(),
      presentation.theme(),
    ];

    // Assert
    expect({
      asked: asked(),
      isOne: themes[0] === themes[1],
    }).toStrictEqual({
      asked: 1,
      isOne: true,
    });
  });

  it('should paint in colour when a flag asks for it', () => {
    // Arrange
    const { presentation } = presentationOf({
      flags: {
        colour: true,
      },
      isTerminal: false,
    });

    // Act
    const painted = presentation.theme().strong('a');

    // Assert
    expect(painted).not.toBe('a');
  });

  it('should draw on the terminal streams, never through the plain writers, and end what it drew when it closes', async () => {
    // Arrange
    const { presentation, streams, written } = presentationOf({
      env: {
        // biome-ignore lint/style/useNamingConvention: the variable's name is the convention's
        NO_COLOR: '1',
      },
      isTerminal: true,
    });
    const drawn: string[] = [];

    streams.stderr.on('data', (chunk: Buffer) => {
      drawn.push(chunk.toString());
    });

    // Act
    const returned = await presentation.renderer.run(task);

    await presentation.close();

    // Assert
    expect({
      drawn,
      returned,
      written: written(),
    }).toStrictEqual({
      drawn: [
        '✓ Blocks\n',
        '\n',
      ],
      returned: 'done',
      written: {
        stderr: '',
        stdout: '',
      },
    });
  });

  it('should close without drawing when nothing was rendered', async () => {
    // Arrange
    const { presentation, written } = presentationOf({
      isTerminal: true,
    });

    // Act
    await presentation.close();

    // Assert
    expect(written()).toStrictEqual({
      stderr: '',
      stdout: '',
    });
  });
});
