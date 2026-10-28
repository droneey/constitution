import { describe, expect, it } from 'bun:test';

import fc from 'fast-check';

import { ConfigKey } from '#/kernel/constants';
import { ConfigReadStatus } from '#/kernel/entities';

import { createYamlConfigFileParser } from '../yaml-config-file-parser.adapter';
import { overrideOf, parsedConfigOf } from './config-file.fixtures';

const parser = createYamlConfigFileParser();

// Texts of the pieces constitution.yaml is made of, its marks, tags, anchors and flows among them,
// and texts of any characters.
const texts = fc.oneof(
  fc
    .array(
      fc.constantFrom(
        'axes:',
        'domains:',
        'name:',
        'overrides:',
        ' rule: a',
        ' until:',
        'x',
        '\n',
        '\r\n',
        '  ',
        '\t',
        '- ',
        '? ',
        ': ',
        '!!str ',
        '&x ',
        '*x',
        '|',
        '[',
        ']',
        '{',
        '}',
        ', ',
        '~',
        'null',
        '1.10',
        'true',
        '""',
        '#',
        '---',
      ),
    )
    .map((pieces) => pieces.join('')),
  fc.string({
    unit: 'binary',
  }),
);

// The invariant: any text reads as parsed or as unparsed at lines of the text, and never throws.
const isParsedOrUnparsedAtItsLines = (text: string): boolean => {
  const read = parser.parse(text);
  const lineCount = text.split('\n').length;

  return (
    read.status === ConfigReadStatus.Parsed ||
    (read.lines.length > 0 && read.lines.every((line) => line >= 1 && line <= lineCount))
  );
};

describe('createYamlConfigFileParser', () => {
  it.each([
    {
      condition: 'the file is empty',
      expected: parsedConfigOf(),
      text: '',
    },
    {
      condition: 'the file holds only comments, blank lines and the document marker',
      expected: parsedConfigOf(),
      text: '# a\n---\n\n# b\n',
    },
    {
      condition: 'the file holds every kind of key and keys of its own that hold any YAML',
      expected: parsedConfigOf({
        items: [
          {
            key: ConfigKey.Axes,
            text: 'foundation',
          },
          {
            key: ConfigKey.Axes,
            text: 'architecture',
          },
          {
            key: ConfigKey.Domains,
            text: 'version-control',
          },
          {
            key: ConfigKey.Domains,
            text: 'web',
          },
        ],
        keys: [
          'axes',
          'domains',
          'check',
          'packages',
          'packs',
          'overrides',
        ],
        overrides: [
          overrideOf({
            level: 'MAY',
            line: 12,
            reason: "it's # no comment",
            rule: 'core/y',
            until: '2027-01-01',
          }),
        ],
      }),
      text: '# the project\n---\naxes: [foundation, architecture] # the axes\ndomains:\n  - version-control\n  - "web"   # quoted\ncheck: bun run check\npackages:\n  web: {languages: [typescript]}\npacks: []\noverrides:\n  - rule: core/y\n    level: MAY\n    reason: "it\'s # no comment"\n    until: 2027-01-01\n',
    },
    {
      condition: 'items that read as numbers, nulls or booleans unquoted are quoted',
      expected: parsedConfigOf({
        items: [
          {
            key: ConfigKey.Domains,
            text: '1.10',
          },
          {
            key: ConfigKey.Domains,
            text: 'null',
          },
          {
            key: ConfigKey.Domains,
            text: "e'f",
          },
          {
            key: ConfigKey.Domains,
            text: 'g"h',
          },
        ],
        keys: [
          'domains',
        ],
      }),
      text: "domains:\n  - '1.10'\n  - \"null\"\n  - 'e''f'\n  - \"g\\\"h\"\n",
    },
    {
      condition: 'lists, overrides and a key of its own are given no value or null',
      expected: parsedConfigOf({
        empties: [
          ConfigKey.Domains,
          ConfigKey.Platforms,
          ConfigKey.Overrides,
        ],
        items: [
          {
            key: ConfigKey.Languages,
            text: 'ts',
          },
        ],
        keys: [
          'domains',
          'languages',
          'platforms',
          'overrides',
          'check',
        ],
      }),
      text: 'domains:\nlanguages:\n  - ts\nplatforms: null\noverrides: ~\ncheck:\n',
    },
    {
      condition: 'a flow list ends with a comma and overrides are an empty flow list',
      expected: parsedConfigOf({
        items: [
          {
            key: ConfigKey.Axes,
            text: 'a',
          },
          {
            key: ConfigKey.Axes,
            text: 'b',
          },
        ],
        keys: [
          'axes',
          'overrides',
        ],
      }),
      text: 'axes: [ a ,b,]\noverrides: []\n',
    },
    {
      condition: 'name names a package in quotes, a comment after it',
      expected: parsedConfigOf({
        keys: [
          'name',
        ],
        name: '@acme/web',
      }),
      text: "name: '@acme/web' # the package\n",
    },
    {
      condition: 'overrides leave fields out or empty, each at the line of its first field',
      expected: parsedConfigOf({
        keys: [
          'overrides',
        ],
        overrides: [
          overrideOf({
            line: 2,
            rule: 'a',
          }),
          overrideOf({
            level: 'MUST',
            line: 3,
            reason: 'r',
          }),
        ],
      }),
      text: "overrides:\n- rule: a\n- level: MUST\n  until:\n  reason: 'r'\n",
    },
    {
      condition: 'lines end with CRLF',
      expected: parsedConfigOf({
        items: [
          {
            key: ConfigKey.Axes,
            text: 'a',
          },
        ],
        keys: [
          'axes',
          'name',
        ],
        name: 'x',
      }),
      text: 'axes:\r\n  - a\r\nname: x\r\n',
    },
  ])('should read the file when $condition', ({ expected, text }) => {
    // Act
    const read = parser.parse(text);

    // Assert
    expect(read).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'is left empty',
      text: 'name:\n',
    },
    {
      condition: 'is null',
      text: 'name: null\n',
    },
    {
      condition: 'is a tilde',
      text: 'name: ~\n',
    },
  ])('should name no package when name $condition', ({ text }) => {
    // Act
    const read = parser.parse(text);

    // Assert
    expect(read).toStrictEqual(
      parsedConfigOf({
        keys: [
          'name',
        ],
      }),
    );
  });

  it.each([
    {
      condition: 'a line is indented with a tab',
      lines: [
        2,
      ],
      text: 'axes:\n\t- a\n',
    },
    {
      condition: 'a key is written twice',
      lines: [
        2,
      ],
      text: 'name: a\nname: b\n',
    },
    {
      condition: 'the file holds a second document',
      lines: [
        2,
      ],
      text: 'axes: [a]\n---\nb: c\n',
    },
    {
      condition: 'a flow list never closes',
      lines: [
        4,
      ],
      text: 'name: x\naxes: [a,\n  b\n',
    },
    {
      condition: 'it holds an anchor, an alias, a tag and a block scalar',
      lines: [
        1,
        2,
        3,
        4,
      ],
      text: 'name: &a x\npacks: [*a]\ndomains: !t [b]\nplatforms: |\n  c\n',
    },
    {
      condition: 'name is a block scalar',
      lines: [
        1,
      ],
      text: 'name: |\n  web\n',
    },
    {
      condition: 'an alias names no anchor',
      lines: [
        1,
      ],
      text: 'packs: [*a]\n',
    },
    {
      condition: 'it is no mapping',
      lines: [
        1,
      ],
      text: '- a\n',
    },
    {
      condition: 'a list is a plain scalar and overrides are one',
      lines: [
        1,
        2,
      ],
      text: 'axes: a\noverrides: x\n',
    },
    {
      condition: 'items are collections or empty',
      lines: [
        3,
        4,
        5,
        6,
      ],
      text: 'domains:\n  - a\n  - [b]\n  - {c: d}\n  -\nplatforms: [e, ""]\n',
    },
    {
      condition: 'items read as a number, a null and a boolean',
      lines: [
        2,
        3,
        4,
      ],
      text: 'domains:\n  - 1.10\n  - null\n  - true\n',
    },
    {
      condition: 'name and a field of an override are empty texts',
      lines: [
        1,
        3,
      ],
      text: 'name: ""\noverrides:\n  - rule: \'\'\n',
    },
    {
      condition: 'name is a list',
      lines: [
        1,
      ],
      text: 'name: [a]\n',
    },
    {
      condition: 'an override is no mapping and another holds a field of no override',
      lines: [
        2,
        4,
      ],
      text: 'overrides:\n  - a\n  - rule: b\n    name: c\n',
    },
    {
      condition: 'its problems lie on several lines',
      lines: [
        1,
        2,
        3,
      ],
      text: 'name: [x]\naxes: a\nplatforms: [*b]\n',
    },
  ])('should give every line the file fails at when $condition', ({ lines, text }) => {
    // Act
    const read = parser.parse(text);

    // Assert
    expect(read).toStrictEqual({
      lines,
      status: ConfigReadStatus.Unparsed,
    });
  });

  it('should read any text as parsed or as unparsed at lines of the text, and never throw', () => {
    // Act
    const run = fc.check(fc.property(texts, isParsedOrUnparsedAtItsLines));

    // Assert
    expect(run.counterexample).toBeNull();
  });
});
