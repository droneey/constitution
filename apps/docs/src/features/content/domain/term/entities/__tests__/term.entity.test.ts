import { describe, expect, it } from 'bun:test';

import { Axis } from '../../../block/entities';
import { ValueFailure } from '../../../shared/errors';
import { failureOf } from '../../../shared/errors/__tests__/program-error.fixtures';
import { BlockPath } from '../../../shared/value-objects';
import { Term, TermKind } from '../term.entity';

const bindingUnit = Term.create({
  address: '/docs/core/architecture/layout',
  axis: Axis.Architecture,
  blockId: 'core',
  kind: TermKind.Concept,
  name: 'binding unit',
  sentence: 'A **binding unit** binds one operation to the program’s framework.',
});

describe('Term.axisOf and Term.blockIdOf', () => {
  it.each([
    {
      axis: Axis.Foundation,
      blockId: 'core',
      path: 'core/core.md',
    },
    {
      axis: Axis.Architecture,
      blockId: 'core',
      path: 'core/architecture/layout.md',
    },
    {
      axis: Axis.Foundation,
      blockId: 'bun',
      path: 'implementations/bun/bun.md',
    },
    {
      axis: Axis.Workflow,
      blockId: 'lefthook',
      path: 'implementations/lefthook/workflow/with/betterleaks.md',
    },
    {
      axis: Axis.Foundation,
      blockId: 'python',
      path: 'contexts/languages/python/foundation/types.md',
    },
  ])('should place $path in $blockId on $axis', ({ axis, blockId, path }) => {
    // Arrange
    const blockPath = BlockPath.create(path);

    // Act
    const place = {
      axis: Term.axisOf(blockPath),
      blockId: Term.blockIdOf(blockPath),
    };

    // Assert
    expect(place).toStrictEqual({
      axis,
      blockId,
    });
  });

  it('should name no block when the path holds no folder', () => {
    // Arrange
    const blockPath = BlockPath.create('core.md');

    // Act
    const blockId = Term.blockIdOf(blockPath);

    // Assert
    expect(blockId).toBeUndefined();
  });
});

describe('Term.sentenceAround', () => {
  it.each([
    {
      condition: 'the first sentence',
      expected: 'A **port** names a need.',
      offset: 2,
    },
    {
      condition: 'a middle sentence',
      expected: 'An **adapter** implements it.',
      offset: 30,
    },
    {
      condition: 'the last sentence',
      expected: '`ports/` holds them.',
      offset: 61,
    },
    {
      condition: 'the sentence a break follows',
      expected: 'A **port** names a need.',
      offset: 25,
    },
  ])('should cut $condition', ({ expected, offset }) => {
    // Act
    const sentence = Term.sentenceAround({
      offset,
      text: ' A **port** names a need.  An **adapter** implements it. `ports/` holds them. ',
    });

    // Assert
    expect(sentence).toBe(expected);
  });
});

describe('Term.create', () => {
  it('should refuse a term whose name is blank', () => {
    // Act
    const failure = failureOf(() =>
      Term.create({
        ...bindingUnit,
        name: ' ',
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      code: ValueFailure.TermNameEmpty,
      details: {
        value: ' ',
      },
    });
  });
});

describe('Term.compare', () => {
  it('should order terms by name whatever its case, then by case', () => {
    // Arrange
    const names = [
      'git',
      'Bun',
      'Git',
      'bun',
      'adapters/',
    ];

    // Act
    const ordered = names
      .map((name) => ({
        ...bindingUnit,
        name,
      }))
      .toSorted(Term.compare)
      .map((term) => term.name);

    // Assert
    expect(ordered).toStrictEqual([
      'adapters/',
      'bun',
      'Bun',
      'git',
      'Git',
    ]);
  });
});
