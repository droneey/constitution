import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { BlockId } from '../block-id.value-object';

describe('BlockId', () => {
  it.each([
    {
      condition: 'it is one word',
      isBlockId: true,
      text: 'ui',
    },
    {
      condition: 'its words are joined by hyphens and hold digits',
      isBlockId: true,
      text: 'version-control-2',
    },
    {
      condition: 'it opens with the mark of an abstract block',
      isBlockId: true,
      text: '_js-runtime',
    },
    {
      condition: 'it is empty',
      isBlockId: false,
      text: '',
    },
    {
      condition: 'it holds a capital',
      isBlockId: false,
      text: 'Ui',
    },
    {
      condition: 'it holds a slash',
      isBlockId: false,
      text: 'rules/ui',
    },
    {
      condition: 'it holds whitespace',
      isBlockId: false,
      text: 'design system',
    },
    {
      condition: 'it ends with a hyphen',
      isBlockId: false,
      text: 'ui-',
    },
    {
      condition: 'its hyphens are doubled',
      isBlockId: false,
      text: 'design--system',
    },
    {
      condition: 'it holds the abstract mark inside',
      isBlockId: false,
      text: 'js_runtime',
    },
  ])('should tell a block id when $condition', ({ isBlockId, text }) => {
    // Act
    const isId = BlockId.is(text);

    // Assert
    expect(isId).toBe(isBlockId);
  });

  it.each([
    {
      condition: 'it is absent',
      given: undefined,
    },
    {
      condition: 'it is a number whose text would be one',
      given: 42,
    },
  ])('should tell no block id when $condition', ({ given }) => {
    // Act
    const isValue = BlockId.is(given);

    // Assert
    expect(isValue).toBe(false);
  });

  it('should make the block id a kebab-case text names', () => {
    // Arrange
    const text = 'design-system';

    // Act
    const id = BlockId.create(text);

    // Assert
    expect<string>(id).toBe(text);
  });

  it('should refuse a text that is no kebab-case block id', () => {
    // Arrange
    const text = 'Design System';

    // Act
    const create = (): BlockId => BlockId.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.BlockId,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'they are one id',
      isEqual: true,
      left: 'ui',
      right: 'ui',
    },
    {
      condition: 'one extends the other by a word',
      isEqual: false,
      left: 'ui',
      right: 'ui-kit',
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const ids = [
      BlockId.create(left),
      BlockId.create(right),
    ] as const;

    // Act
    const isSame = BlockId.equals(...ids);

    // Assert
    expect(isSame).toBe(isEqual);
  });

  it.each([
    {
      condition: 'it opens with the abstract mark',
      isAbstractId: true,
      text: '_store',
    },
    {
      condition: 'it opens with a letter',
      isAbstractId: false,
      text: 'store',
    },
  ])('should say $isAbstractId when $condition', ({ isAbstractId, text }) => {
    // Arrange
    const id = BlockId.create(text);

    // Act
    const isAbstract = BlockId.isAbstract(id);

    // Assert
    expect(isAbstract).toBe(isAbstractId);
  });
});
