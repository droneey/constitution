import { describe, expect, it } from 'bun:test';

import fc from 'fast-check';

import type { PresetFileRead } from '../../../domain/contracts';
import { PresetFileReadStatus } from '../../../domain/contracts';
import { PresetValue, ValueKind } from '../../../domain/entities';
import { createYamlPresetFileParser } from '../yaml-preset-file-parser.adapter';

const parser = createYamlPresetFileParser();

// Texts of the pieces a preset file is made of, its marks, tags, anchors and flows among them, and
// texts of any characters.
const texts = fc.oneof(
  fc
    .array(
      fc.constantFrom(
        'a:',
        ' b',
        '\n',
        '  ',
        '- ',
        '? ',
        ': ',
        '!default ',
        '!replace ',
        '!sorted ',
        '!words ',
        '!env ',
        '!!str ',
        '&x ',
        '*x',
        '[',
        ']',
        '{',
        '}',
        ', ',
        '~',
        '1',
        'true',
        "'",
        '"',
        '# c',
        '|',
        '>',
        '---',
      ),
      {
        maxLength: 24,
      },
    )
    .map((pieces) => pieces.join('')),
  fc.string({
    unit: 'binary',
  }),
);

// The invariant: any text reads as a value or as unparsed, and never throws.
const isReadOrUnparsed = (text: string): boolean => {
  const read = parser.parse(text);

  return (
    read.status === PresetFileReadStatus.Parsed || read.status === PresetFileReadStatus.Unparsed
  );
};

describe('createYamlPresetFileParser', () => {
  it('should read the maps as maps, the marks as marks, and any other value as it is', () => {
    // Arrange
    const text = [
      'biome:',
      "  '*':",
      '    typescript:',
      '      biome.json:',
      '        width: 100',
      '        rules: !replace',
      '          - a',
      '          - slot: b',
      '        randomize: !default true',
      "        quoted: !default 'no'",
      '        layout: !default {style: space}',
      '        7: seven',
      '        version: !!str 1',
      '        list:',
      '          - {name: lint}',
      '        scripts: !sorted',
      '          lint: biome check',
      '          check: !default bun run check',
      '        command: !words',
      '          - bun run',
      '          - slot: checks',
      '      .gitignore: !default',
      '        - dist/',
    ].join('\n');

    // Act
    const read = parser.parse(text);

    // Assert
    expect(read).toStrictEqual({
      status: PresetFileReadStatus.Parsed,
      value: PresetValue.mapOf([
        {
          key: 'biome',
          value: PresetValue.mapOf([
            {
              key: '*',
              value: PresetValue.mapOf([
                {
                  key: 'typescript',
                  value: PresetValue.mapOf([
                    {
                      key: 'biome.json',
                      value: PresetValue.mapOf([
                        {
                          key: 'width',
                          value: PresetValue.plain(100),
                        },
                        {
                          key: 'rules',
                          value: {
                            isWords: false,
                            kind: ValueKind.Replace,
                            setting: [
                              'a',
                              {
                                slot: 'b',
                              },
                            ],
                          },
                        },
                        {
                          key: 'randomize',
                          value: {
                            isWords: false,
                            kind: ValueKind.Default,
                            setting: true,
                          },
                        },
                        {
                          key: 'quoted',
                          value: {
                            isWords: false,
                            kind: ValueKind.Default,
                            setting: 'no',
                          },
                        },
                        {
                          key: 'layout',
                          value: {
                            isWords: false,
                            kind: ValueKind.Default,
                            setting: {
                              style: 'space',
                            },
                          },
                        },
                        {
                          key: '7',
                          value: PresetValue.plain('seven'),
                        },
                        {
                          key: 'version',
                          value: PresetValue.plain('1'),
                        },
                        {
                          key: 'list',
                          value: PresetValue.plain([
                            {
                              name: 'lint',
                            },
                          ]),
                        },
                        {
                          key: 'scripts',
                          value: PresetValue.sortedMapOf([
                            {
                              key: 'lint',
                              value: PresetValue.plain('biome check'),
                            },
                            {
                              key: 'check',
                              value: {
                                isWords: false,
                                kind: ValueKind.Default,
                                setting: 'bun run check',
                              },
                            },
                          ]),
                        },
                        {
                          key: 'command',
                          value: PresetValue.wordsOf([
                            'bun run',
                            {
                              slot: 'checks',
                            },
                          ]),
                        },
                      ]),
                    },
                    {
                      key: '.gitignore',
                      value: {
                        isWords: false,
                        kind: ValueKind.Default,
                        setting: [
                          'dist/',
                        ],
                      },
                    },
                  ]),
                },
              ]),
            },
          ]),
        },
      ]),
    });
  });

  it('should read an empty preset file as a map without pairs', () => {
    // Act
    const read = parser.parse('# nothing yet\n');

    // Assert
    expect(read).toStrictEqual({
      status: PresetFileReadStatus.Parsed,
      value: PresetValue.mapOf([]),
    });
  });

  it.each([
    {
      condition: 'it is a number the core schema writes in hexadecimal',
      setting: 31,
      text: '0x1f',
    },
    {
      condition: 'it is quoted, though it spells a number',
      setting: '1',
      text: "'1'",
    },
    {
      condition: 'it opens as a document ends',
      setting: '... b',
      text: '... b',
    },
    {
      condition: 'it opens as a document starts',
      setting: '--- b',
      text: '--- b',
    },
  ])(
    'should read a marked text as the core schema types it when $condition',
    ({ setting, text }) => {
      // Act
      const read = parser.parse(`a: !default ${text}`);

      // Assert
      expect(read).toStrictEqual({
        status: PresetFileReadStatus.Parsed,
        value: PresetValue.mapOf([
          {
            key: 'a',
            value: {
              isWords: false,
              kind: ValueKind.Default,
              setting,
            },
          },
        ]),
      });
    },
  );

  it.each<{
    condition: string;
    read: PresetFileRead;
    text: string;
  }>([
    {
      condition: 'its YAML does not parse',
      read: {
        line: 3,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a:\n  - [b\n',
    },
    {
      condition: 'a map holds a key twice',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a: 1\na: 2\n',
    },
    {
      condition: 'a value is an alias',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a: &one 1\nb: *one\n',
    },
    {
      condition: 'a value is left empty',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a:\n  b:\n',
    },
    {
      condition: 'a list holds a null',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a:\n  - ~\n',
    },
    {
      condition: 'a tag is none of the marks',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a:\n  b: !env HOME\n',
    },
    {
      condition: 'a mark lies inside a mark',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a: !replace\n  b: !default 1\n',
    },
    {
      condition: 'an item of a list carries a mark',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a:\n  - !replace 1\n',
    },
    {
      condition: 'a key is no text',
      read: {
        line: 1,
        status: PresetFileReadStatus.Unparsed,
      },
      text: '? [a, b]\n: 1\n',
    },
    {
      condition: 'a key is a truth',
      read: {
        line: 2,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a: 1\ntrue: 2\n',
    },
    {
      condition: 'the sorted mark tags a text',
      read: {
        line: 1,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a: !sorted b\n',
    },
    {
      condition: 'the words mark tags a map',
      read: {
        line: 1,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a: !words {b: 1}\n',
    },
    {
      condition: 'a mark tags a null',
      read: {
        line: 1,
        status: PresetFileReadStatus.Unparsed,
      },
      text: 'a: !default ~\n',
    },
  ])('should give the line it stops at when $condition', ({ read, text }) => {
    // Act
    const parsed = parser.parse(text);

    // Assert
    expect(parsed).toStrictEqual(read);
  });

  it('should read any text as a value or as unparsed, and never throw', () => {
    // Act
    const run = fc.check(fc.property(texts, isReadOrUnparsed));

    // Assert
    expect(run.counterexample).toBeNull();
  });
});
