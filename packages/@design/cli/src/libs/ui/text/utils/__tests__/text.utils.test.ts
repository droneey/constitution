import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { createMarkingTheme, createPlainTheme, markedSpansOf } from '#/__tests__/theme.fixtures';

import { Tone } from '../../../theme';
import { ColumnAlign, StepStatus } from '../../constants';
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

const plain = createPlainTheme();

const lintStep = (status: StepStatus): string =>
  formatStep(plain, {
    label: 'lint',
    status,
  });

const noteOf = (tone: Tone): string =>
  formatNote(plain, {
    lines: [
      'one',
      'two',
    ],
    title: 'Heads up',
    tone,
  });

describe('the text formats', () => {
  it('should write each kind of content, plain, as the golden file shows it', async () => {
    // Act
    const golden = goldenOf({
      heading: formatHeading(plain, 'Checks'),
      'a pending step': lintStep(StepStatus.Pending),
      'a running step': lintStep(StepStatus.Running),
      'a done step': lintStep(StepStatus.Done),
      'a failed step': lintStep(StepStatus.Failed),
      'a warned step': lintStep(StepStatus.Warned),
      'a skipped step': lintStep(StepStatus.Skipped),
      'a step with a detail': formatStep(plain, {
        detail: '3 files',
        label: 'format',
        status: StepStatus.Done,
      }),
      'a task list': formatTaskList(plain, [
        {
          label: 'lint',
          status: StepStatus.Done,
        },
        {
          label: 'test',
          status: StepStatus.Running,
        },
      ]),
      'the work going on': formatWaiting(plain, 'lint'),
      progress: formatProgress(plain, {
        done: 3,
        label: 'Files',
        total: 8,
      }),
      'a note of information': noteOf(Tone.Info),
      'a note of warning': noteOf(Tone.Warning),
      'a note of success': noteOf(Tone.Success),
      'a note of error': noteOf(Tone.Error),
      'a note of the accent': noteOf(Tone.Accent),
      'a muted note': noteOf(Tone.Muted),
      'a failure that names a next step': formatFailure(plain, {
        details: [
          'constitution.yaml: ENOENT',
        ],
        hint: 'init',
        title: 'no-project',
      }),
      'a failure that names none': formatFailure(plain, {
        details: [],
        title: 'Interrupted',
      }),
      'a table, a column of numbers to the end': formatTable(plain, {
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
      }),
      'keys and values': formatKeyValues(plain, [
        [
          'version',
          '0.80.0',
        ],
        [
          'blocks',
          '18',
        ],
      ]),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('text.golden.txt', import.meta.url)));
  });
});

describe('formatHeading', () => {
  it('should write the title in bold accent', () => {
    // Arrange
    const theme = createMarkingTheme();

    // Act
    const heading = formatHeading(theme, 'Checks');

    // Assert
    expect(markedSpansOf(heading)).toStrictEqual([
      [
        'strong accent',
        'Checks',
      ],
    ]);
  });
});

describe('formatKeyValues', () => {
  it('should write nothing when there is no pair', () => {
    // Arrange
    const pairs: [] = [];

    // Act
    const written = formatKeyValues(plain, pairs);

    // Assert
    expect(written).toBe('');
  });
});
