import { describe, expect, it } from 'bun:test';

import { ConfigReadStatus } from '../../../domain/entities';
import { createConfigFileParser } from '../config-file-parser.adapter';
import { overrideOf, parsedConfigOf } from './config-file.fixtures';

describe('createConfigFileParser', () => {
  it.each([
    {
      condition: 'the file is empty',
      expected: parsedConfigOf(),
      text: '',
    },
    {
      condition: 'the file holds only comments, blank lines and the document marker',
      expected: parsedConfigOf(),
      text: '# a\n---\n\n \t \n\t# b\n  # c\n',
    },
    {
      condition: 'the file holds every kind of key, comments and the document marker',
      expected: parsedConfigOf({
        apps: [
          'web',
          'api',
        ],
        check: 'bun run check',
        items: [
          {
            app: '',
            key: 'axes',
            text: 'foundation',
          },
          {
            app: '',
            key: 'axes',
            text: 'architecture',
          },
          {
            app: '',
            key: 'domains',
            text: 'version-control',
          },
          {
            app: '',
            key: 'domains',
            text: 'web',
          },
          {
            app: 'web',
            key: 'languages',
            text: 'typescript',
          },
        ],
        keys: [
          'axes',
          'domains',
          'check',
          'packages',
          'packs',
          'overrides',
          'notes',
        ],
        lists: [
          {
            app: '',
            key: 'axes',
          },
          {
            app: '',
            key: 'domains',
          },
          {
            app: 'web',
            key: 'languages',
          },
          {
            app: '',
            key: 'packs',
          },
        ],
        overrides: [
          overrideOf({
            app: 'web',
            level: 'SHOULD',
            line: 13,
            rule: 'core/x',
          }),
          overrideOf({
            level: 'MAY',
            line: 18,
            reason: "it's # no comment",
            rule: 'core/y',
            until: '2027-01-01',
          }),
        ],
      }),
      text: '# the project\n---\naxes: [foundation, architecture] #the axes\ndomains:\n  - version-control\n\n  - "web"   # quoted\ncheck: bun run check\npackages:\n  web:\n    languages: [typescript]\n    overrides:\n      - rule: core/x\n        level: SHOULD\n  api: {}\npacks: []\noverrides:\n  - rule: core/y\n    level: MAY\n    reason: "it\'s # no comment"\n    until: 2027-01-01\nnotes:\n  - anything: [goes\n',
    },
    {
      condition: 'block items are quoted, escaped, padded and commented',
      expected: parsedConfigOf({
        items: [
          {
            app: '',
            key: 'domains',
            text: 'a # b',
          },
          {
            app: '',
            key: 'domains',
            text: 'c',
          },
          {
            app: '',
            key: 'domains',
            text: "e'f",
          },
          {
            app: '',
            key: 'domains',
            text: 'g"h\\i\\n',
          },
          {
            app: '',
            key: 'domains',
            text: 'j\\',
          },
          {
            app: '',
            key: 'domains',
            text: 'k\\',
          },
        ],
        keys: [
          'domains',
        ],
        lists: [
          {
            app: '',
            key: 'domains',
          },
        ],
      }),
      text: 'domains:\n  - "a # b"\n  -   c   # d\n  - \'e\'\'f\'\n  - "g\\"h\\\\i\\n"\n  - "j\\\\"\n  - "k\\"\n',
    },
    {
      condition: 'block lists hold no items',
      expected: parsedConfigOf({
        empties: [
          {
            app: '',
            key: 'domains',
          },
          {
            app: '',
            key: 'platforms',
          },
        ],
        items: [
          {
            app: '',
            key: 'languages',
            text: 'ts',
          },
        ],
        keys: [
          'domains',
          'languages',
          'platforms',
        ],
        lists: [
          {
            app: '',
            key: 'domains',
          },
          {
            app: '',
            key: 'languages',
          },
          {
            app: '',
            key: 'platforms',
          },
        ],
      }),
      text: 'domains:\nlanguages:\n  - ts\nplatforms:\n',
    },
    {
      condition: 'flow lists end with a comma and quote commas, brackets and comments',
      expected: parsedConfigOf({
        items: [
          {
            app: '',
            key: 'axes',
            text: 'a',
          },
          {
            app: '',
            key: 'axes',
            text: 'b',
          },
          {
            app: '',
            key: 'languages',
            text: 'x, y',
          },
          {
            app: '',
            key: 'languages',
            text: 'z]',
          },
          {
            app: '',
            key: 'languages',
            text: 'q", ]',
          },
          {
            app: '',
            key: 'languages',
            text: '',
          },
          {
            app: '',
            key: 'languages',
            text: 'w"v',
          },
          {
            app: '',
            key: 'languages',
            text: 'x"',
          },
          {
            app: '',
            key: 'implementations',
            text: '#], c',
          },
          {
            app: '',
            key: 'implementations',
            text: 'a#b',
          },
        ],
        keys: [
          'axes',
          'languages',
          'implementations',
        ],
        lists: [
          {
            app: '',
            key: 'axes',
          },
          {
            app: '',
            key: 'languages',
          },
          {
            app: '',
            key: 'implementations',
          },
        ],
      }),
      text: 'axes: [ a ,b,]\nlanguages: [ "x, y", \'z]\', "q\\", ]", \'\', w"v, x"]\nimplementations:\t["#], c", a#b] # c\n',
    },
    {
      condition: 'flow lists run on over the lines below their keys',
      expected: parsedConfigOf({
        apps: [
          'web',
        ],
        check: 'x',
        items: [
          {
            app: '',
            key: 'axes',
            text: 'a',
          },
          {
            app: '',
            key: 'axes',
            text: 'b, c',
          },
          {
            app: 'web',
            key: 'packs',
            text: 'd',
          },
          {
            app: 'web',
            key: 'packs',
            text: 'e',
          },
        ],
        keys: [
          'axes',
          'check',
          'packages',
        ],
        lists: [
          {
            app: '',
            key: 'axes',
          },
          {
            app: 'web',
            key: 'packs',
          },
        ],
      }),
      text: 'axes: [a, # first\n  "b,\n  c", ]\ncheck: x\npackages:\n  web:\n    packs: [d,\n         e]\n',
    },
    {
      condition: 'check is left empty',
      expected: parsedConfigOf({
        empties: [
          {
            app: '',
            key: 'check',
          },
        ],
        keys: [
          'check',
        ],
      }),
      text: 'check:\n',
    },
    {
      condition: 'check is an empty quoted scalar',
      expected: parsedConfigOf({
        empties: [
          {
            app: '',
            key: 'check',
          },
        ],
        keys: [
          'check',
        ],
      }),
      text: 'check: "" # none\n',
    },
    {
      condition: 'check holds tabs and a "#" after no blank',
      expected: parsedConfigOf({
        check: 'bun\ttest#all',
        keys: [
          'check',
        ],
      }),
      text: 'check:\tbun\ttest#all\t\n',
    },
    {
      condition: 'check holds a quote after a plain character',
      expected: parsedConfigOf({
        check: 'a"b',
        keys: [
          'check',
        ],
      }),
      text: 'check: a"b # c"\n',
    },
    {
      condition: 'check holds an escaped quote before a "#"',
      expected: parsedConfigOf({
        check: 'a" # b',
        keys: [
          'check',
        ],
      }),
      text: 'check: "a\\" # b" # c\n',
    },
    {
      condition: 'check holds a backslash in single quotes before a comment',
      expected: parsedConfigOf({
        check: 'a\\',
        keys: [
          'check',
        ],
      }),
      text: "check: 'a\\' # b'\n",
    },
    {
      condition: 'packages is an empty flow map',
      expected: parsedConfigOf({
        keys: [
          'packages',
        ],
      }),
      text: 'packages: {}\n',
    },
    {
      condition: 'packages is an empty flow map with a blank inside',
      expected: parsedConfigOf({
        keys: [
          'packages',
        ],
      }),
      text: 'packages: { }\n',
    },
    {
      condition: 'packages holds no package',
      expected: parsedConfigOf({
        empties: [
          {
            app: '',
            key: 'packages',
          },
        ],
        keys: [
          'packages',
        ],
      }),
      text: 'packages:\n',
    },
    {
      condition: 'packages are empty flow maps',
      expected: parsedConfigOf({
        apps: [
          'web',
          'api',
          'ops',
        ],
        keys: [
          'packages',
        ],
      }),
      text: 'packages:\n  web: {}   \n  "api":\t{ }\n  ops:{}\n',
    },
    {
      condition: 'quoted package names hold ": {}" and " # {}"',
      expected: parsedConfigOf({
        apps: [
          'a # {}',
          'b: {}',
        ],
        items: [
          {
            app: 'b: {}',
            key: 'axes',
            text: 'c',
          },
        ],
        keys: [
          'packages',
        ],
        lists: [
          {
            app: 'b: {}',
            key: 'axes',
          },
        ],
      }),
      text: 'packages:\n  "a # {}": {}\n  "b: {}":\n    axes: [c]\n',
    },
    {
      condition: 'packages hold lists and overrides, some of them empty',
      expected: parsedConfigOf({
        apps: [
          'web',
          'api',
        ],
        empties: [
          {
            app: 'web',
            key: 'domains',
          },
          {
            app: 'web',
            key: 'overrides',
          },
        ],
        items: [
          {
            app: 'web',
            key: 'axes',
            text: 'a',
          },
          {
            app: 'api',
            key: 'domains',
            text: 'b',
          },
        ],
        keys: [
          'packages',
        ],
        lists: [
          {
            app: 'web',
            key: 'axes',
          },
          {
            app: 'web',
            key: 'domains',
          },
          {
            app: 'api',
            key: 'axes',
          },
          {
            app: 'api',
            key: 'domains',
          },
        ],
      }),
      text: 'packages:\n  web:\n    axes: [a]\n    domains:\n    overrides:\n  api:\n    axes: []\n    overrides: []\n    domains:\n      - b\n',
    },
    {
      condition: 'overrides hold nothing',
      expected: parsedConfigOf({
        empties: [
          {
            app: '',
            key: 'overrides',
          },
        ],
        keys: [
          'overrides',
        ],
      }),
      text: 'overrides:\n',
    },
    {
      condition: 'overrides are an empty flow list',
      expected: parsedConfigOf({
        keys: [
          'overrides',
        ],
      }),
      text: 'overrides: []\n',
    },
    {
      condition: 'overrides are an empty flow list with a blank inside',
      expected: parsedConfigOf({
        keys: [
          'overrides',
        ],
      }),
      text: 'overrides: [ ]\n',
    },
    {
      condition: 'overrides sit at the key indent and leave fields out',
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
            line: 4,
            reason: 'r',
          }),
        ],
      }),
      text: "overrides:\n-\n  rule: a\n- level: MUST\n  until:\n  reason: 'r'\n",
    },
    {
      condition: 'unknown keys hold any lines',
      expected: parsedConfigOf({
        items: [
          {
            app: '',
            key: 'axes',
            text: 'a',
          },
        ],
        keys: [
          'Big_key-2',
          '_x',
          'axes',
        ],
        lists: [
          {
            app: '',
            key: 'axes',
          },
        ],
      }),
      text: 'Big_key-2: [x\n  - y\n  any: {\n- z\n_x:\naxes: [a]\n',
    },
    {
      condition: 'lines end with CRLF and the last has no newline',
      expected: parsedConfigOf({
        check: 'x',
        items: [
          {
            app: '',
            key: 'axes',
            text: 'a',
          },
        ],
        keys: [
          'axes',
          'check',
        ],
        lists: [
          {
            app: '',
            key: 'axes',
          },
        ],
      }),
      text: 'axes:\r\n  - a\r\ncheck: x\r',
    },
  ])('should read every key, list and override when $condition', ({ expected, text }) => {
    // Arrange
    const parser = createConfigFileParser();

    // Act
    const read = parser.parse(text);

    // Assert
    expect(read).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'a line is indented with a tab',
      line: 2,
      text: 'domains:\n\t- a\n',
    },
    {
      condition: 'a tab follows the indent',
      line: 2,
      text: 'domains:\n  \t- a\n',
    },
    {
      condition: 'a tab follows an item dash',
      line: 2,
      text: 'domains:\n  -\ta\n',
    },
    {
      condition: 'a top-level line is no key',
      line: 2,
      text: 'axes: []\nnot a key\n',
    },
    {
      condition: 'a top-level line is a single character',
      line: 1,
      text: 'x\n',
    },
    {
      condition: 'a top-level key starts mid-line',
      line: 1,
      text: 'xx a: b\n',
    },
    {
      condition: 'a top-level key starts with a digit',
      line: 1,
      text: '1a: b\n',
    },
    {
      condition: 'a key is glued to its value',
      line: 1,
      text: 'axes:[a, b]\n',
    },
    {
      condition: 'a key is written twice',
      line: 2,
      text: 'axes: [a]\naxes: [b]\n',
    },
    {
      condition: 'the document marker follows a key',
      line: 2,
      text: 'axes: []\n---\n',
    },
    {
      condition: 'the document marker is written twice',
      line: 2,
      text: '---\n---\n',
    },
    {
      condition: 'an item has no list above it',
      line: 2,
      text: 'check: x\n- a\n',
    },
    {
      condition: 'a block item is empty',
      line: 2,
      text: 'domains:\n  -\n',
    },
    {
      condition: 'a list is a plain scalar',
      line: 1,
      text: 'axes: a\ncheck: x\n',
    },
    {
      condition: 'a flow list never closes',
      line: 2,
      text: 'check: x\naxes: [a,\n  b\n',
    },
    {
      condition: 'a run-on line is not indented past its key',
      line: 2,
      text: 'axes: [a,\nb]\n',
    },
    {
      condition: 'a run-on line of a package is not indented past its key',
      line: 4,
      text: 'packages:\n  web:\n    axes: [a,\n    b]\n',
    },
    {
      condition: 'a quote inside a flow item opens no scalar',
      line: 1,
      text: 'axes: [a"]", b]\n',
    },
    {
      condition: 'a flow item holds a bracket',
      line: 1,
      text: 'axes: [a[b]\n',
    },
    {
      condition: 'a flow item on a run-on line holds a brace',
      line: 2,
      text: 'axes: [a,\n  b{c}]\n',
    },
    {
      condition: 'a flow list holds an empty item',
      line: 1,
      text: 'axes: [a,,b]\n',
    },
    {
      condition: 'text follows the closing bracket',
      line: 1,
      text: 'axes: [a] b\n',
    },
    {
      condition: 'a plain scalar opens with an anchor',
      line: 1,
      text: 'check: &a\n',
    },
    {
      condition: 'a plain scalar opens a block scalar',
      line: 1,
      text: 'check: |\n',
    },
    {
      condition: 'a plain scalar opens a flow list',
      line: 1,
      text: 'check: [a]\n',
    },
    {
      condition: 'a plain scalar opens with a directive',
      line: 1,
      text: 'check: %a\n',
    },
    {
      condition: 'a double-quoted scalar never closes',
      line: 1,
      text: 'check: "a\n',
    },
    {
      condition: 'a scalar is a lone quote',
      line: 1,
      text: 'check: "\n',
    },
    {
      condition: 'a double-quoted scalar holds a bare quote',
      line: 1,
      text: 'check: "a"b"\n',
    },
    {
      condition: 'a single-quoted scalar holds a lone quote',
      line: 1,
      text: "check: 'a''b'c'\n",
    },
    {
      condition: 'packages hold two flow maps',
      line: 1,
      text: 'packages: {} {}\n',
    },
    {
      condition: 'a package line is no key',
      line: 2,
      text: 'packages:\n  web\n',
    },
    {
      condition: 'a package is named empty',
      line: 2,
      text: 'packages:\n  "":\n',
    },
    {
      condition: 'a package is written twice',
      line: 3,
      text: 'packages:\n  web: {}\n  web:\n',
    },
    {
      condition: 'a key sits under an empty package',
      line: 3,
      text: 'packages:\n  web: {}\n    axes: [a]\n',
    },
    {
      condition: 'a package key comes before any package',
      line: 2,
      text: 'packages:\n    axes: [a]\n',
    },
    {
      condition: 'an item of a package is indented by three',
      line: 4,
      text: 'packages:\n  web:\n    domains:\n   - a\n',
    },
    {
      condition: "an item sits at a package's indent",
      line: 4,
      text: 'packages:\n  web:\n    domains:\n  - a\n',
    },
    {
      condition: 'a package key is unknown',
      line: 3,
      text: 'packages:\n  web:\n    check:\n',
    },
    {
      condition: 'a package key is not lowercase',
      line: 3,
      text: 'packages:\n  web:\n    Axes: [a]\n',
    },
    {
      condition: 'a package key is glued to its value',
      line: 3,
      text: 'packages:\n  web:\n    axes:[a]\n',
    },
    {
      condition: 'a package key is written twice',
      line: 4,
      text: 'packages:\n  web:\n    axes: [a]\n    axes: [b]\n',
    },
    {
      condition: 'an item of a package has no list above it',
      line: 3,
      text: 'packages:\n  web:\n    - a\n',
    },
    {
      condition: 'overrides hold two flow lists',
      line: 1,
      text: 'overrides: [] []\n',
    },
    {
      condition: 'an override field is unknown',
      line: 3,
      text: 'overrides:\n  - rule: a\n    name: b\n',
    },
    {
      condition: 'an override field is written twice',
      line: 3,
      text: 'overrides:\n  - rule: a\n    rule: b\n',
    },
    {
      condition: 'an override field is indented past its item',
      line: 3,
      text: 'overrides:\n  - rule: a\n      level: b\n',
    },
    {
      condition: 'an override field comes before any item',
      line: 2,
      text: 'overrides:\n  rule: a\n',
    },
    {
      condition: 'an override field follows a word',
      line: 2,
      text: 'overrides:\n  - Xxxxx rule: a\n',
    },
    {
      condition: 'an override field is glued to its value',
      line: 2,
      text: 'overrides:\n  - rule:a\n',
    },
  ])('should stop at the line that leaves the grammar when $condition', ({ line, text }) => {
    // Arrange
    const parser = createConfigFileParser();

    // Act
    const read = parser.parse(text);

    // Assert
    expect(read).toStrictEqual({
      line,
      status: ConfigReadStatus.Unparsed,
    });
  });
});
