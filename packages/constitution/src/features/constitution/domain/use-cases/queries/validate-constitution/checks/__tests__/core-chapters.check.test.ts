import { describe, expect, it } from 'bun:test';

import { checkInputOf } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { coreChaptersCheck } from '../core-chapters.check';

const PLACEMENT = 'blocks/core/placement.md';

// The valid files' core holds principles.md and workflow/workflow.md beside its card.
const placementListing = (items: readonly string[]): string =>
  [
    '# Placement',
    '',
    'Prose may link [principles](principles.md) too.',
    '',
    ...items,
    '',
  ].join('\n');

const checkWith = (placement: string | undefined): ReturnType<typeof coreChaptersCheck> => {
  const files = validFiles();

  if (placement !== undefined) {
    files[PLACEMENT] = placement;
  }

  return coreChaptersCheck(checkInputOf(files));
};

describe('coreChaptersCheck', () => {
  it("should find nothing when placement's list links every chapter of core once", () => {
    // Act
    const findings = checkWith(
      placementListing([
        '- The base: [placement](placement.md), [principles](principles.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ]),
    );

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

  it('should find nothing when core has no placement chapter', () => {
    // Act
    const findings = checkWith(undefined);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      condition: 'leaves a chapter out',
      items: [
        '- The base: [placement](placement.md), [principles](principles.md).',
      ],
      named: 'workflow/workflow.md',
    },
    {
      condition: 'links a file that is no chapter of core',
      items: [
        '- The base: [placement](placement.md), [principles](principles.md), [card](core.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
      named: 'core.md',
    },
    {
      condition: 'links a chapter twice',
      items: [
        '- The base: [placement](placement.md), [principles](principles.md), [principles](principles.md).',
        '- `workflow/`: [workflow](workflow/workflow.md).',
      ],
      named: 'principles.md',
    },
  ])('should report placement when its list $condition', ({ items, named }) => {
    // Act
    const findings = checkWith(placementListing(items));

    // Assert
    expect(
      findings.map((finding) => ({
        names: finding.message.includes(named),
        path: finding.path,
      })),
    ).toStrictEqual([
      {
        names: true,
        path: PLACEMENT,
      },
    ]);
  });
});
