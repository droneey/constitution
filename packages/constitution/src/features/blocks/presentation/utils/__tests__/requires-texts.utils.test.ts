import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { ProblemOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type { RequiresDetails } from '../../../domain/services';
import { RequiresCode } from '../../../domain/services';
import { requiresTexts } from '../requires-texts.utils';

describe('requiresTexts', () => {
  it.each<{
    problem: ProblemOf<RequiresDetails>;
    text: string;
  }>([
    {
      problem: {
        code: RequiresCode.RequiresCore,
        details: {},
      },
      text: 'requires core, which is always active',
    },
    {
      problem: {
        code: RequiresCode.RequiresNoBlock,
        details: {
          required: BlockId.create('webgl'),
        },
      },
      text: 'requires webgl, which is not a block',
    },
    {
      problem: {
        code: RequiresCode.RequiresItself,
        details: {},
      },
      text: 'requires itself',
    },
    {
      problem: {
        code: RequiresCode.RequiresOutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
            Layer.Platform,
          ],
          layer: Layer.Platform,
          required: BlockId.create('typescript'),
          requiredLayer: Layer.Language,
        },
      },
      text: 'requires typescript, a language block; a platform block requires only domain blocks or platform blocks',
    },
    {
      problem: {
        code: RequiresCode.RequiresOutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
          ],
          layer: Layer.Domain,
          required: BlockId.create('biome'),
          requiredLayer: Layer.Implementation,
        },
      },
      text: 'requires biome, an implementation block; a domain block requires only domain blocks',
    },
    {
      problem: {
        code: RequiresCode.RequiresOutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
            Layer.Platform,
            Layer.Language,
          ],
          layer: Layer.Implementation,
          required: BlockId.create('core'),
          requiredLayer: Layer.Core,
        },
      },
      text: 'requires core, a core block; an implementation block requires only domain blocks, platform blocks or language blocks',
    },
    {
      problem: {
        code: RequiresCode.ExtendsNoBlock,
        details: {
          base: BlockId.create('eslint'),
        },
      },
      text: 'extends eslint, which is not a block',
    },
    {
      problem: {
        code: RequiresCode.ExtendsItself,
        details: {},
      },
      text: 'extends itself',
    },
    {
      problem: {
        code: RequiresCode.ExtendsOtherLayer,
        details: {
          base: BlockId.create('ui'),
          baseLayer: Layer.Domain,
        },
      },
      text: 'extends ui, a domain block; a block extends only a base of its own layer',
    },
    {
      problem: {
        code: RequiresCode.ExtendsConcrete,
        details: {
          base: BlockId.create('lingui'),
        },
      },
      text: 'extends lingui, a concrete block; a block extends only an abstract base — require it instead',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(requiresTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
