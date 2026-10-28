import { PassThrough } from 'node:stream';

import { describe, expect, it } from 'bun:test';

import {
  AccentScale,
  ColourLevel,
  OutputMode,
  StepStatus,
  ThemeMode,
  Tone,
} from '@droneey/design-cli';
import { ThemeProvider } from '@droneey/design-cli/ink';
import { render } from 'ink-testing-library';

import type { Section } from '#/shared/cli';
import { linesSection, noteSection, SectionKind } from '#/shared/cli';
import { SectionView } from '#/shared/ui';

import { createTerminalRenderer } from '../terminal-renderer';

const outputStream = {
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: OutputMode.Pretty,
  themeMode: ThemeMode.Dark,
};

// Why: the specs run in CI, where Ink writes a tree's settled lines and its last frame alone.
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
      accent: AccentScale.create({
        color: {
          brand: {},
        },
      }),
      output: outputStream,
      streams,
      write: (text: string): void => {
        drawn.stdout.push(text);
      },
    }),
  };
};

const frameOf = (
  section: Exclude<
    Section,
    {
      readonly kind: SectionKind.Lines;
    }
  >,
): string =>
  render(
    <ThemeProvider output={outputStream}>
      <SectionView section={section} />
    </ThemeProvider>,
  ).lastFrame() ?? '';

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

    // Assert
    expect(returned).toBe(2);

    // Act
    await renderer.run({
      label: 'Presets',
      outcomeOf: () => ({
        status: StepStatus.Warned,
      }),
      run: async () => {
        await Promise.resolve();
      },
    });

    // Assert
    expect(drawn.stdout).toStrictEqual([]);

    // Act
    await renderer.print([]);

    // Assert
    expect(drawn).toStrictEqual({
      stderr: [
        '✗ Blocks — 2 findings\n',
        '⚠ Presets\n',
        '\n',
      ],
      stdout: [],
    });
  });

  it('should print lines of data as they are and draw the other sections, in order, a line apart', async () => {
    // Arrange
    const { drawn, renderer } = terminalOf();
    const long = `  biome ${'x'.repeat(200)}`;
    const note = noteSection({
      lines: [],
      title: 'Advice',
      tone: Tone.Info,
    });
    const pairs = {
      kind: SectionKind.Pairs,
      pairs: [
        [
          'plugin',
          '1.0.0',
        ],
      ],
    } as const;

    // Act
    await renderer.print([
      linesSection([
        long,
        'next',
      ]),
      note,
      pairs,
    ]);

    // Assert
    expect(drawn.stdout.join('')).toBe(`${long}\nnext\n\n${frameOf(note)}\n\n${frameOf(pairs)}\n`);
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
