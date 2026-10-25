import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  findingOf,
  passportFile,
  rule,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { blockFormCheck } from '../block-form';

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
      findingOf({
        code: 'passport-holds-rules',
        path: UNTRUSTED_CLIENT,
      }),
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
    code: string;
    condition: string;
    file: string;
    names: readonly string[];
    text: string;
  }>([
    {
      code: 'file-without-governs',
      condition: 'a chapter opens without a Governs line',
      file: PLURALS,
      names: [],
      text: `# Plurals\n\n## General\n\n${pluralsRule}`,
    },
    {
      code: 'file-without-governs',
      condition: 'a chapter opens with a Governs line and no title',
      file: PLURALS,
      names: [],
      text: `> Governs plurals.\n\n## General\n\n${pluralsRule}`,
    },
    {
      code: 'file-without-governs',
      condition: 'a chapter opens with a section in place of its title',
      file: PLURALS,
      names: [],
      text: `## Plurals\n\n> Governs plurals.\n\n${pluralsRule}`,
    },
    {
      code: 'file-without-governs',
      condition: 'a chapter puts prose between its title and its Governs line',
      file: PLURALS,
      names: [],
      text: `# Plurals\n\nPlurals vary.\n\n> Governs plurals.\n\n## General\n\n${pluralsRule}`,
    },
    {
      code: 'file-without-governs',
      condition: 'a seam opens without a Governs line',
      file: UI_WITH_REMOTE_DATA,
      names: [],
      text: `# Remote data\n\n## General\n\n${rule({
        tightens: 'reads-are-cancellable',
        slug: 'optimistic-writes-roll-back',
      })}`,
    },
    {
      code: 'chapter-without-rules',
      condition: 'a chapter holds no rule',
      file: PLURALS,
      names: [],
      text: '# Plurals\n\n> Governs plurals.\n\n## General\n\nNothing is ruled yet.\n',
    },
    {
      code: 'rule-outside-section',
      condition: 'a rule sits under no section',
      file: PLURALS,
      names: [
        'i18n-plurals-by-cldr',
      ],
      text: `# Plurals\n\n> Governs plurals.\n\n${pluralsRule}`,
    },
    {
      code: 'section-repeats-title',
      condition: "a section is named like the file's title",
      file: PLURALS,
      names: [
        'plurals',
      ],
      text: `\n# Plurals\n\n> Governs plurals.\n\n## plurals\n\n${pluralsRule}`,
    },
    {
      code: 'requirements-section-not-last',
      condition: 'a section follows the Requirements for implementation',
      file: PLURALS,
      names: [],
      text: `# Plurals\n\n> Governs plurals.\n\n## Requirements for implementation\n\n${pluralsRule}\n## Forms\n\n${formsRule}`,
    },
    {
      code: 'general-section-not-first',
      condition: 'a section comes before General',
      file: PLURALS,
      names: [],
      text: `# Plurals\n\n> Governs plurals.\n\n## Forms\n\n${formsRule}\n## General\n\n${pluralsRule}`,
    },
  ])('should report the file when $condition', ({ code, file, names, text }) => {
    // Arrange
    const files = validFiles();

    files[file] = text;

    const input = checkInputOf(files);

    // Act
    const findings = blockFormCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code,
        names,
        path: file,
      }),
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
      findingOf({
        code: 'file-without-governs',
        path: PLURALS,
      }),
      findingOf({
        code: 'chapter-without-rules',
        path: PLURALS,
      }),
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
