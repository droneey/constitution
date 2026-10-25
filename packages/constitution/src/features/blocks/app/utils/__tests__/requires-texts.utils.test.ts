import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import { RequiresCode } from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';

const PATH = 'blocks/domains/ui/ui.md';

describe('requiresTexts', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: {
        code: RequiresCode.RequiresCore,
        details: {},
        path: PATH,
      },
      text: 'requires core, which is always active',
    },
    {
      finding: {
        code: RequiresCode.RequiresNoBlock,
        details: {
          required: BlockId.create('webgl'),
        },
        path: PATH,
      },
      text: 'requires webgl, which is not a block',
    },
    {
      finding: {
        code: RequiresCode.RequiresItself,
        details: {},
        path: PATH,
      },
      text: 'requires itself',
    },
    {
      finding: {
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
        path: PATH,
      },
      text: 'requires typescript, a language block; a platform block requires only domain blocks or platform blocks',
    },
    {
      finding: {
        code: RequiresCode.RequiresOutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
          ],
          layer: Layer.Domain,
          required: BlockId.create('biome'),
          requiredLayer: Layer.Implementation,
        },
        path: PATH,
      },
      text: 'requires biome, an implementation block; a domain block requires only domain blocks',
    },
    {
      finding: {
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
        path: PATH,
      },
      text: 'requires core, a core block; an implementation block requires only domain blocks, platform blocks or language blocks',
    },
    {
      finding: {
        code: RequiresCode.ExtendsNoBlock,
        details: {
          base: BlockId.create('eslint'),
        },
        path: PATH,
      },
      text: 'extends eslint, which is not a block',
    },
    {
      finding: {
        code: RequiresCode.ExtendsItself,
        details: {},
        path: PATH,
      },
      text: 'extends itself',
    },
    {
      finding: {
        code: RequiresCode.ExtendsOtherLayer,
        details: {
          base: BlockId.create('ui'),
          baseLayer: Layer.Domain,
        },
        path: PATH,
      },
      text: 'extends ui, a domain block; a block extends only a base of its own layer',
    },
    {
      finding: {
        code: RequiresCode.ExtendsConcrete,
        details: {
          base: BlockId.create('lingui'),
        },
        path: PATH,
      },
      text: 'extends lingui, a concrete block; a block extends only an abstract base — require it instead',
    },
  ])('should say $finding.code as the report words it', ({ finding, text }) => {
    // Arrange
    const reported = finding;

    // Act
    const said = findingTextOf(reported);

    // Assert
    expect(said).toBe(text);
  });
});
