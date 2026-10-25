import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  findingOf,
  passportFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { coreChaptersCheck } from '../core-chapters';

const CORE = 'blocks/core/core.md';

// The valid files' core holds foundation/principles.md and workflow/workflow.md beside its passport,
// which the list leaves out; a list item that names no axis folder, or a link in a code fence, is
// no item of it.
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
    code: string;
    condition: string;
    items: string[];
    named: string;
  }>([
    {
      code: 'core-chapter-unlisted',
      condition: 'leaves a chapter out',
      items: [
        '- `foundation/`: [principles](foundation/principles.md).',
      ],
      named: 'blocks/core/workflow/workflow.md',
    },
    {
      code: 'core-list-names-no-chapter',
      condition: 'links a file that is no chapter of core',
      items: [
        '- `foundation/`: [principles](foundation/principles.md), [passport](core.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
      named: 'blocks/core/core.md',
    },
    {
      code: 'core-list-names-no-chapter',
      condition: 'links a file core does not hold',
      items: [
        '- `foundation/`: [gone](foundation/gone.md), [principles](foundation/principles.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
      named: 'blocks/core/foundation/gone.md',
    },
    {
      code: 'core-chapter-listed-twice',
      condition: 'links a chapter twice',
      items: [
        '- `foundation/`: [principles](foundation/principles.md), [principles](foundation/principles.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
      named: 'blocks/core/foundation/principles.md',
    },
  ])('should report the passport when its list $condition', ({ code, items, named }) => {
    // Act
    const findings = checkWith(items);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code,
        names: [
          named,
        ],
        path: CORE,
      }),
    ]);
  });
});
