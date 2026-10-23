import { describe, expect, it } from 'bun:test';

import { ColourLevel, createTheme, ThemeMode, Tone } from '../../theme';
import { ColumnAlign, StepStatus } from '../text.constants';
import {
  formatFailure,
  formatHeading,
  formatKeyValues,
  formatNote,
  formatProgress,
  formatStep,
  formatTable,
  formatTaskList,
  formatWaiting,
} from '../text.utils';
import { createPlainTheme } from './text.fixtures';

describe('formatHeading', () => {
  it('should write the title as it is when the run shows no colour', () => {
    // Arrange
    const theme = createPlainTheme();

    // Act
    const heading = formatHeading(theme, 'Checks');

    // Assert
    expect(heading).toBe('Checks');
  });

  it('should write the title in bold accent when the run shows colour', () => {
    // Arrange
    const theme = createTheme({
      colourLevel: ColourLevel.Basic,
      isMotionReduced: false,
      mode: ThemeMode.Dark,
    });

    // Act
    const heading = formatHeading(theme, 'Checks');

    // Assert
    // biome-ignore lint/security/noSecrets: the escape codes of a terminal's colours, no secret
    expect(heading).toBe('\u001B[1m\u001B[97mChecks\u001B[39m\u001B[22m');
  });
});

describe('formatStep', () => {
  it.each([
    {
      status: StepStatus.Pending,
      line: '• lint',
    },
    {
      status: StepStatus.Running,
      line: '▸ lint',
    },
    {
      status: StepStatus.Done,
      line: '✓ lint',
    },
    {
      status: StepStatus.Failed,
      line: '✗ lint',
    },
    {
      status: StepStatus.Warned,
      line: '⚠ lint',
    },
    {
      status: StepStatus.Skipped,
      line: '• lint',
    },
  ])('should open a $status step with its symbol', ({ line, status }) => {
    // Arrange
    const step = {
      label: 'lint',
      status,
    };

    // Act
    const written = formatStep(createPlainTheme(), step);

    // Assert
    expect(written).toBe(line);
  });

  it('should add the detail after a dash when the step has one', () => {
    // Arrange
    const step = {
      detail: '3 files',
      label: 'format',
      status: StepStatus.Done,
    };

    // Act
    const written = formatStep(createPlainTheme(), step);

    // Assert
    expect(written).toBe('✓ format — 3 files');
  });
});

describe('formatTaskList', () => {
  it('should write each step on a line of its own', () => {
    // Arrange
    const steps = [
      {
        label: 'lint',
        status: StepStatus.Done,
      },
      {
        label: 'test',
        status: StepStatus.Running,
      },
    ];

    // Act
    const written = formatTaskList(createPlainTheme(), steps);

    // Assert
    expect(written).toBe('✓ lint\n▸ test');
  });
});

describe('formatWaiting', () => {
  it('should write the work going on, its line left open', () => {
    // Arrange
    const label = 'Reading the blocks';

    // Act
    const written = formatWaiting(createPlainTheme(), label);

    // Assert
    expect(written).toBe('▸ Reading the blocks…');
  });
});

describe('formatProgress', () => {
  it('should write the work done of the work in all, and its share', () => {
    // Arrange
    const progress = {
      done: 3,
      label: 'Files',
      total: 8,
    };

    // Act
    const written = formatProgress(createPlainTheme(), progress);

    // Assert
    expect(written).toBe('Files 3/8 (37%)');
  });
});

describe('formatNote', () => {
  it.each([
    {
      tone: Tone.Info,
      glyph: 'ℹ',
    },
    {
      tone: Tone.Warning,
      glyph: '⚠',
    },
    {
      tone: Tone.Success,
      glyph: '✓',
    },
    {
      tone: Tone.Error,
      glyph: '✗',
    },
    {
      tone: Tone.Accent,
      glyph: '▸',
    },
    {
      tone: Tone.Muted,
      glyph: '•',
    },
  ])('should open a note of tone $tone with $glyph and indent its lines', ({ glyph, tone }) => {
    // Arrange
    const note = {
      lines: [
        'one',
        'two',
      ],
      title: 'Heads up',
      tone,
    };

    // Act
    const written = formatNote(createPlainTheme(), note);

    // Assert
    expect(written).toBe(`${glyph} Heads up\n  one\n  two`);
  });
});

describe('formatFailure', () => {
  it('should write what happened, what is known and what to do next', () => {
    // Arrange
    const failure = {
      details: [
        'constitution.yaml: no such file',
      ],
      hint: 'run constitution init',
      title: 'No project here',
    };

    // Act
    const written = formatFailure(createPlainTheme(), failure);

    // Assert
    expect(written).toBe(
      '✗ No project here\n  constitution.yaml: no such file\n  → run constitution init',
    );
  });

  it('should leave the next step out when the failure names none', () => {
    // Arrange
    const failure = {
      details: [],
      title: 'Interrupted',
    };

    // Act
    const written = formatFailure(createPlainTheme(), failure);

    // Assert
    expect(written).toBe('✗ Interrupted');
  });
});

describe('formatTable', () => {
  it('should line up each column as wide as its widest cell, numbers to the end', () => {
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
          rules: '9',
        },
        {
          block: 'gap',
        },
      ],
    };

    // Act
    const written = formatTable(createPlainTheme(), table);

    // Assert
    expect(written.split('\n')).toStrictEqual([
      'Block       Rules',
      'typescript     42',
      'ink             9',
      'gap',
    ]);
  });
});

describe('formatKeyValues', () => {
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
    const written = formatKeyValues(createPlainTheme(), pairs);

    // Assert
    expect(written).toBe('version  0.80.0\nblocks   18');
  });

  it('should write nothing when there is no pair', () => {
    // Arrange
    const pairs: [] = [];

    // Act
    const written = formatKeyValues(createPlainTheme(), pairs);

    // Assert
    expect(written).toBe('');
  });
});
