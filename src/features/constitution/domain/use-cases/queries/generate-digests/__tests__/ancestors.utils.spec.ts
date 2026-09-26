import { describe, expect, it } from 'bun:test';

import type { Files } from '#/features/constitution/__tests__/fixtures';
import {
  checkInputOf,
  mainFile,
} from '#/features/constitution/__tests__/fixtures';

import { ancestorsOf } from '../ancestors.utils';

const implementation = (input: {
  extends: string | null;
  id: string;
}): Files => ({
  [`blocks/implementations/${input.id}/${input.id}.md`]: mainFile({
    body: `# ${input.id}\n`,
    extends: input.extends,
    id: input.id,
    kind: 'implementation',
  }),
});

// A chain, a cycle, a block that extends itself and one whose base is unknown:
// the cycles and references checks report the last three.
const chainFiles = (): Files => ({
  ...implementation({
    extends: null,
    id: 'base',
  }),
  ...implementation({
    extends: 'base',
    id: 'middle',
  }),
  ...implementation({
    extends: 'middle',
    id: 'leaf',
  }),
  ...implementation({
    extends: 'beta',
    id: 'alpha',
  }),
  ...implementation({
    extends: 'alpha',
    id: 'beta',
  }),
  ...implementation({
    extends: 'alpha',
    id: 'gamma',
  }),
  ...implementation({
    extends: 'self',
    id: 'self',
  }),
  ...implementation({
    extends: 'ghost',
    id: 'orphan',
  }),
});

describe('ancestorsOf', () => {
  it.each([
    {
      blockId: 'base',
      expected: [],
      name: 'the block extends nothing',
    },
    {
      blockId: 'leaf',
      expected: [
        'middle',
        'base',
      ],
      name: 'the chain has two bases',
    },
    {
      blockId: 'alpha',
      expected: [
        'beta',
      ],
      name: 'the chain comes back to the block',
    },
    {
      blockId: 'gamma',
      expected: [
        'alpha',
        'beta',
      ],
      name: 'the chain runs into a cycle',
    },
    {
      blockId: 'self',
      expected: [],
      name: 'the block extends itself',
    },
    {
      blockId: 'orphan',
      expected: [
        'ghost',
      ],
      name: 'the base is unknown',
    },
  ])(
    'should return $expected nearest first when $name',
    ({ blockId, expected }) => {
      // Arrange
      const { byId } = checkInputOf(chainFiles());

      // Act
      const ancestors = ancestorsOf({
        blockId,
        byId,
      });

      // Assert
      expect(ancestors).toStrictEqual(expected);
    },
  );
});
