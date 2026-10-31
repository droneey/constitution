import { describe, expect, it } from 'bun:test';

import { scopesOf } from './pseudo-grammar.fixtures';

describe('pseudo', () => {
  it('should scope each kind of word when a line of pseudo-code holds them', async () => {
    // Arrange
    const code = 'if Order is "a // b" then call total(10.5) # done\nreturn false // end';

    // Act
    const scopes = await scopesOf(code);

    // Assert
    expect(scopes).toStrictEqual([
      [
        'if',
        'source.pseudo',
        'keyword.control.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        'Order',
        'source.pseudo',
        'entity.name.type.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        'is',
        'source.pseudo',
        'keyword.control.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        '"',
        'source.pseudo',
        'string.quoted.double.pseudo',
      ],
      [
        'a // b',
        'source.pseudo',
        'string.quoted.double.pseudo',
      ],
      [
        '"',
        'source.pseudo',
        'string.quoted.double.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        'then',
        'source.pseudo',
        'keyword.control.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        'call',
        'source.pseudo',
        'keyword.control.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        'total',
        'source.pseudo',
        'entity.name.function.pseudo',
      ],
      [
        '(',
        'source.pseudo',
      ],
      [
        '10.5',
        'source.pseudo',
        'constant.numeric.pseudo',
      ],
      [
        ') ',
        'source.pseudo',
      ],
      [
        '# done',
        'source.pseudo',
        'comment.line.pseudo',
      ],
      [
        'return',
        'source.pseudo',
        'keyword.control.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        'false',
        'source.pseudo',
        'constant.language.pseudo',
      ],
      [
        ' ',
        'source.pseudo',
      ],
      [
        '// end',
        'source.pseudo',
        'comment.line.pseudo',
      ],
    ]);
  });
});
