import { describe, expect, it } from 'bun:test';

import { budgetedBodyOf } from '../digest-body.utils';

const HEADING = '⚠️ Warnings';
const NOTE_OF_ONE =
  '1 more line of the block list did not fit; constitution.yaml names every block.';
const NOTE_OF_TWO =
  '2 more lines of the block list did not fit; constitution.yaml names every block.';

// Lines of warnings that take 499, 333, 400, 700 and 20 bytes.
const m489 = `- wiring: ${'w'.repeat(489)}`;
const m323 = `- wiring: ${'w'.repeat(323)}`;
const m390 = `- wiring: ${'w'.repeat(390)}`;
const m690 = `- wiring: ${'w'.repeat(690)}`;
const m10 = `- wiring: ${'w'.repeat(10)}`;

// Core of one line that, with its line break, takes 9000 bytes of the digest's 9400.
const largeCore = 'c'.repeat(8999);

describe('budgetedBodyOf', () => {
  it.each([
    {
      condition: 'a session starts with warnings, one block and a block list',
      core: '# Core\n\nThe rules.\n',
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
      blockList: [
        '- ui: the screens.',
        '- api: the endpoints.',
      ],
      isStartup: true,
      warnings: [
        '- unknown: nope is not a block',
        '- wiring: cannot check the wiring',
      ],
    },
    {
      condition: 'a subagent starts and core has front matter, blank edges and carriage returns',
      core: '---\r\nid: core\r\n---\r\n\r\n# Core\r\n\r\nThe rules.\r\n\r\n',
      body: [
        HEADING,
        '- config: constitution.yaml has no check',
        '',
        '# Core',
        '',
        'The rules.',
      ],
      blockList: [],
      isStartup: false,
      warnings: [
        '- config: constitution.yaml has no check',
      ],
    },
    {
      condition: 'core is blank and nothing comes before the block list',
      core: '\n\n',
      body: [
        '- ui: the screens.',
      ],
      blockList: [
        '- ui: the screens.',
      ],
      isStartup: false,
      warnings: [],
    },
    {
      condition: 'core is blank and the block list empty after the warnings',
      core: '',
      body: [
        HEADING,
        '- config: constitution.yaml has no check',
      ],
      blockList: [],
      isStartup: false,
      warnings: [
        '- config: constitution.yaml has no check',
      ],
    },
    {
      condition: "core's front matter is never closed",
      core: '---\nid: core\n# Core\n',
      body: [
        '- ui: the screens.',
      ],
      blockList: [
        '- ui: the screens.',
      ],
      isStartup: false,
      warnings: [],
    },
    {
      condition: 'a rule line of core comes after its first line',
      core: 'Intro\n---\nMore\n',
      body: [
        'Intro',
        '---',
        'More',
      ],
      blockList: [],
      isStartup: false,
      warnings: [],
    },
  ])(
    'should give the warnings, core and the block list when $condition',
    ({ blockList, body, core, isStartup, warnings }) => {
      // Arrange
      const contents = {
        blockList,
        core,
        isStartup,
        warnings,
      };

      // Act
      const given = budgetedBodyOf(contents);

      // Assert
      expect(given).toStrictEqual(body);
    },
  );

  it.each([
    {
      body: [
        HEADING,
        m489,
        m489,
        'and 1 more',
      ],
      condition: 'two lines fill the 1000 bytes exactly',
      warnings: [
        m489,
        m489,
        m10,
      ],
    },
    {
      body: [
        HEADING,
        m323,
        m323,
        'and 1 more',
      ],
      condition: 'each line costs its line break too',
      warnings: [
        m323,
        m323,
        m323,
      ],
    },
    {
      body: [
        HEADING,
        m390,
        'and 2 more',
      ],
      condition: 'a shorter line follows one that does not fit',
      warnings: [
        m390,
        m690,
        m10,
      ],
    },
  ])(
    'should give the warnings that fit in 1000 bytes and count the rest when $condition',
    ({ body, warnings }) => {
      // Arrange
      const contents = {
        blockList: [],
        core: '',
        isStartup: false,
        warnings,
      };

      // Act
      const given = budgetedBodyOf(contents);

      // Assert
      expect(given).toStrictEqual(body);
    },
  );

  it.each([
    {
      body: [
        largeCore,
        '',
        'x'.repeat(198),
        NOTE_OF_ONE,
      ],
      condition: "the first line fits exactly after core's section",
      core: largeCore,
      blockList: [
        'x'.repeat(198),
        'y',
      ],
    },
    {
      body: [
        largeCore,
        '',
        NOTE_OF_TWO,
      ],
      condition: 'the blank line before the list leaves no room for its first line',
      core: largeCore,
      blockList: [
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
      blockList: [
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
      blockList: [
        'a'.repeat(9199),
        'b',
      ],
    },
  ])(
    'should give the block list as far as 9400 bytes, less 200 for the note, let it when $condition',
    ({ blockList, body, core }) => {
      // Arrange
      const contents = {
        blockList,
        core,
        isStartup: false,
        warnings: [],
      };

      // Act
      const given = budgetedBodyOf(contents);

      // Assert
      expect(given).toStrictEqual(body);
    },
  );
});
