import { describe, expect, it } from 'bun:test';

import type { Files } from '../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
} from '../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../__tests__/valid-files.fixtures';
import type { Place } from '../closure.utils';
import { closureOf, mayReferTo, reachableFrom } from '../closure.utils';

interface ClosureCase {
  blockId: string;
  expected: string[];
  files: Files;
  name: string;
}

interface ReachCase {
  expected: string[];
  name: string;
  place: Place;
}

const implementationRequiring = (input: {
  id: string;
  requires: readonly string[];
}): Files => ({
  [`blocks/implementations/${input.id}/${input.id}.md`]: mainFile({
    body: `# ${input.id}\n`,
    id: input.id,
    kind: 'implementation',
    requires: input.requires,
  }),
});

describe('closureOf', () => {
  it.each<ClosureCase>([
    {
      blockId: 'react-dom',
      expected: [
        'browser',
        '_react',
        'untrusted-client',
        'ui',
      ],
      files: {},
      name: 'the links cross layers through requires and extends',
    },
    {
      blockId: 'biome',
      expected: [
        'lingui',
      ],
      files: {
        ...implementationRequiring({
          id: 'biome',
          requires: [
            'lingui',
          ],
        }),
        ...implementationRequiring({
          id: 'lingui',
          requires: [
            'biome',
          ],
        }),
      },
      name: 'two blocks require each other',
    },
    {
      blockId: 'biome',
      expected: [
        'nowhere',
        'typescript',
      ],
      files: implementationRequiring({
        id: 'biome',
        requires: [
          'nowhere',
          'typescript',
        ],
      }),
      name: 'a link names no block, which has no links to follow',
    },
  ])(
    'should hold every id the links reach, but not the block itself, when $name',
    ({ blockId, expected, files }) => {
      // Arrange
      const { byId } = checkInputOf({
        ...validFiles(),
        ...files,
      });

      // Act
      const closure = closureOf({
        blockId,
        byId,
      });

      // Assert
      expect([
        ...closure,
      ]).toStrictEqual(expected);
    },
  );
});

describe('reachableFrom', () => {
  it.each<ReachCase>([
    {
      expected: [
        'browser',
        'untrusted-client',
      ],
      name: 'a main file, which reaches its block and its closure',
      place: {
        block: 'browser',
        with: null,
      },
    },
    {
      expected: [
        'ui',
        'browser',
        'untrusted-client',
      ],
      name: 'a with/ file, which also reaches the block it is named after and its closure',
      place: {
        block: 'ui',
        with: 'browser',
      },
    },
  ])(
    'should hold every block the place reaches when the place is $name',
    ({ expected, place }) => {
      // Arrange
      const { byId } = checkInputOf(validFiles());

      // Act
      const reachable = reachableFrom({
        byId,
        place,
      });

      // Assert
      expect([
        ...reachable,
      ]).toStrictEqual(expected);
    },
  );
});

describe('mayReferTo', () => {
  it.each([
    {
      expected: true,
      from: {
        block: 'ui',
        with: null,
      },
      name: 'a block of a layer above',
      to: 'core',
    },
    {
      expected: true,
      from: {
        block: 'ui',
        with: 'remote-data',
      },
      name: 'the block its with/ file is named after',
      to: 'remote-data',
    },
    {
      expected: false,
      from: {
        block: 'ui',
        with: null,
      },
      name: 'a block of its own layer outside its closure',
      to: 'i18n',
    },
    {
      expected: false,
      from: {
        block: 'ui',
        with: null,
      },
      name: 'a block of a layer below',
      to: 'react-dom',
    },
    {
      expected: false,
      from: {
        block: 'ui',
        with: null,
      },
      name: 'a block that does not exist',
      to: 'nowhere',
    },
  ])(
    'should answer $expected when a file refers to $name',
    ({ expected, from, to }) => {
      // Arrange
      const { byId } = checkInputOf(validFiles());

      // Act
      const isAllowed = mayReferTo({
        byId,
        from,
        to,
      });

      // Assert
      expect(isAllowed).toBe(expected);
    },
  );
});
