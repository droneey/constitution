import { describe, expect, it } from 'bun:test';

import type { Files } from '../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
  rule,
  textOf,
  without,
} from '../../../../../__tests__/constitution.fixtures';
import {
  GOLDEN_CORE,
  GOLDEN_INDEX,
} from '../../../../../__tests__/valid-digests.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { generateDigests } from '../generate-digests.use-case';

const CORE = 'blocks/core/core.md';
const PRINCIPLES = 'blocks/core/principles.md';
const LINGUI = 'blocks/implementations/lingui/lingui.md';
const LAWS = 'Laws: dependencies-point-inward.';

const coreFile = (body: string): string =>
  mainFile({
    body,
    chapters: [
      'principles.md',
    ],
    id: 'core',
    kind: 'core',
  });

const implementation = (input: { extends: string; id: string }): Files => ({
  [`blocks/implementations/${input.id}/${input.id}.md`]: mainFile({
    body: `# ${input.id}\n`,
    extends: input.extends,
    id: input.id,
    kind: 'implementation',
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
      condition: 'a rule has a check that is no test, review or tool',
      files: {
        [PRINCIPLES]: `# Principles\n\n${rule({
          check: 'by eye',
          slug: 'dependencies-point-inward',
        })}`,
      },
      key: 'rule\tdependencies-point-inward',
      record:
        'rule\tdependencies-point-inward\tcore\tblocks/core/principles.md\t\tMUST\t\t\t\tarchitecture\tThe dependencies-point-inward rule holds.',
      what: 'an empty check kind and role',
    },
    {
      condition: 'the chain of bases comes back to the block',
      files: CYCLE,
      key: 'block\talpha',
      record:
        'block\talpha\timplementation\tThe alpha block.\t\t\t\tbeta\tfalse\tbeta\t\t\tbeta\t',
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
        'block\tgamma\timplementation\tThe gamma block.\t\t\t\talpha\tfalse\t\t\t\talpha beta\t',
      what: 'each ancestor once',
    },
    {
      condition: 'a block extends an id no block has',
      files: implementation({
        extends: 'ghost',
        id: 'orphan',
      }),
      key: 'block\torphan',
      record:
        'block\torphan\timplementation\tThe orphan block.\t\t\t\tghost\tfalse\t\t\t\tghost\t',
      what: 'the unknown base as the only ancestor',
    },
    {
      condition:
        "a with/ rule's statement links relatively and runs past one sentence",
      files: {
        'blocks/domains/ui/with/remote-data.md': `# Seam\n\n${rule({
          slug: 'seam-rule',
          statement:
            'A write rolls back to [the ui block](../ui.md). It keeps the error.',
        })}`,
      },
      key: 'rule\tseam-rule',
      record:
        'rule\tseam-rule\tui\tblocks/domains/ui/with/remote-data.md\tremote-data\tMUST\treview\t\t\tarchitecture\tA write rolls back to [the ui block](blocks/domains/ui/ui.md).',
      what: 'the first sentence with its link read from the root',
    },
    {
      condition: 'a Requirements row is partial with a note',
      files: {
        [LINGUI]: textOf({
          files: validFiles(),
          path: LINGUI,
        }).replace('| met |', '| partial: no ordinals |'),
      },
      key: 'answer\tlingui',
      record: 'answer\tlingui\ti18n-plurals-by-cldr\tpartial',
      what: 'the status partial',
    },
  ])(
    'should write $what in the record when $condition',
    ({ files, key, record }) => {
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
    },
  );

  it('should write an empty core part without a finding when there is no core', () => {
    // Arrange
    const input = checkInputOf(
      without({
        files: without({
          files: validFiles(),
          path: CORE,
        }),
        path: PRINCIPLES,
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
      condition: 'core.md has no body',
      files: {
        ...validFiles(),
        [CORE]: coreFile(''),
      },
      text: `${LAWS}\n`,
    },
    {
      condition: 'principles holds two MUST rules',
      files: {
        ...validFiles(),
        [CORE]: coreFile('# Core\n'),
        [PRINCIPLES]: `# Principles\n\n${rule({
          slug: 'names-say-what',
        })}\n${rule({
          slug: 'dependencies-point-inward',
        })}`,
      },
      text: '# Core\n\nLaws: names-say-what, dependencies-point-inward.\n',
    },
    {
      condition: 'principles holds only SHOULD and MAY rules',
      files: {
        ...validFiles(),
        [CORE]: coreFile('# Core\n'),
        [PRINCIPLES]: `# Principles\n\n${rule({
          level: 'SHOULD',
          slug: 'names-say-what',
        })}\n${rule({
          level: 'MAY',
          slug: 'comments-say-why',
        })}`,
      },
      text: '# Core\n',
    },
  ])(
    'should write core.md and the MUST rules of principles as laws in the core part when $condition',
    ({ files, text }) => {
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
    },
  );

  // Beside the filler the part holds 43 bytes: "# Core", two paragraph breaks,
  // the laws line and the closing newline; Ω takes two bytes of UTF-8.
  it.each([
    {
      filler: 'a'.repeat(3457),
      findings: [],
      name: '3,500 bytes',
    },
    {
      filler: 'Ω'.repeat(1729),
      findings: [
        {
          message:
            'makes a core part of 3501 bytes; the digest holds at most 3500 of core',
          path: CORE,
        },
      ],
      name: '3,501 bytes in 1,772 characters',
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
        core: `# Core\n\n${filler}\n\n${LAWS}\n`,
        findings,
      });
    },
  );
});
