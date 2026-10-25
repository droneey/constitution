import { describe, expect, it } from 'bun:test';

import { ColourLevel, OutputMode, StepStatus, ThemeMode, Tone } from '@droneey/design-cli';
import { ThemeProvider } from '@droneey/design-cli/ink';
import { render } from 'ink-testing-library';

import { noteSection, pairsSection, stepsSection } from '#/shared/cli';

import { SectionView } from '../section-view';
import type { DrawnSection } from '../section-view.types';

const outputStream = {
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: OutputMode.Pretty,
  themeMode: ThemeMode.Dark,
};

describe('SectionView', () => {
  it.each<{
    condition: string;
    frame: string[];
    section: DrawnSection;
  }>([
    {
      condition: 'steps',
      frame: [
        '✓ Blocks — every block is sound',
        '',
      ],
      section: stepsSection([
        {
          detail: 'every block is sound',
          label: 'Blocks',
          status: StepStatus.Done,
        },
      ]),
    },
    {
      condition: 'pairs',
      frame: [
        'plugin  0.81.0',
      ],
      section: pairsSection([
        [
          'plugin',
          '0.81.0',
        ],
      ]),
    },
    {
      condition: 'a note',
      frame: [
        '╭──────────────────╮',
        '│ ℹ What to do     │',
        '│ run mise install │',
        '╰──────────────────╯',
      ],
      section: noteSection({
        lines: [
          'run mise install',
        ],
        title: 'What to do',
        tone: Tone.Info,
      }),
    },
  ])('should draw $condition as the design system draws them', ({ frame, section }) => {
    // Arrange
    const tree = (
      <ThemeProvider output={outputStream}>
        <SectionView section={section} />
      </ThemeProvider>
    );

    // Act
    const { lastFrame } = render(tree);

    // Assert
    expect(lastFrame()?.split('\n')).toStrictEqual(frame);
  });
});
