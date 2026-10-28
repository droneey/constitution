import { describe, expect, it } from 'bun:test';

import { paraglideCard } from '../../../../../../../__tests__/templates.fixtures';
import { loadedOf } from '../../../__tests__/check.fixtures';

describe('loadConstitution', () => {
  it('should load a block written from templates/block/ without a finding when its placeholders are filled and its rules sit in foundation', () => {
    // Arrange
    const files = paraglideCard();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      answers: loaded.constitution.requirementAnswers.map(
        (answer) => `${answer.requirement} ${answer.writtenMet}`,
      ),
      blocks: loaded.constitution.blocks.map((block) => `${block.layer} ${block.id}`),
      findings: loaded.findings,
      rules: loaded.constitution.rules.map((parsed) => `${parsed.slug} ${parsed.level}`),
    }).toStrictEqual({
      answers: [
        'i18n-plurals-by-cldr yes',
      ],
      blocks: [
        'implementation paraglide',
      ],
      findings: [],
      rules: [
        'paraglide-messages-by-function MUST',
      ],
    });
  });
});
