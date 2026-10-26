import { describe, expect, it } from 'bun:test';

import { CatalogueRefusal, isCatalogueRefusal } from '../catalogue-refusal.error';

describe('CatalogueRefusal', () => {
  it('should name itself and keep where the refused node starts', () => {
    // Act
    const error = new CatalogueRefusal({
      offset: 12,
    });

    // Assert
    expect({
      details: error.details,
      name: error.name,
    }).toStrictEqual({
      details: {
        offset: 12,
      },
      name: 'CatalogueRefusal',
    });
  });

  it.each([
    {
      condition: 'it is a CatalogueRefusal',
      error: new CatalogueRefusal({
        offset: 0,
      }),
      isRefusal: true,
    },
    {
      condition: 'it is another error',
      error: new Error('an alias'),
      isRefusal: false,
    },
  ])('should say $isRefusal when $condition', ({ error, isRefusal }) => {
    // Act
    const answer = isCatalogueRefusal(error);

    // Assert
    expect(answer).toBe(isRefusal);
  });
});
