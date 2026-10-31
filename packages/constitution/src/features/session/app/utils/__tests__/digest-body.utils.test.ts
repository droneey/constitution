import { describe, expect, it } from 'bun:test';

import {
  mapLinesCutText,
  moreWarningsText,
  STARTUP_WARNINGS_HEADING,
  WARNINGS_HEADING,
} from '../digest.messages';
import { coreBodyOf, digestBodyOf } from '../digest-body.utils';

const duty = [
  'Read the rules.',
];
const blockList = [
  '## Active blocks',
  '- Domains: ui',
];

const m489 = `- wiring: ${'w'.repeat(489)}`;
const m323 = `- wiring: ${'w'.repeat(323)}`;
const m390 = `- wiring: ${'w'.repeat(390)}`;
const m155 = `- wiring: ${'w'.repeat(155)}`;
const m156 = `- wiring: ${'w'.repeat(156)}`;
const m10 = `- wiring: ${'w'.repeat(10)}`;

const filling9199 = 'a'.repeat(9199);
const filling9200 = 'a'.repeat(9200);
const filling9396 = 'a'.repeat(9396);
const filling9397 = 'a'.repeat(9397);
const filling9399 = 'a'.repeat(9399);
const tail300 = 'b'.repeat(300);
const core9300 = 'c'.repeat(9300);
const map100 = 'm'.repeat(100);
const warning500 = `- ${'w'.repeat(500)}`;

describe('digestBodyOf', () => {
  it('should give core, the duty, the map of the blocks and the warnings, a blank line between each', () => {
    // Arrange
    const input = {
      blockList,
      core: '# Core\n\nThe rules.\n',
      duty,
      isStartup: true,
      warnings: [
        '- unknown: nope is not a block',
      ],
    };

    // Act
    const body = digestBodyOf(input);

    // Assert
    expect(body).toStrictEqual([
      '# Core',
      '',
      'The rules.',
      '',
      'Read the rules.',
      '',
      '## Active blocks',
      '- Domains: ui',
      '',
      STARTUP_WARNINGS_HEADING,
      '- unknown: nope is not a block',
    ]);
  });

  it('should leave out a section that holds no line', () => {
    // Arrange
    const input = {
      blockList: [],
      core: '\n\n',
      duty,
      isStartup: false,
      warnings: [],
    };

    // Act
    const body = digestBodyOf(input);

    // Assert
    expect(body).toStrictEqual(duty);
  });

  it.each([
    {
      condition: 'they fill their share to the byte',
      given: [
        m489,
        m323,
        m155,
      ],
      kept: [
        m489,
        m323,
        m155,
      ],
    },
    {
      condition: 'the third passes their share by one byte',
      given: [
        m489,
        m323,
        m156,
      ],
      kept: [
        m489,
        m323,
        moreWarningsText.one,
      ],
    },
    {
      condition: 'the third passes their share',
      given: [
        m489,
        m323,
        m390,
        m10,
      ],
      kept: [
        m489,
        m323,
        moreWarningsText.many(2),
      ],
    },
  ])(
    'should cut the warnings at their share of the digest, and say how many it left out, when $condition',
    ({ given, kept }) => {
      // Arrange
      const input = {
        blockList: [],
        core: '',
        duty: [],
        isStartup: false,
        warnings: given,
      };

      // Act
      const body = digestBodyOf(input);

      // Assert
      expect(body).toStrictEqual([
        WARNINGS_HEADING,
        ...kept,
      ]);
    },
  );

  it.each([
    {
      blockList: [
        filling9399,
      ],
      body: [
        filling9399,
      ],
      condition: 'the map alone fills the 9,400 bytes to the byte',
      core: '',
      duty: [],
      warnings: [],
    },
    {
      blockList: [
        filling9199,
        tail300,
      ],
      body: [
        filling9199,
        mapLinesCutText.one,
      ],
      condition: 'its first line fills to the byte the room left for the note',
      core: '',
      duty: [],
      warnings: [],
    },
    {
      blockList: [
        filling9200,
        tail300,
      ],
      body: [
        mapLinesCutText.many(2),
      ],
      condition: 'its first line passes by one byte the room left for the note',
      core: '',
      duty: [],
      warnings: [],
    },
    {
      blockList: [
        filling9396,
      ],
      body: [
        'd',
        '',
        filling9396,
      ],
      condition: 'the duty and the blank line before the map leave it room to the byte',
      core: '',
      duty: [
        'd',
      ],
      warnings: [],
    },
    {
      blockList: [
        filling9397,
      ],
      body: [
        'd',
        '',
        mapLinesCutText.one,
      ],
      condition: 'the blank line before the map leaves it one byte too few',
      core: '',
      duty: [
        'd',
      ],
      warnings: [],
    },
    {
      blockList: [
        filling9399,
      ],
      body: [
        mapLinesCutText.one,
        '',
        WARNINGS_HEADING,
        warning500,
      ],
      condition: 'the warnings take their bytes before it',
      core: '',
      duty: [],
      warnings: [
        warning500,
      ],
    },
    {
      blockList: [
        map100,
      ],
      body: [
        core9300,
        '',
        mapLinesCutText.one,
      ],
      condition: 'core, given whole, leaves it no room',
      core: core9300,
      duty: [],
      warnings: [],
    },
  ])(
    'should give the map as far as 9,400 bytes, less 200 for a note of the lines it cut, when $condition',
    ({ blockList: lines, body, core, duty: givenDuty, warnings }) => {
      // Arrange
      const input = {
        blockList: lines,
        core,
        duty: givenDuty,
        isStartup: false,
        warnings,
      };

      // Act
      const given = digestBodyOf(input);

      // Assert
      expect(given).toStrictEqual(body);
    },
  );
});

describe('coreBodyOf', () => {
  it.each([
    {
      condition: 'core has front matter, blank edges and carriage returns',
      core: '---\r\nid: core\r\n---\r\n\r\n# Core\r\n\r\nThe rules.\r\n\r\n',
      lines: [
        '# Core',
        '',
        'The rules.',
      ],
    },
    {
      condition: "core's front matter is never closed, so it holds none",
      core: '---\nid: core\n# Core\n',
      lines: [
        '---',
        'id: core',
        '# Core',
      ],
    },
    {
      condition: 'core is blank',
      core: '\n\n',
      lines: [],
    },
  ])(
    'should give core without its front matter and blank edges when $condition',
    ({ core, lines }) => {
      // Act
      const body = coreBodyOf(core);

      // Assert
      expect(body).toStrictEqual(lines);
    },
  );
});
