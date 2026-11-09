import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type { NamesDetails } from '../../../domain/validate-constitution/services';
import { NamesCode } from '../../../domain/validate-constitution/services';
import { namesTexts } from '../names-texts.utils';

describe('namesTexts', () => {
  it.each<{
    problem: ProblemOf<NamesDetails>;
    text: string;
  }>([
    {
      problem: {
        code: NamesCode.CoreNamesProduct,
        details: {
          name: 'Docker',
        },
      },
      text: 'names Docker; core names no language, tool, library, product, vendor or version',
    },
    {
      problem: {
        code: NamesCode.ProductOutOfReach,
        details: {
          name: 'React',
          owner: BlockId.create('react'),
        },
      },
      text: 'names React, the subject of react, which its place does not reach; a block names a product only of itself or of a block it requires or sits under',
    },
    {
      problem: {
        code: NamesCode.ProductOfNoBlock,
        details: {
          name: 'Chrome',
        },
      },
      text: "names Chrome, which no block holds; a rule on a product sits in that product's block",
    },
    {
      problem: {
        code: NamesCode.ParentNamesChild,
        details: {
          child: BlockId.create('react/ink'),
          name: 'Ink',
        },
      },
      text: 'names Ink, the subject of its child react/ink; a parent block names nothing of its children',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(namesTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
