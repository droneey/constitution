import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';
import { RuleSlug } from '#/kernel/value-objects';

import { passportFile, rule } from '../../../../../../__tests__/constitution.fixtures';
import { nestedFiles, nestedPassportFile } from '../../../../../../__tests__/nested-files.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { BlockFormDetails } from '../block-form';
import { BlockFormCode, blockFormCheck } from '../block-form';

const UNTRUSTED_CLIENT = 'blocks/domains/untrusted-client/untrusted-client.md';

describe('blockFormCheck', () => {
  it('should find nothing when every passport holds its title, its setup and its Requirements', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = blockFormCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the passport when it holds a rule', () => {
    // Arrange
    const files = validFiles();

    files[UNTRUSTED_CLIENT] = passportFile({
      body: `# Untrusted client\n\n${rule({
        slug: 'tokens-never-stored-in-the-client',
      })}`,
      id: 'untrusted-client',
    });

    const input = checkInputOf(files);

    // Act
    const findings = blockFormCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BlockFormCode.PassportHoldsRules,
        details: {},
        path: UNTRUSTED_CLIENT,
      },
    ]);
  });

  it.each([
    {
      condition: 'a section that is no rule',
      text: '## Notes\n\n#### Aside\n',
    },
    {
      condition: 'a rule shown as an example in a code fence',
      text: '```md\n### sample-rule · MUST\n```\n',
    },
    {
      condition: 'its Requirements',
      text: '## Requirements\n\n| Requirement | How | Met |\n|---|---|---|\n| `secret-never-held-by-the-client` | Cookies. | yes |\n',
    },
  ])('should find nothing when the passport holds $condition', ({ text }) => {
    // Arrange
    const files = validFiles();

    files[UNTRUSTED_CLIENT] = passportFile({
      body: `# Untrusted client\n\n> The client is in the user's hands.\n\n${text}`,
      id: 'untrusted-client',
    });

    const input = checkInputOf(files);

    // Act
    const findings = blockFormCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});

const PLURALS = 'blocks/domains/i18n/foundation/plurals.md';
const UI_WITH_REMOTE_DATA = 'blocks/domains/ui/architecture/with/remote-data.md';

const pluralsRule = rule({
  slug: 'i18n-plurals-by-cldr',
});

const formsRule = rule({
  slug: 'i18n-forms-by-cldr',
});

describe('blockFormCheck on chapters and seams', () => {
  it.each<{
    condition: string;
    finding: FindingOf<BlockFormDetails>;
    text: string;
  }>([
    {
      condition: 'a chapter opens without a Governs line',
      finding: {
        code: BlockFormCode.WithoutGoverns,
        details: {},
        path: PLURALS,
      },
      text: `# Plurals\n\n## General\n\n${pluralsRule}`,
    },
    {
      condition: 'a chapter opens with a Governs line and no title',
      finding: {
        code: BlockFormCode.WithoutGoverns,
        details: {},
        path: PLURALS,
      },
      text: `> Governs plurals.\n\n## General\n\n${pluralsRule}`,
    },
    {
      condition: 'a chapter opens with a section in place of its title',
      finding: {
        code: BlockFormCode.WithoutGoverns,
        details: {},
        path: PLURALS,
      },
      text: `## Plurals\n\n> Governs plurals.\n\n${pluralsRule}`,
    },
    {
      condition: 'a chapter puts prose between its title and its Governs line',
      finding: {
        code: BlockFormCode.WithoutGoverns,
        details: {},
        path: PLURALS,
      },
      text: `# Plurals\n\nPlurals vary.\n\n> Governs plurals.\n\n## General\n\n${pluralsRule}`,
    },
    {
      condition: 'a seam opens without a Governs line',
      finding: {
        code: BlockFormCode.WithoutGoverns,
        details: {},
        path: UI_WITH_REMOTE_DATA,
      },
      text: `# Remote data\n\n## General\n\n${rule({
        tightens: 'reads-are-cancellable',
        slug: 'optimistic-writes-roll-back',
      })}`,
    },
    {
      condition: 'a chapter holds no rule',
      finding: {
        code: BlockFormCode.WithoutRules,
        details: {},
        path: PLURALS,
      },
      text: '# Plurals\n\n> Governs plurals.\n\n## General\n\nNothing is ruled yet.\n',
    },
    {
      condition: 'a rule sits under no section',
      finding: {
        code: BlockFormCode.RuleOutsideSection,
        details: {
          slug: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: PLURALS,
      },
      text: `# Plurals\n\n> Governs plurals.\n\n${pluralsRule}`,
    },
    {
      condition: "a section is named like the file's title",
      finding: {
        code: BlockFormCode.SectionRepeatsTitle,
        details: {
          section: 'plurals',
        },
        path: PLURALS,
      },
      text: `\n# Plurals\n\n> Governs plurals.\n\n## plurals\n\n${pluralsRule}`,
    },
    {
      condition: 'a section follows the Requirements for implementation',
      finding: {
        code: BlockFormCode.RequirementsNotLast,
        details: {},
        path: PLURALS,
      },
      text: `# Plurals\n\n> Governs plurals.\n\n## Requirements for implementation\n\n${pluralsRule}\n## Forms\n\n${formsRule}`,
    },
    {
      condition: 'a section comes before General',
      finding: {
        code: BlockFormCode.GeneralNotFirst,
        details: {},
        path: PLURALS,
      },
      text: `# Plurals\n\n> Governs plurals.\n\n## Forms\n\n${formsRule}\n## General\n\n${pluralsRule}`,
    },
  ])('should report the file when $condition', ({ finding, text }) => {
    // Arrange
    const files = validFiles();

    files[finding.path] = text;

    const input = checkInputOf(files);

    // Act
    const findings = blockFormCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      finding,
    ]);
  });

  it('should report a chapter that holds its title alone', () => {
    // Arrange
    const files = validFiles();

    files[PLURALS] = '# Plurals\n';

    const input = checkInputOf(files);

    // Act
    const findings = blockFormCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BlockFormCode.WithoutGoverns,
        details: {},
        path: PLURALS,
      },
      {
        code: BlockFormCode.WithoutRules,
        details: {},
        path: PLURALS,
      },
    ]);
  });

  it.each([
    {
      condition: 'General opens its sections and the Requirements for implementation close them',
      text: `  \n# Plurals\n\n> Governs plurals.\n\n## General\n\n${pluralsRule}\n## Forms\n\n${formsRule}\n## Requirements for implementation\n\n${rule(
        {
          slug: 'i18n-catalog-compiled',
        },
      )}`,
    },
    {
      condition: 'its sections are its own, with neither General nor Requirements',
      text: `# Plurals\n\n> Governs plurals.\n\n## Forms\n\n${formsRule}\n## Ranges\n\n${pluralsRule}`,
    },
    {
      condition: 'a vocabulary that holds no rule comes before General',
      text: `# Plurals\n\n> Governs plurals.\n\n## The vocabulary\n\nA plural form is a form of a word.\n\n## General\n\n${pluralsRule}`,
    },
    {
      condition: "a code fence shows a heading named like the file's title",
      text: `# Plurals\n\n> Governs plurals.\n\n## General\n\n${pluralsRule}\n\`\`\`md\n## Plurals\n\`\`\`\n`,
    },
  ])('should find nothing when $condition', ({ text }) => {
    // Arrange
    const files = validFiles();

    files[PLURALS] = text;

    const input = checkInputOf(files);

    // Act
    const findings = blockFormCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});

const SCREENS = 'blocks/domains/presentation/@foundation/screens.md';
const PRESENTATION = 'blocks/domains/presentation/presentation.md';

const screensRule = rule({
  slug: 'screen-shows-one-task',
});

describe('blockFormCheck on a nested tree', () => {
  it('should find nothing when every file of the tree is laid out as placement asks', () => {
    // Arrange
    const files = nestedFiles();

    files[SCREENS] =
      `# Screens\n\n> Governs screens.\n\n## Vocabulary\n\nA **task** is what a user came to do.\n\n## General\n\n${screensRule}`;

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    expected: readonly FindingOf<BlockFormDetails>[];
    name: string;
    text: string;
  }>([
    {
      expected: [
        {
          code: BlockFormCode.TextBeforeSections,
          details: {},
          path: SCREENS,
        },
      ],
      name: 'text stands between its Governs line and its first section',
      text: `# Screens\n\n> Governs screens.\n\nA note.\n\n## General\n\n${screensRule}`,
    },
    {
      expected: [
        {
          code: BlockFormCode.VocabularyNotFirst,
          details: {},
          path: SCREENS,
        },
      ],
      name: 'its Vocabulary follows another section',
      text: `# Screens\n\n> Governs screens.\n\n## General\n\n${screensRule}\n## Vocabulary\n\nA **task** is a goal.\n`,
    },
    {
      expected: [
        {
          code: BlockFormCode.RuleInVocabulary,
          details: {
            slug: RuleSlug.create('screen-shows-one-task'),
          },
          path: SCREENS,
        },
      ],
      name: 'its Vocabulary holds a rule',
      text: `# Screens\n\n> Governs screens.\n\n## Vocabulary\n\nA **task** is a goal.\n\n${screensRule}`,
    },
    {
      expected: [
        {
          code: BlockFormCode.SectionWithoutRules,
          details: {
            section: 'Layout',
          },
          path: SCREENS,
        },
      ],
      name: 'a section other than the Vocabulary holds no rule',
      text: `# Screens\n\n> Governs screens.\n\n## General\n\n${screensRule}\n## Layout\n\nScreens are laid out.\n`,
    },
    {
      expected: [
        {
          code: BlockFormCode.TermOutsideVocabulary,
          details: {
            written: '**task**',
          },
          path: SCREENS,
        },
        {
          code: BlockFormCode.TermOutsideVocabulary,
          details: {
            written: '{#task}',
          },
          path: SCREENS,
        },
      ],
      name: 'a rule sets a term in bold and gives it an id',
      text: `# Screens\n\n> Governs screens.\n\n## General\n\n${rule({
        slug: 'screen-shows-one-task',
        statement: 'Every screen shows one **task**{#task}.',
      })}`,
    },
    {
      expected: [
        {
          code: BlockFormCode.WithoutRules,
          details: {},
          path: SCREENS,
        },
        {
          code: BlockFormCode.TextBeforeSections,
          details: {},
          path: SCREENS,
        },
      ],
      name: 'text after its Governs line closes it, with no section',
      text: '# Screens\n\n> Governs screens.\n\nA note.',
    },
    {
      expected: [
        {
          code: BlockFormCode.WithoutGoverns,
          details: {},
          path: SCREENS,
        },
      ],
      name: 'it has no Governs line',
      text: `# Screens\n\n## General\n\n${screensRule}`,
    },
    {
      expected: [
        {
          code: BlockFormCode.WithoutRules,
          details: {},
          path: SCREENS,
        },
      ],
      name: 'its one section holds no rule, as the whole file holds none',
      text: '# Screens\n\n> Governs screens.\n\n## General\n\nNothing yet.\n',
    },
  ])('should report a chapter when $name', ({ expected, text }) => {
    // Arrange
    const files = nestedFiles();

    files[SCREENS] = text;

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each([
    {
      body: '# Presentation\n\n> What users see.\n\n## Setup\n\nRun it.\n',
      name: 'a section',
    },
    {
      body: '# Presentation\n\n> What users see.\n\n> And what they touch.\n',
      name: 'a second line under its title',
    },
    {
      body: '# Presentation\n\nWhat users see.\n',
      name: 'no one line under its title',
    },
    {
      body: '> What users see.\n',
      name: 'no title',
    },
    {
      body: '# Presentation\n\nIts setup.\n\n> What users see.\n',
      name: 'its setup before its one line',
    },
    {
      body: 'Its setup.\n\n> What users see.\n',
      name: 'a line of setup in place of its title',
    },
  ])('should report a passport that holds $name', ({ body }) => {
    // Arrange
    const files = nestedFiles();

    files[PRESENTATION] = nestedPassportFile({
      body,
      id: 'presentation',
    });

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BlockFormCode.PassportMisshapen,
        details: {},
        path: PRESENTATION,
      },
    ]);
  });

  it('should report a term a passport defines', () => {
    // Arrange
    const files = nestedFiles();

    files[PRESENTATION] = nestedPassportFile({
      body: '# Presentation\n\n> What a **user** sees.\n\nIts setup.\n',
      id: 'presentation',
    });

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BlockFormCode.TermOutsideVocabulary,
        details: {
          written: '**user**',
        },
        path: PRESENTATION,
      },
    ]);
  });

  it('should report nothing on a chapter whose opening holds only blank space', () => {
    // Arrange
    const files = nestedFiles();

    files[SCREENS] = `# Screens\n\n> Governs screens.\n   \n## General\n\n${screensRule}`;

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report nothing on a passport with a blank line of spaces under its title', () => {
    // Arrange
    const files = nestedFiles();

    files[PRESENTATION] = nestedPassportFile({
      body: '# Presentation\n   \n> What users see.\n',
      id: 'presentation',
    });

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a term a passport defines in a Vocabulary of its own', () => {
    // Arrange
    const files = nestedFiles();

    files[PRESENTATION] = nestedPassportFile({
      body: '# Presentation\n\n> What users see.\n\n## Vocabulary\n\nA **user** sees.\n',
      id: 'presentation',
    });

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        code: BlockFormCode.TermOutsideVocabulary,
        details: {
          written: '**user**',
        },
        path: PRESENTATION,
      },
      {
        code: BlockFormCode.PassportMisshapen,
        details: {},
        path: PRESENTATION,
      },
    ]);
  });

  it('should report nothing on a legacy chapter that defines a term outside a Vocabulary', () => {
    // Arrange
    const files = validFiles();

    files['blocks/core/foundation/principles.md'] =
      `# Principles\n\n> Governs principles.\n\nA **port** names a need.\n\n## General\n\n${rule({
        slug: 'dependencies-point-inward',
      })}`;

    // Act
    const findings = blockFormCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
