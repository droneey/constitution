import { describe, expect, it } from 'bun:test';

import { loadedOf } from '../../../../../../../__tests__/constitution.fixtures';
import { paraglideCard } from '../../../../../../../__tests__/templates.fixtures';

// The case reads the repository's own templates, so it runs with the integration specs.
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
