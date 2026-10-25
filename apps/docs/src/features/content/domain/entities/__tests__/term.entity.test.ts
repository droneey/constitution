import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { Axis } from '../block.entity';
import { Term, TermKind } from '../term.entity';

const bindingUnit = Term.create({
  address: '/docs/core/architecture/layout',
  axis: Axis.Architecture,
  block: 'core',
  kind: TermKind.Concept,
  name: 'binding unit',
  sentence: 'A **binding unit** binds one operation to the program’s framework.',
});

/** the code and the details a creation failed with, or the error itself when it is none of the feature's */
const failureOf = (create: () => Term): unknown => {
  try {
    return create();
  } catch (error) {
    return error instanceof InvalidValueError
      ? {
          code: error.code,
          details: error.details,
        }
      : error;
  }
};

describe('Term.nameOf', () => {
  it.each([
    {
      bold: {
        isCode: false,
        text: 'binding unit',
      },
      condition: 'plain lower-case words',
      expected: {
        kind: TermKind.Concept,
        name: 'binding unit',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'Ubiquitous \nlanguage.',
      },
      condition: 'a lead-in closed by a full stop across a line break',
      expected: {
        kind: TermKind.Concept,
        name: 'ubiquitous language',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'TanStack Start:',
      },
      condition: 'a lead-in that names a brand',
      expected: {
        kind: TermKind.Brand,
        name: 'TanStack Start',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'Unit',
      },
      condition: 'a capital outside a lead-in',
      expected: {
        kind: TermKind.Brand,
        name: 'Unit',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'Ports and adapters.',
      },
      condition: 'a lead-in of three words',
      expected: {
        kind: TermKind.Concept,
        name: 'ports and adapters',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'Next.js',
      },
      condition: 'a brand with a dot inside',
      expected: {
        kind: TermKind.Brand,
        name: 'Next.js',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'routeTree.gen.ts',
      },
      condition: 'a file of two extensions',
      expected: {
        kind: TermKind.File,
        name: 'routeTree.gen.ts',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'node:fs.promises',
      },
      condition: 'code that ends like a file name',
      expected: {
        kind: TermKind.Api,
        name: 'node:fs.promises',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'tsconfig.json#paths',
      },
      condition: 'code that starts like a file name',
      expected: {
        kind: TermKind.Api,
        name: 'tsconfig.json#paths',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'widgets/',
      },
      condition: 'a folder',
      expected: {
        kind: TermKind.Folder,
        name: 'widgets/',
      },
    },
    {
      bold: {
        isCode: true,
        text: '.stories',
      },
      condition: 'a suffix',
      expected: {
        kind: TermKind.Suffix,
        name: '.stories',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'renovate.json',
      },
      condition: 'a file',
      expected: {
        kind: TermKind.File,
        name: 'renovate.json',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'bun:test',
      },
      condition: 'any other code',
      expected: {
        kind: TermKind.Api,
        name: 'bun:test',
      },
    },
  ])('should read $condition', ({ bold, expected }) => {
    // Act
    const name = Term.nameOf(bold);

    // Assert
    expect(name).toStrictEqual(expected);
  });
});

describe('Term.axisOf and Term.blockOf', () => {
  it.each([
    {
      axis: Axis.Foundation,
      block: 'core',
      path: 'core/core.md',
    },
    {
      axis: Axis.Architecture,
      block: 'core',
      path: 'core/architecture/layout.md',
    },
    {
      axis: Axis.Foundation,
      block: 'bun',
      path: 'implementations/bun/bun.md',
    },
    {
      axis: Axis.Workflow,
      block: 'lefthook',
      path: 'implementations/lefthook/workflow/with/betterleaks.md',
    },
    {
      axis: Axis.Foundation,
      block: 'python',
      path: 'contexts/languages/python/foundation/types.md',
    },
  ])('should place $path in $block on $axis', ({ axis, block, path }) => {
    // Act
    const place = {
      axis: Term.axisOf(path),
      block: Term.blockOf(path),
    };

    // Assert
    expect(place).toStrictEqual({
      axis,
      block,
    });
  });

  it('should name no block when the path holds no folder', () => {
    // Act
    const block = Term.blockOf('core.md');

    // Assert
    expect(block).toBeUndefined();
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

describe('Term.is', () => {
  it.each([
    {
      expected: true,
      candidate: bindingUnit,
    },
    {
      expected: false,
      candidate: 'binding unit',
    },
    {
      expected: false,
      candidate: {
        ...bindingUnit,
        sentence: 1,
      },
    },
    {
      expected: false,
      candidate: {
        ...bindingUnit,
        kind: 'word',
      },
    },
    {
      expected: false,
      candidate: {
        ...bindingUnit,
        axis: 'delivery',
      },
    },
  ])('should tell a term from $candidate', ({ candidate, expected }) => {
    // Act
    const isTerm = Term.is(candidate);

    // Assert
    expect(isTerm).toBe(expected);
  });
});

describe('Term.equals and Term.compare', () => {
  it('should hold two terms of two names apart', () => {
    // Act
    const equal = Term.equals(bindingUnit, {
      ...bindingUnit,
      name: 'use case',
    });

    // Assert
    expect(equal).toBe(false);
  });

  it('should hold two terms of one name equal, wherever they are defined', () => {
    // Act
    const equal = Term.equals(bindingUnit, {
      ...bindingUnit,
      block: 'ui',
    });

    // Assert
    expect(equal).toBe(true);
  });

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
