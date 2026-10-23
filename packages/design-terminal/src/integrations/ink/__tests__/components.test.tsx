import { describe, expect, it } from 'bun:test';

import { render } from 'ink-testing-library';

import { ColourLevel, ColumnAlign, StepStatus, Tone } from '#/libs/ui';

import {
  FailureBlock,
  Heading,
  KeyValueList,
  Note,
  ProgressBar,
  Spinner,
  Step,
  Table,
  TaskList,
} from '../components';
import {
  createPlainOutput,
  frameOnceShown,
  renderWithTheme,
  screenReaderOutputOf,
} from './ink.fixtures';

describe('Heading', () => {
  it('should draw the title', () => {
    // Arrange
    const tree = <Heading title='Checks' />;

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe('Checks');
  });
});

describe('Step', () => {
  it('should draw the symbol, the label and the detail of a settled step', () => {
    // Arrange
    const step = {
      detail: '3 files',
      label: 'format',
      status: StepStatus.Done,
    };

    // Act
    const { lastFrame } = renderWithTheme(<Step step={step} />);

    // Assert
    expect(lastFrame()).toBe('✓ format — 3 files');
  });

  it("should draw the spinner's first frame while a step runs and the theme moves", () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const { lastFrame, unmount } = renderWithTheme(
      <Step step={step} />,
      createPlainOutput({
        isMotionReduced: false,
      }),
    );

    // Assert
    expect(lastFrame()).toBe('⠋ test');
    unmount();
  });

  it("should draw the step's symbol while a step runs and the theme holds still", () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const { lastFrame } = renderWithTheme(<Step step={step} />);

    // Assert
    expect(lastFrame()).toBe('▸ test');
  });

  it("should keep a settled step's symbol while the theme moves", () => {
    // Arrange
    const step = {
      label: 'lint',
      status: StepStatus.Done,
    };

    // Act
    const { lastFrame } = renderWithTheme(
      <Step step={step} />,
      createPlainOutput({
        isMotionReduced: false,
      }),
    );

    // Assert
    expect(lastFrame()).toBe('✓ lint');
  });

  it('should draw plain and still when no provider gives it a theme', () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const { lastFrame } = render(<Step step={step} />);

    // Assert
    expect(lastFrame()).toBe('▸ test');
  });

  it('should read out a settled step as done, not busy', () => {
    // Arrange
    const step = {
      label: 'lint',
      status: StepStatus.Done,
    };

    // Act
    const spoken = screenReaderOutputOf(<Step step={step} />);

    // Assert
    expect(spoken).toBe('listitem: done lint');
  });

  it('should read out the status of a running step and that it is busy', () => {
    // Arrange
    const step = {
      label: 'test',
      status: StepStatus.Running,
    };

    // Act
    const spoken = screenReaderOutputOf(<Step step={step} />);

    // Assert
    expect(spoken).toBe('listitem: (busy) running test');
  });
});

describe('TaskList', () => {
  it('should draw the settled steps once above the steps still to settle', () => {
    // Arrange
    const steps = [
      {
        label: 'test',
        status: StepStatus.Pending,
      },
      {
        label: 'lint',
        status: StepStatus.Failed,
      },
    ];

    // Act
    const { frames } = renderWithTheme(<TaskList steps={steps} />);

    // Assert
    expect(frames[0]).toBe('✗ lint\n• test');
  });

  it('should read out a list of its steps', () => {
    // Arrange
    const steps = [
      {
        label: 'lint',
        status: StepStatus.Running,
      },
    ];

    // Act
    const spoken = screenReaderOutputOf(<TaskList steps={steps} />);

    // Assert
    expect(spoken).toBe('list: listitem: (busy) running lint');
  });
});

describe('Spinner', () => {
  it("should draw the step's symbol and the work going on when the theme holds still", () => {
    // Arrange
    const tree = <Spinner label='Reading the blocks' />;

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe('▸ Reading the blocks…');
  });

  it('should read out the work going on without the spinner', () => {
    // Arrange
    const tree = <Spinner label='Reading the blocks' />;

    // Act
    const spoken = screenReaderOutputOf(tree);

    // Assert
    expect(spoken).toBe('timer: (busy) Reading the blocks…');
  });
});

describe('the spinner', () => {
  it('should move to its next frame at the pace of the theme while the theme moves', async () => {
    // Arrange
    const output = createPlainOutput({
      isMotionReduced: false,
    });

    // Act
    const { lastFrame, unmount } = renderWithTheme(<Spinner label='Reading' />, output);
    const moved = await frameOnceShown(lastFrame, '⠙ Reading…');

    // Assert
    expect(moved).toBe('⠙ Reading…');
    unmount();
  });
});

describe('ProgressBar', () => {
  it('should draw the bar of the share, the count and the percentage', () => {
    // Arrange
    const progress = {
      done: 1,
      label: 'Files',
      total: 4,
    };

    // Act
    const { lastFrame } = renderWithTheme(<ProgressBar progress={progress} />);

    // Assert
    expect(lastFrame()).toBe('Files █████░░░░░░░░░░░░░░░ 1/4 (25%)');
  });

  it('should read out the count without the bar', () => {
    // Arrange
    const progress = {
      done: 1,
      label: 'Files',
      total: 4,
    };

    // Act
    const spoken = screenReaderOutputOf(<ProgressBar progress={progress} />);

    // Assert
    expect(spoken).toBe('progressbar: Files 1/4 (25%)');
  });
});

describe('Note', () => {
  it('should draw a box with the tone, the title and the lines', () => {
    // Arrange
    const note = {
      lines: [
        'one',
      ],
      title: 'Heads up',
      tone: Tone.Warning,
    };

    // Act
    const { lastFrame } = renderWithTheme(<Note note={note} />);

    // Assert
    expect(lastFrame()?.split('\n')).toStrictEqual([
      `╭${'─'.repeat(98)}╮`,
      `│ ⚠ Heads up${' '.repeat(87)}│`,
      `│ one${' '.repeat(94)}│`,
      `╰${'─'.repeat(98)}╯`,
    ]);
  });
});

describe('FailureBlock', () => {
  it('should draw what happened, what is known and what to do next', () => {
    // Arrange
    const failure = {
      details: [
        'no constitution.yaml',
      ],
      hint: 'run constitution init',
      title: 'No project here',
    };

    // Act
    const { lastFrame } = renderWithTheme(<FailureBlock failure={failure} />);

    // Assert
    expect(lastFrame()).toBe(
      '✗ No project here\n  no constitution.yaml\n  → run constitution init',
    );
  });

  it('should leave the next step out when the failure names none', () => {
    // Arrange
    const failure = {
      details: [],
      title: 'Interrupted',
    };

    // Act
    const { lastFrame } = renderWithTheme(<FailureBlock failure={failure} />);

    // Assert
    expect(lastFrame()).toBe('✗ Interrupted');
  });
});

describe('Table', () => {
  it('should line up each column, a column of numbers to the end', () => {
    // Arrange
    const table = {
      columns: [
        {
          key: 'block',
          title: 'Block',
        },
        {
          align: ColumnAlign.End,
          key: 'rules',
          title: 'Rules',
        },
      ],
      rows: [
        {
          block: 'typescript',
          rules: '42',
        },
        {
          block: 'ink',
        },
      ],
    };

    // Act
    const { lastFrame } = renderWithTheme(<Table table={table} />);

    // Assert
    expect(lastFrame()?.split('\n')).toStrictEqual([
      'Block       Rules',
      'typescript     42',
      'ink',
    ]);
  });
});

describe('KeyValueList', () => {
  it('should line up the values after the widest key', () => {
    // Arrange
    const pairs = [
      [
        'version',
        '0.80.0',
      ],
      [
        'blocks',
        '18',
      ],
    ] as const;

    // Act
    const { lastFrame } = renderWithTheme(<KeyValueList pairs={pairs} />);

    // Assert
    expect(lastFrame()).toBe('version  0.80.0\nblocks   18');
  });

  it("should draw the keys in the muted tone's colour when the run shows colour", () => {
    // Arrange
    const output = createPlainOutput({
      colourLevel: ColourLevel.Basic,
    });

    // Act
    const { lastFrame } = renderWithTheme(
      <KeyValueList
        pairs={[
          [
            'version',
            '1',
          ],
        ]}
      />,
      output,
    );

    // Assert
    expect(lastFrame()).toBe('\u001B[37mversion\u001B[39m  1');
  });
});
