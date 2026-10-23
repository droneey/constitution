import { describe, expect, it } from 'bun:test';

import { ReleaseNotice, WarningCode } from '../../../../entities';
import { digestOf, noticeOf, unparsedDigestOf } from '../digest.utils';

const ARCHIVE = '/work/project/.droneey/constitution';
const RELEASE =
  "The Droneey Constitution 1.0.0 supplies this repository's rules. Block files live under /work/project/.droneey/constitution.";
const ONE_BLOCK = 'constitution.yaml makes 1 block active.';
const HEADING = '⚠️ Warnings';
const NOTE_OF_ONE =
  '1 more line of the block list did not fit; constitution.yaml names every block.';
const NOTE_OF_TWO =
  '2 more lines of the block list did not fit; constitution.yaml names every block.';

// Warnings whose lines, "- wiring: <message>", take 499, 333, 400, 700 and 20 bytes.
const M489 = 'w'.repeat(489);
const M323 = 'w'.repeat(323);
const M390 = 'w'.repeat(390);
const M690 = 'w'.repeat(690);
const M10 = 'w'.repeat(10);

// Core of one line that, with its line break, takes 9000 bytes of the digest's 9400.
const LARGE_CORE = 'c'.repeat(8999);

describe('digestOf', () => {
  it.each([
    {
      condition: 'a session starts with warnings, one block and a block list',
      count: 1,
      core: '# Core\n\nThe rules.\n',
      digest: {
        body: [
          '⚠️ Warnings — tell the user at the start of the session',
          '- unknown: nope is not a block',
          '- wiring: cannot check the wiring',
          '',
          '# Core',
          '',
          'The rules.',
          '',
          '- ui: the screens.',
          '- api: the endpoints.',
        ],
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      },
      index: [
        '- ui: the screens.',
        '- api: the endpoints.',
      ],
      isStartup: true,
      warnings: [
        {
          code: WarningCode.Unknown,
          message: 'nope is not a block',
        },
        {
          code: WarningCode.Wiring,
          message: 'cannot check the wiring',
        },
      ],
    },
    {
      condition: 'a subagent starts and core has front matter, blank edges and carriage returns',
      count: 2,
      core: '---\r\nid: core\r\n---\r\n\r\n# Core\r\n\r\nThe rules.\r\n\r\n',
      digest: {
        body: [
          HEADING,
          '- config: constitution.yaml has no check',
          '',
          '# Core',
          '',
          'The rules.',
        ],
        head: [
          RELEASE,
          'constitution.yaml makes 2 blocks active.',
        ],
      },
      index: [],
      isStartup: false,
      warnings: [
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no check',
        },
      ],
    },
    {
      condition: 'core is blank and nothing comes before the block list',
      count: 1,
      core: '\n\n',
      digest: {
        body: [
          '- ui: the screens.',
        ],
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      },
      index: [
        '- ui: the screens.',
      ],
      isStartup: false,
      warnings: [],
    },
    {
      condition: 'core is blank and the block list empty after the warnings',
      count: 1,
      core: '',
      digest: {
        body: [
          HEADING,
          '- config: constitution.yaml has no check',
        ],
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      },
      index: [],
      isStartup: false,
      warnings: [
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no check',
        },
      ],
    },
    {
      condition: "core's front matter is never closed",
      count: 1,
      core: '---\nid: core\n# Core\n',
      digest: {
        body: [
          '- ui: the screens.',
        ],
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      },
      index: [
        '- ui: the screens.',
      ],
      isStartup: false,
      warnings: [],
    },
    {
      condition: 'a rule line of core comes after its first line',
      count: 1,
      core: 'Intro\n---\nMore\n',
      digest: {
        body: [
          'Intro',
          '---',
          'More',
        ],
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      },
      index: [],
      isStartup: false,
      warnings: [],
    },
  ])(
    'should give the release, the count, the warnings, core and the block list when $condition',
    ({ core, count, digest, index, isStartup, warnings }) => {
      // Arrange
      const release = {
        archive: ARCHIVE,
        installed: '1.0.0',
      };

      // Act
      const given = digestOf({
        ...release,
        core,
        count,
        index,
        isStartup,
        warnings,
      });

      // Assert
      expect(given).toStrictEqual(digest);
    },
  );

  it.each([
    {
      body: [
        HEADING,
        `- wiring: ${M489}`,
        `- wiring: ${M489}`,
        'and 1 more',
      ],
      condition: 'two lines fill the 1000 bytes exactly',
      messages: [
        M489,
        M489,
        M10,
      ],
    },
    {
      body: [
        HEADING,
        `- wiring: ${M323}`,
        `- wiring: ${M323}`,
        'and 1 more',
      ],
      condition: 'each line costs its line break too',
      messages: [
        M323,
        M323,
        M323,
      ],
    },
    {
      body: [
        HEADING,
        `- wiring: ${M390}`,
        'and 2 more',
      ],
      condition: 'a shorter line follows one that does not fit',
      messages: [
        M390,
        M690,
        M10,
      ],
    },
  ])(
    'should give the warnings that fit in 1000 bytes and count the rest when $condition',
    ({ body, messages }) => {
      // Arrange
      const warnings = messages.map((message) => ({
        code: WarningCode.Wiring,
        message,
      }));

      // Act
      const given = digestOf({
        archive: ARCHIVE,
        core: '',
        count: 1,
        index: [],
        installed: '1.0.0',
        isStartup: false,
        warnings,
      });

      // Assert
      expect(given).toStrictEqual({
        body,
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      });
    },
  );

  it.each([
    {
      body: [
        LARGE_CORE,
        '',
        'x'.repeat(198),
        NOTE_OF_ONE,
      ],
      condition: "the first line fits exactly after core's section",
      core: LARGE_CORE,
      index: [
        'x'.repeat(198),
        'y',
      ],
    },
    {
      body: [
        LARGE_CORE,
        '',
        NOTE_OF_TWO,
      ],
      condition: 'the blank line before the list leaves no room for its first line',
      core: LARGE_CORE,
      index: [
        'x'.repeat(199),
        'y',
      ],
    },
    {
      body: [
        'a'.repeat(9000),
        'b'.repeat(198),
        NOTE_OF_ONE,
      ],
      condition: 'a later line fits exactly',
      core: '',
      index: [
        'a'.repeat(9000),
        'b'.repeat(198),
        'c',
      ],
    },
    {
      body: [
        'a'.repeat(9199),
        NOTE_OF_ONE,
      ],
      condition: 'the first line fits exactly in an empty digest',
      core: '',
      index: [
        'a'.repeat(9199),
        'b',
      ],
    },
  ])(
    'should give the block list as far as 9400 bytes, less 200 for the note, let it when $condition',
    ({ body, core, index }) => {
      // Arrange
      const release = {
        archive: ARCHIVE,
        installed: '1.0.0',
      };

      // Act
      const given = digestOf({
        ...release,
        core,
        count: 1,
        index,
        isStartup: false,
        warnings: [],
      });

      // Assert
      expect(given).toStrictEqual({
        body,
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      });
    },
  );
});

describe('unparsedDigestOf', () => {
  it('should give core alone and the line constitution.yaml stops at when it does not parse', () => {
    // Arrange
    const core = '---\nid: core\n---\n\n# Core\n';

    // Act
    const given = unparsedDigestOf({
      archive: ARCHIVE,
      core,
      installed: '1.0.0',
      line: 4,
    });

    // Assert
    expect(given).toStrictEqual({
      body: [
        '# Core',
      ],
      head: [
        RELEASE,
        'constitution.yaml does not parse at line 4; only core applies.',
      ],
    });
  });
});

describe('noticeOf', () => {
  it.each([
    {
      condition: 'no release is installed',
      format: 0,
      head: [
        'The Droneey Constitution is not installed in this repository: /work/project/.droneey/constitution does not exist, so no rules are given.',
        'Tell the user to run mise install, which installs the release mise.toml pins as github:droneey/constitution and links it there.',
      ],
      notice: ReleaseNotice.Missing,
    },
    {
      condition: 'the release is of a newer block format',
      format: 4,
      head: [
        'The Droneey Constitution in /work/project/.droneey/constitution has block format 4, newer than this plugin reads, so no rules are given.',
        'Tell the user to update the Constitution plugin: claude plugin marketplace update droneey, then claude plugin update constitution@droneey.',
      ],
      notice: ReleaseNotice.Newer,
    },
    {
      condition: 'the release is of an older block format',
      format: 2,
      head: [
        'The Droneey Constitution in /work/project/.droneey/constitution is older than block format 3, the oldest this plugin reads, so no rules are given.',
        "Tell the user to raise the Constitution pin in this project's mise.toml and run mise install.",
      ],
      notice: ReleaseNotice.Older,
    },
  ])('should give the reason alone when $condition', ({ format, head, notice }) => {
    // Arrange
    const release = {
      archive: ARCHIVE,
      format,
    };

    // Act
    const given = noticeOf({
      ...release,
      notice,
    });

    // Assert
    expect(given).toStrictEqual({
      body: [],
      head,
    });
  });
});
