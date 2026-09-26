import { describe, expect, it } from 'bun:test';

import { checkInputOf } from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import {
  byIdOf,
  closureOf,
  linksOf,
  mayReferTo,
  reachableFrom,
} from '../closure.utils';

describe('byIdOf', () => {
  it('should index every block by its id when the blocks load', () => {
    // Arrange
    const { constitution } = checkInputOf(validFiles());

    // Act
    const byId = byIdOf(constitution.blocks);

    // Assert
    expect(byId.get('react-dom')?.path).toBe(
      'blocks/implementations/react-dom/react-dom.md',
    );
  });
});

describe('linksOf', () => {
  it('should list the required blocks, then the base, when a block both requires and extends', () => {
    // Arrange
    const { byId } = checkInputOf(validFiles());
    const block = byId.get('react-dom');

    // Act
    const links = block === undefined ? [] : linksOf(block);

    // Assert
    expect(links).toStrictEqual([
      'browser',
      '_react',
    ]);
  });
});

describe('closureOf', () => {
  it('should follow requires and extends transitively when the chain crosses layers', () => {
    // Arrange
    const { byId } = checkInputOf(validFiles());

    // Act
    const closure = closureOf({
      blockId: 'react-dom',
      byId,
    });

    // Assert
    expect([
      ...closure,
    ]).toStrictEqual([
      'browser',
      '_react',
      'untrusted-client',
      'ui',
    ]);
  });
});

describe('reachableFrom', () => {
  it('should hold the block, its closure, the seam and the seam closure when the place is a with/ file', () => {
    // Arrange
    const { byId } = checkInputOf(validFiles());

    // Act
    const reachable = reachableFrom({
      byId,
      place: {
        block: 'browser',
        with: 'ui',
      },
    });

    // Assert
    expect([
      ...reachable,
    ]).toStrictEqual([
      'browser',
      'untrusted-client',
      'ui',
    ]);
  });
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
        with: null,
      },
      name: 'its own block',
      to: 'ui',
    },
    {
      expected: true,
      from: {
        block: 'react-dom',
        with: null,
      },
      name: 'a peer implementation in its closure',
      to: '_react',
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
      name: 'a sibling outside its closure',
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
      name: 'an unknown block',
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
