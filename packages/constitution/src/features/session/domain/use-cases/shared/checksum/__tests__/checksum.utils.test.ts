import { describe, expect, it } from 'bun:test';

import { createFakeWorkingTree } from '#/__tests__/working-tree.fake';

import { fingerprintOf } from '../checksum.utils';

describe('fingerprintOf', () => {
  it.each([
    {
      checksum: '4294967295',
      condition: 'the state holds no bytes',
      state: '',
    },
    {
      checksum: '3287646509',
      condition: 'the state is a word',
      state: 'hello',
    },
    {
      checksum: '1664553091',
      condition: 'its length takes two bytes',
      state: 'a'.repeat(300),
    },
    {
      checksum: '573700510',
      condition: 'its length takes three bytes',
      state: 'b'.repeat(70_000),
    },
    {
      checksum: '4294967295',
      condition: 'git cannot report it, which reads as no bytes',
      state: new Error('git failed'),
    },
  ])(
    'should give what POSIX cksum prints of the state of the tree when $condition',
    ({ checksum, state }) => {
      // Arrange
      const workingTree = createFakeWorkingTree({
        state,
      });

      // Act
      const fingerprint = fingerprintOf({
        project: '/work/project',
        workingTree,
      });

      // Assert
      expect(fingerprint).toBe(checksum);
    },
  );
});
