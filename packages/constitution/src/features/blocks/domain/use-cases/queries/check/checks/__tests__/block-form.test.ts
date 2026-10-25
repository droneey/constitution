import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';
import { RuleSlug } from '#/kernel/value-objects';

import {
  checkInputOf,
  passportFile,
  rule,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
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
