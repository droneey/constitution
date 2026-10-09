import { describe, expect, it } from 'bun:test';

import type { Files } from '../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
  rule,
  without,
} from '../../../../../__tests__/constitution.fixtures';
import { GOLDEN_CORE, GOLDEN_INDEX } from '../../../../../__tests__/valid-digests.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { generateDigests } from '../generate-digests.use-case';

const CORE = 'blocks/core/core.md';
const I18N = 'blocks/domains/i18n/plurals.md';
const PRINCIPLES = 'blocks/core/principles.md';
const WORKFLOW = 'blocks/core/workflow/workflow.md';

const coreFile = (body: string): string =>
  mainFile({
    body,
    id: 'core',
  });

const implementation = (input: { extends: string; id: string }): Files => ({
  [`blocks/implementations/${input.id}/${input.id}.md`]: mainFile({
    body: `# ${input.id}\n`,
    extends: input.extends,
    id: input.id,
  }),
});

// A cycle of bases the cycles check reports; the digests still index it.
const CYCLE: Files = {
  ...implementation({
    extends: 'beta',
    id: 'alpha',
  }),
  ...implementation({
    extends: 'alpha',
    id: 'beta',
  }),
};

interface RecordCase {
  condition: string;
  files: Files;
  key: string;
  record: string;
  what: string;
}

const recordsOf = (input: { index: string; key: string }): readonly string[] =>
  input.index.split('\n').filter((line) => line.startsWith(`${input.key}\t`));

describe('generateDigests', () => {
  it('should write every record of the index in order and the core part without a finding when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const digests = generateDigests(input);

    // Assert
    expect(digests).toStrictEqual({
      core: GOLDEN_CORE,
      findings: [],
      index: GOLDEN_INDEX,
    });
  });

  it.each<RecordCase>([
    {
      condition: 'the chain of bases comes back to the block',
      files: CYCLE,
      key: 'block\talpha',
      record: 'block\talpha\timplementation\tThe alpha block.\t\t\t\tbeta\tfalse\tbeta\t\tbeta\t',
      what: 'the ancestors up to the block',
    },
    {
      condition: 'the chain of bases runs into a cycle',
      files: {
        ...CYCLE,
        ...implementation({
          extends: 'alpha',
          id: 'gamma',
        }),
      },
      key: 'block\tgamma',
      record:
        'block\tgamma\timplementation\tThe gamma block.\t\t\t\talpha\tfalse\t\t\talpha beta\t',
      what: 'each ancestor once',
    },
    {
      condition: 'a block extends an id no block has',
      files: implementation({
        extends: 'ghost',
        id: 'orphan',
      }),
      key: 'block\torphan',
      record: 'block\torphan\timplementation\tThe orphan block.\t\t\t\tghost\tfalse\t\t\tghost\t',
      what: 'the unknown base as the only ancestor',
    },
    {
      condition: 'a rule carries out a SHOULD rule and states MUST',
      files: {
        [I18N]: `# i18n\n\n${rule({
          level: 'MUST',
          parent: 'dependencies-point-inward',
          slug: 'i18n-plurals-by-cldr',
          tags: '[ux]',
        })}`,
        [PRINCIPLES]: `# Principles\n\n${rule({
          level: 'SHOULD',
          slug: 'dependencies-point-inward',
        })}`,
      },
      key: 'rule\ti18n-plurals-by-cldr',
      record:
        'rule\ti18n-plurals-by-cldr\ti18n\tblocks/domains/i18n/plurals.md\t\tMUST\tux\t\tdependencies-point-inward\ttrue',
      what: 'the stricter level it states and the parent',
    },
    {
      condition: 'a rule carries out another and states no level',
      files: {
        [I18N]: `# i18n\n\n${rule({
          isLevelStated: false,
          parent: 'dependencies-point-inward',
          slug: 'i18n-plurals-by-cldr',
          tags: '[ux]',
        })}`,
      },
      key: 'rule\ti18n-plurals-by-cldr',
      record:
        'rule\ti18n-plurals-by-cldr\ti18n\tblocks/domains/i18n/plurals.md\t\tMUST\tux\t\tdependencies-point-inward\tfalse',
      what: 'the level taken from the parent and no stated level',
    },
  ])('should write $what in the record when $condition', ({ files, key, record }) => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      ...files,
    });

    // Act
    const { index } = generateDigests(input);

    // Assert
    expect(
      recordsOf({
        index,
        key,
      }),
    ).toStrictEqual([
      record,
    ]);
  });

  it('should write an empty core part without a finding when there is no core', () => {
    // Arrange
    const input = checkInputOf(
      without({
        files: without({
          files: without({
            files: validFiles(),
            path: CORE,
          }),
          path: PRINCIPLES,
        }),
        path: WORKFLOW,
      }),
    );

    // Act
    const digests = generateDigests(input);

    // Assert
    expect({
      core: digests.core,
      findings: digests.findings,
    }).toStrictEqual({
      core: '',
      findings: [],
    });
  });

  it.each([
    {
      condition: 'the card core.md has no body',
      files: {
        ...validFiles(),
        [CORE]: coreFile(''),
      },
      text: '\n',
    },
  ])('should write only the card core.md in the core part when $condition', ({ files, text }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const digests = generateDigests(input);

    // Assert
    expect({
      core: digests.core,
      findings: digests.findings,
    }).toStrictEqual({
      core: text,
      findings: [],
    });
  });

  // Beside the filler the part holds 9 bytes: "# Core", a paragraph break and
  // the closing newline; Ω takes two bytes of UTF-8.
  it.each([
    {
      filler: 'a'.repeat(3491),
      findings: [],
      name: '3,500 bytes',
    },
    {
      filler: 'Ω'.repeat(1746),
      findings: [
        {
          message: 'makes a core part of 3501 bytes; the digest holds at most 3500 of core',
          path: CORE,
        },
      ],
      name: '3,501 bytes in 1,755 characters',
    },
  ])(
    'should report core only past 3,500 UTF-8 bytes when its part holds $name',
    ({ filler, findings }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        [CORE]: coreFile(`# Core\n\n${filler}\n`),
      });

      // Act
      const digests = generateDigests(input);

      // Assert
      expect({
        core: digests.core,
        findings: digests.findings,
      }).toStrictEqual({
        core: `# Core\n\n${filler}\n`,
        findings,
      });
    },
  );
});
