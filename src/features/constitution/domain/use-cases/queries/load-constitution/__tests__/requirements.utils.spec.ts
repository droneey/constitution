import { describe, expect, it } from 'bun:test';

import { parseRequirements } from '../requirements.utils';

const FILE = 'blocks/implementations/lingui/lingui.md';

describe('parseRequirements', () => {
  it('should read the rows of the Requirements section', () => {
    // Arrange
    const text = [
      '# Lingui',
      '',
      '## Requirements',
      '',
      '| Requirement | How | Status |',
      '|---|---|---|',
      '| `i18n-plurals-by-cldr` | ICU plural | met |',
      '| i18n-lazy-locales | catalogs per locale | partial: loaded by hand |',
      '',
      '## lingui-macros-only · MUST',
      '| `not-a-row` | x | met |',
    ].join('\n');

    // Act
    const answers = parseRequirements({
      block: 'lingui',
      file: FILE,
      text,
      with: null,
    });

    // Assert
    expect(answers).toStrictEqual([
      {
        block: 'lingui',
        file: FILE,
        how: 'ICU plural',
        requirement: 'i18n-plurals-by-cldr',
        status: 'met',
        with: null,
      },
      {
        block: 'lingui',
        file: FILE,
        how: 'catalogs per locale',
        requirement: 'i18n-lazy-locales',
        status: 'partial: loaded by hand',
        with: null,
      },
    ]);
  });

  it('should read to the end of the file when no heading follows', () => {
    // Act
    const answers = parseRequirements({
      block: 'lingui',
      file: FILE,
      text: '## Requirements\n\n| `a` | b | met |\n',
      with: null,
    });

    // Assert
    expect(answers.map((answer) => answer.requirement)).toStrictEqual([
      'a',
    ]);
  });

  it('should find nothing without a Requirements section', () => {
    // Act
    const answers = parseRequirements({
      block: 'lingui',
      file: FILE,
      text: '# Lingui\n\n| `a` | b | met |\n',
      with: null,
    });

    // Assert
    expect(answers).toStrictEqual([]);
  });
});
