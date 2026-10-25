import { describe, expect, it } from 'bun:test';

import { ColourLevel, createTheme, StepStatus, ThemeMode, Tone } from '@droneey/design-cli';

import type { Report } from '#/shared/cli';
import { linesSection, noteSection, SectionKind, stepsSection } from '#/shared/cli';

import { createPlainRenderer } from '../plain-renderer';

const testTheme = createTheme({
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: ThemeMode.Dark,
});

const rendererOf = (): {
  renderer: ReturnType<typeof createPlainRenderer>;
  stderr: () => string;
  stdout: () => string;
} => {
  let stderr = '';
  let stdout = '';

  return {
    renderer: createPlainRenderer({
      io: {
        readInput: async (): Promise<string> => await Promise.resolve(''),
        write: (text: string): void => {
          stdout += text;
        },
        writeError: (text: string): void => {
          stderr += text;
        },
      },
      theme: testTheme,
    }),
    stderr: () => stderr,
    stdout: () => stdout,
  };
};

describe('createPlainRenderer: the result', () => {
  it('should write each section as plain text, a blank line apart', async () => {
    // Arrange
    const report: Report = [
      stepsSection([
        {
          label: 'Blocks',
          status: StepStatus.Done,
        },
      ]),
      linesSection([
        'a',
        '  b',
      ]),
      {
        kind: SectionKind.Pairs,
        pairs: [
          [
            'plugin',
            '1.0.0',
          ],
        ],
      },
      noteSection({
        lines: [
          'run mise install',
        ],
        title: 'What to do',
        tone: Tone.Info,
      }),
    ];

    const plain = rendererOf();

    // Act
    await plain.renderer.print(report);

    // Assert
    expect(plain.stdout().split('\n')).toStrictEqual([
      '✓ Blocks',
      '',
      'a',
      '  b',
      '',
      'plugin  1.0.0',
      '',
      'ℹ What to do',
      '  run mise install',
      '',
    ]);
  });
});

describe('createPlainRenderer', () => {
  it('should write a step to standard error once it ends, and give its result back', async () => {
    // Arrange
    const plain = rendererOf();

    // Act
    const returned = await plain.renderer.run({
      label: 'Blocks',
      outcomeOf: (found: number) => ({
        detail: `${String(found)} findings`,
        status: StepStatus.Failed,
      }),
      run: () => 2,
    });

    // Assert
    expect({
      returned,
      stderr: plain.stderr(),
      stdout: plain.stdout(),
    }).toStrictEqual({
      returned: 2,
      stderr: '✗ Blocks — 2 findings\n',
      stdout: '',
    });
  });

  it.each([
    {
      condition: 'the report holds a section',
      report: [
        linesSection([
          'biome.json for .',
        ]),
      ],
      stdout: 'biome.json for .\n',
    },
    {
      condition: 'the report is empty',
      report: [],
      stdout: '',
    },
  ])('should write the result to standard output when $condition', async ({ report, stdout }) => {
    // Arrange
    const plain = rendererOf();

    // Act
    await plain.renderer.print(report);

    // Assert
    expect(plain.stdout()).toBe(stdout);
  });
});
