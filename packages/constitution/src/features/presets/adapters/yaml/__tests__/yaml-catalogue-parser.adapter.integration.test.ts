import { describe, expect, it } from 'bun:test';

import type { CatalogueRead } from '../../../domain/contracts';
import { CatalogueReadStatus } from '../../../domain/contracts';
import { PresetValue, ValueKind } from '../../../domain/entities';
import { createYamlCatalogueParser } from '../yaml-catalogue-parser.adapter';

const parser = createYamlCatalogueParser();

describe('createYamlCatalogueParser', () => {
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
      '      .gitignore: !default',
      '        - dist/',
    ].join('\n');

    // Act
    const read = parser.parse(text);

    // Assert
    expect(read).toStrictEqual({
      status: CatalogueReadStatus.Parsed,
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
                            kind: ValueKind.Default,
                            setting: true,
                          },
                        },
                        {
                          key: 'quoted',
                          value: {
                            kind: ValueKind.Default,
                            setting: 'no',
                          },
                        },
                        {
                          key: 'layout',
                          value: {
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
                      ]),
                    },
                    {
                      key: '.gitignore',
                      value: {
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

  it('should read an empty catalogue as a map without pairs', () => {
    // Act
    const read = parser.parse('# nothing yet\n');

    // Assert
    expect(read).toStrictEqual({
      status: CatalogueReadStatus.Parsed,
      value: PresetValue.mapOf([]),
    });
  });

  it.each<{
    condition: string;
    read: CatalogueRead;
    text: string;
  }>([
    {
      condition: 'its YAML does not parse',
      read: {
        line: 3,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a:\n  - [b\n',
    },
    {
      condition: 'a map holds a key twice',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a: 1\na: 2\n',
    },
    {
      condition: 'a value is an alias',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a: &one 1\nb: *one\n',
    },
    {
      condition: 'a value is left empty',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a:\n  b:\n',
    },
    {
      condition: 'a list holds a null',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a:\n  - ~\n',
    },
    {
      condition: 'a tag is none of the marks',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a:\n  b: !env HOME\n',
    },
    {
      condition: 'a mark lies inside a mark',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a: !replace\n  b: !default 1\n',
    },
    {
      condition: 'an item of a list carries a mark',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a:\n  - !replace 1\n',
    },
    {
      condition: 'a key is no text',
      read: {
        line: 1,
        status: CatalogueReadStatus.Unparsed,
      },
      text: '? [a, b]\n: 1\n',
    },
    {
      condition: 'a key is a truth',
      read: {
        line: 2,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a: 1\ntrue: 2\n',
    },
    {
      condition: 'a mark tags a null',
      read: {
        line: 1,
        status: CatalogueReadStatus.Unparsed,
      },
      text: 'a: !default ~\n',
    },
  ])('should give the line it stops at when $condition', ({ read, text }) => {
    // Act
    const parsed = parser.parse(text);

    // Assert
    expect(parsed).toStrictEqual(read);
  });
});
