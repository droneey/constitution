import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import { passportFile } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../__tests__/check.fixtures';
import type { CoreChaptersDetails } from '../core-chapters';
import { CoreChaptersCode, coreChaptersCheck } from '../core-chapters';

const CORE = 'blocks/core/core.md';

const passportListing = (items: readonly string[]): string =>
  passportFile({
    body: [
      '# Core',
      '',
      'Prose may quote - `foundation/`: [principles](foundation/principles.md) mid-line.',
      '',
      '- `PROJECT.md`: [principles](foundation/principles.md).',
      '',
      '```md',
      '- `foundation/`: [principles](foundation/principles.md).',
      '```',
      '',
      '## Its chapters',
      '',
      ...items,
      '',
    ].join('\n'),
    id: 'core',
  });

const checkWith = (items: readonly string[]): ReturnType<typeof coreChaptersCheck> => {
  const files = validFiles();

  files[CORE] = passportListing(items);

  return coreChaptersCheck(checkInputOf(files));
};

describe('coreChaptersCheck', () => {
  it("should find nothing when the passport's list links every chapter of core once", () => {
    // Act
    const findings = checkWith([
      '- `foundation/`: [principles](foundation/principles.md).',
      '- `workflow/`: [workflow](workflow/workflow.md).',
    ]);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should find nothing when the Constitution has no core', () => {
    // Arrange
    const files = Object.fromEntries(
      Object.entries(validFiles()).filter(([path]) => !path.startsWith('blocks/core/')),
    );

    // Act
    const findings = coreChaptersCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    condition: string;
    finding: FindingOf<CoreChaptersDetails>;
    items: string[];
  }>([
    {
      condition: 'leaves a chapter out',
      finding: {
        code: CoreChaptersCode.ChapterUnlisted,
        details: {
          chapter: 'blocks/core/workflow/workflow.md',
        },
        path: CORE,
      },
      items: [
        '- `foundation/`: [principles](foundation/principles.md).',
      ],
    },
    {
      condition: 'links a file that is no chapter of core',
      finding: {
        code: CoreChaptersCode.ListsNoChapter,
        details: {
          entry: 'blocks/core/core.md',
        },
        path: CORE,
      },
      items: [
        '- `foundation/`: [principles](foundation/principles.md), [passport](core.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
    },
    {
      condition: 'links a file core does not hold',
      finding: {
        code: CoreChaptersCode.ListsNoChapter,
        details: {
          entry: 'blocks/core/foundation/gone.md',
        },
        path: CORE,
      },
      items: [
        '- `foundation/`: [gone](foundation/gone.md), [principles](foundation/principles.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
    },
    {
      condition: 'links a chapter twice',
      finding: {
        code: CoreChaptersCode.ListedTwice,
        details: {
          entry: 'blocks/core/foundation/principles.md',
        },
        path: CORE,
      },
      items: [
        '- `foundation/`: [principles](foundation/principles.md), [principles](foundation/principles.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
    },
  ])('should report the passport when its list $condition', ({ finding, items }) => {
    // Act
    const findings = checkWith(items);

    // Assert
    expect(findings).toStrictEqual([
      finding,
    ]);
  });
});
