import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { ProblemOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import { TermKind } from '../../../domain/entities';
import type { TermsDetails } from '../../../domain/use-cases/queries/check';
import { TermsCode } from '../../../domain/use-cases/queries/check';
import { termsTexts } from '../terms-texts.utils';

describe('termsTexts', () => {
  it.each<{
    problem: ProblemOf<TermsDetails>;
    text: string;
  }>([
    {
      problem: {
        code: TermsCode.Misshapen,
        details: {
          written: 'the `x` folder',
        },
      },
      text: 'sets "the `x` folder" in bold, which is neither plain words nor one code span; bold defines a term',
    },
    {
      problem: {
        code: TermsCode.DefinedTwice,
        details: {
          firstBlock: BlockId.create('biome'),
          firstFile: 'blocks/implementations/biome/biome.md',
          term: 'Biome',
        },
      },
      text: 'defines "Biome", which blocks/implementations/biome/biome.md of biome defines already; a term is defined once',
    },
    {
      problem: {
        code: TermsCode.OffAxis,
        details: {
          axis: Axis.Foundation,
          term: 'port',
          termAxis: Axis.Architecture,
        },
      },
      text: 'uses "port", a term of the architecture; foundation holds whatever the architecture',
    },
    {
      problem: {
        code: TermsCode.OutOfReach,
        details: {
          owner: BlockId.create('typescript'),
          term: 'TypeScript',
        },
      },
      text: 'uses "TypeScript", which typescript defines; only typescript and the blocks that build on it may',
    },
    {
      problem: {
        code: TermsCode.Misspelled,
        details: {
          kind: TermKind.Folder,
          owner: BlockId.create('core'),
          term: 'adapters/',
          written: 'adapters',
        },
      },
      text: 'writes `adapters`, which core defines as `adapters/`; a folder keeps one spelling',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(termsTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
