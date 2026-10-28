import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';
import { ThemeProvider } from '@droneey/design-cli/ink';
import { render } from 'ink-testing-library';

import { noteSection, SectionKind, stepsSection } from '#/shared/cli';

import { SectionView } from '../section-view';
import { createPlainOutput, screenReaderOutputOf } from './section-view.fixtures';

describe('SectionView', () => {
  it.each<{
    condition: string;
    frame: string[];
    section: Parameters<typeof SectionView>[0]['section'];
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
      section: {
        kind: SectionKind.Pairs,
        pairs: [
          [
            'plugin',
            '0.81.0',
          ],
        ],
      },
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
      <ThemeProvider output={createPlainOutput()}>
        <SectionView section={section} />
      </ThemeProvider>
    );

    // Act
    const { lastFrame } = render(tree);

    // Assert
    expect(lastFrame()?.split('\n')).toStrictEqual(frame);
  });

  it.each([
    {
      spoken: 'list: listitem: pending Blocks',
      status: StepStatus.Pending,
    },
    {
      spoken: 'list: listitem: (busy) running Blocks',
      status: StepStatus.Running,
    },
    {
      spoken: 'listitem: done Blocks\nlist: ',
      status: StepStatus.Done,
    },
    {
      spoken: 'listitem: failed Blocks\nlist: ',
      status: StepStatus.Failed,
    },
    {
      spoken: 'listitem: warned Blocks\nlist: ',
      status: StepStatus.Warned,
    },
    {
      spoken: 'listitem: skipped Blocks\nlist: ',
      status: StepStatus.Skipped,
    },
  ])('should read out a step that is $status by its label', ({ spoken, status }) => {
    // Arrange
    const section = stepsSection([
      {
        label: 'Blocks',
        status,
      },
    ]);

    // Act
    const readOut = screenReaderOutputOf(<SectionView section={section} />);

    // Assert
    expect(readOut).toBe(spoken);
  });

  it.each([
    {
      spoken: 'accent Plan',
      tone: Tone.Accent,
    },
    {
      spoken: 'success Plan',
      tone: Tone.Success,
    },
    {
      spoken: 'error Plan',
      tone: Tone.Error,
    },
    {
      spoken: 'warning Plan',
      tone: Tone.Warning,
    },
    {
      spoken: 'info Plan',
      tone: Tone.Info,
    },
    {
      spoken: 'muted Plan',
      tone: Tone.Muted,
    },
  ])('should read out a note of the $tone tone by its label', ({ spoken, tone }) => {
    // Arrange
    const section = noteSection({
      lines: [],
      title: 'Plan',
      tone,
    });

    // Act
    const readOut = screenReaderOutputOf(<SectionView section={section} />);

    // Assert
    expect(readOut).toBe(spoken);
  });
});
