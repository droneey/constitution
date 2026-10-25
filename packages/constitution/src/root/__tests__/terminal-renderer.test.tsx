import { PassThrough } from 'node:stream';

import { describe, expect, it } from 'bun:test';

import { ColourLevel, OutputMode, StepStatus, ThemeMode, Tone } from '@droneey/design-cli';

import { linesSection, noteSection, pairsSection } from '#/shared/cli';

import { createTerminalRenderer } from '../terminal-renderer';

const outputStream = {
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: OutputMode.Pretty,
  themeMode: ThemeMode.Dark,
};

// What the renderer writes to each stream, chunk by chunk, what it writes through the program's
// writer among them; the specs run in CI, where Ink writes a tree's settled lines and its last frame
// alone.
const terminalOf = (): {
  drawn: {
    stderr: string[];
    stdout: string[];
  };
  renderer: ReturnType<typeof createTerminalRenderer>;
} => {
  const drawn: {
    stderr: string[];
    stdout: string[];
  } = {
    stderr: [],
    stdout: [],
  };
  const streams = {
    stderr: new PassThrough(),
    stdin: new PassThrough(),
    stdout: new PassThrough(),
  };

  streams.stderr.on('data', (chunk: Buffer) => {
    drawn.stderr.push(chunk.toString());
  });
  streams.stdout.on('data', (chunk: Buffer) => {
    drawn.stdout.push(chunk.toString());
  });

  return {
    drawn,
    renderer: createTerminalRenderer({
      accent: {
        color: {
          brand: {},
        },
      },
      output: outputStream,
      streams,
      write: (text: string): void => {
        drawn.stdout.push(text);
      },
    }),
  };
};

describe('createTerminalRenderer', () => {
  it('should draw each step on standard error, keep the work’s result, and close the steps before the result', async () => {
    // Arrange
    const { drawn, renderer } = terminalOf();

    // Act
    const returned = await renderer.run({
      label: 'Blocks',
      outcomeOf: (found: number) => ({
        detail: `${String(found)} findings`,
        status: StepStatus.Failed,
      }),
      run: () => 2,
    });

    await renderer.run({
      label: 'Presets',
      outcomeOf: () => ({
        status: StepStatus.Warned,
      }),
      run: async () => {
        await Promise.resolve();
      },
    });
    await renderer.print([]);

    // Assert
    expect({
      drawn,
      returned,
    }).toStrictEqual({
      drawn: {
        stderr: [
          '✗ Blocks — 2 findings\n',
          '⚠ Presets\n',
          '\n',
        ],
        stdout: [],
      },
      returned: 2,
    });
  });

  it('should print lines of data as they are and draw the other sections, in order, a line apart', async () => {
    // Arrange
    const { drawn, renderer } = terminalOf();
    const long = `  biome ${'x'.repeat(200)}`;

    // Act
    await renderer.print([
      linesSection([
        long,
        'next',
      ]),
      noteSection({
        lines: [],
        title: 'Advice',
        tone: Tone.Info,
      }),
      pairsSection([
        [
          'plugin',
          '1.0.0',
        ],
      ]),
    ]);

    // Assert
    expect(drawn.stdout.join('').split('\n')).toStrictEqual([
      long,
      'next',
      '',
      '╭──────────╮',
      '│ ℹ Advice │',
      '╰──────────╯',
      '',
      'plugin  1.0.0',
      '',
    ]);
  });

  it('should end the steps it drew when it closes', async () => {
    // Arrange
    const { drawn, renderer } = terminalOf();

    await renderer.run({
      label: 'Blocks',
      outcomeOf: () => ({
        status: StepStatus.Done,
      }),
      run: () => undefined,
    });

    // Act
    await renderer.close();
    await renderer.close();

    // Assert
    expect(drawn.stderr).toStrictEqual([
      '✓ Blocks\n',
      '\n',
    ]);
  });
});
