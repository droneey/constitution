import { describe, expect, it } from 'bun:test';

import { SettingShape } from '../../../domain/contracts';
import type { LinesLayout, Setting } from '../../../domain/entities';
import { createConfigurationFormat } from '../configuration-format.adapter';

const format = createConfigurationFormat();

// The list each alias of a YAML file below repeats.
const aliased = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
];

const aliasesText = (aliases: number): string =>
  `a: &x [${aliased.join(', ')}]\nb: [${Array.from(
    {
      length: aliases,
    },
    () => '*x',
  ).join(', ')}]\n`;

interface ReadRow {
  readonly condition: string;
  readonly path: string;
  readonly settings: Setting | undefined;
  readonly shape?: SettingShape;
  readonly text: string;
}

interface WriteRow {
  readonly condition: string;
  readonly layout?: LinesLayout;
  readonly path: string;
  readonly settings: Setting;
  readonly shape?: SettingShape;
  readonly sorted?: readonly (readonly string[])[];
  readonly text: string;
  readonly written: string;
}

const readOf = (row: ReadRow): Setting | undefined =>
  format.read({
    path: row.path,
    ...(row.shape === undefined
      ? {}
      : {
          shape: row.shape,
        }),
    text: row.text,
  });

const writeOf = (row: WriteRow): string =>
  format.write({
    layout: row.layout,
    path: row.path,
    settings: row.settings,
    ...(row.shape === undefined
      ? {}
      : {
          shape: row.shape,
        }),
    ...(row.sorted === undefined
      ? {}
      : {
          sorted: row.sorted,
        }),
    text: row.text,
  });

describe('createConfigurationFormat', () => {
  it.each<ReadRow>([
    {
      condition: 'a JSON file holds comments, a trailing comma and nulls',
      path: 'biome.json',
      settings: {
        files: [
          'src',
        ],
      },
      text: '{\n  // the source\n  "files": ["src", null,],\n  "gone": null\n}\n',
    },
    {
      condition: 'a JSONC file is empty',
      path: 'knip.jsonc',
      settings: {},
      text: '  \n',
    },
    {
      condition: 'a JSON file does not parse',
      path: 'biome.json',
      settings: undefined,
      text: '{ "files": ',
    },
    {
      condition: 'a TOML file holds a table and a date',
      path: 'bunfig.toml',
      settings: {
        since: '1979-05-27T07:32:00.000Z',
        test: {
          randomize: true,
        },
      },
      text: 'since = 1979-05-27T07:32:00Z\n\n[test]\nrandomize = true\n',
    },
    {
      condition: 'a TOML file does not parse',
      path: 'bunfig.toml',
      settings: undefined,
      text: '[test\n',
    },
    {
      condition: 'a YAML file holds an alias and a null',
      path: 'lefthook.yaml',
      settings: {
        first: 'lint',
        second: 'lint',
      },
      text: 'first: &run lint\nsecond: *run\nskip: ~\n',
    },
    {
      condition: 'a YML file is empty',
      path: '.yamllint.yml',
      settings: {},
      text: '',
    },
    {
      condition: 'a YAML file does not parse',
      path: 'lefthook.yaml',
      settings: undefined,
      text: 'jobs: [lint\n',
    },
    {
      condition: 'a dotfile holds lines, comments and blanks',
      path: 'apps/web/.gitignore',
      settings: [
        'dist/',
        'node_modules/',
      ],
      text: '# built\ndist/\n\n  node_modules/  \n; old\n',
    },
    {
      condition: 'a run-command file shows sections',
      path: '.shellcheckrc',
      settings: {
        '': {
          shell: 'bash',
        },
        checks: {
          enabled: true,
          level: 3,
          name: 'all',
        },
      },
      text: 'shell = bash\n# the checks\n[checks]\nenabled = true\nlevel = 3\nname = all\n',
    },
    {
      condition:
        'an ini-like file holds bracketed values, pairs in comments, values that only look typed and an empty section',
      path: '.editorconfig',
      settings: {
        '': {
          f: false,
          k: '[v]',
          k2: 'v2',
          m: 'a12',
          n: '12a',
          t: 'truex',
          u: 'xtrue',
          w: 12,
        },
        a: {
          x: 1,
        },
        empty: {},
      },
      text: 'k = [v]\n# c = d\nt = truex\nu = xtrue\nn = 12a\nm = a12\nw = 12\nf = false\nk2=v2\n[empty]\n  [a]  \nx = 1\n[b] tail\n',
    },
    {
      condition: 'a file of no extension is given the shape of lines',
      path: 'CODEOWNERS',
      settings: [
        '[section]',
      ],
      shape: SettingShape.List,
      text: '[section]\n',
    },
    {
      condition: 'a dotfile with an extension of no format is given the shape of sections',
      path: '.env.example',
      settings: {
        '': {
          name: 'value',
        },
      },
      shape: SettingShape.Map,
      text: 'name = value\n',
    },
    {
      condition: 'a file of lines holds comment marks inside a line and comments indented',
      path: '.dockerignore',
      settings: [
        'a#b',
      ],
      text: 'a#b\n  # indented\n',
    },
    {
      condition: 'a run-command file of a longer name shows indented sections',
      path: 'tool.lintrc',
      settings: {
        all: {
          on: true,
        },
      },
      text: '  [all]  \non = true\n',
    },
    {
      condition: 'a file of no extension holds brackets that are no section',
      path: 'OWNERS',
      settings: [
        'x = [y]',
        '[a] b',
      ],
      text: 'x = [y]\n[a] b\n',
    },
    {
      condition: "a dotfile's name is a format's extension",
      path: 'config/.toml',
      settings: [
        'a = 1',
      ],
      text: 'a = 1\n',
    },
    {
      condition: 'its extension only starts like a run-command file',
      path: 'tool.lintrcx',
      settings: undefined,
      text: 'a = 1\n',
    },
    {
      condition: 'its format holds no settings',
      path: 'src/index.ts',
      settings: undefined,
      text: 'export {};\n',
    },
  ])('should read the settings when $condition', (row) => {
    // Act
    const read = readOf(row);

    // Assert
    expect(read).toStrictEqual(row.settings);
  });

  it.each([
    {
      aliases: 100,
      condition: 'its aliases expand within the bound',
      settings: {
        a: aliased,
        b: Array.from(
          {
            length: 100,
          },
          () => aliased,
        ),
      },
    },
    {
      aliases: 2000,
      condition: 'its aliases expand past the bound',
      settings: undefined,
    },
  ])('should read a YAML file only while $condition', ({ aliases, settings }) => {
    // Act
    const read = format.read({
      path: 'aliases.yaml',
      text: aliasesText(aliases),
    });

    // Assert
    expect(read).toStrictEqual(settings);
  });

  it.each<WriteRow>([
    {
      condition: 'a JSON file is new',
      path: 'biome.json',
      settings: {
        files: [
          'src',
        ],
      },
      text: '',
      written: '{\n  "files": [\n    "src"\n  ]\n}\n',
    },
    {
      condition: 'the settings change nothing',
      path: 'biome.json',
      settings: {
        files: [
          'src',
        ],
      },
      text: '{\n  // the source\n  "files": ["src"], "gone": null\n}',
      written: '{\n  // the source\n  "files": ["src"], "gone": null\n}\n',
    },
    {
      condition: 'a key goes, a key comes and a value changes',
      path: 'biome.json',
      settings: {
        added: true,
        kept: {
          width: 120,
        },
      },
      text: '{\n  // kept\n  "kept": { "width": 100 },\n  "removed": 1\n}\n',
      written: '{\n  // kept\n  "kept": {\n    "width": 120\n  },\n  "added": true\n}\n',
    },
    {
      condition:
        'a map kept sorted gains a key and is written again with its keys sorted, a null among them',
      path: 'package.json',
      settings: {
        name: 'kit',
        scripts: {
          check: 'c',
          'check:lint': 'l',
          test: 't',
        },
      },
      sorted: [
        [
          'scripts',
        ],
        [
          'name',
        ],
        [
          'absent',
        ],
      ],
      text: '{\n  "name": "kit",\n  "scripts": {\n    "test": "t",\n    "check:lint": "l",\n    "gone": null\n  }\n}\n',
      written:
        '{\n  "name": "kit",\n  "scripts": {\n    "check": "c",\n    "check:lint": "l",\n    "gone": null,\n    "test": "t"\n  }\n}\n',
    },
    {
      condition: 'a map kept sorted already stands sorted',
      path: 'package.json',
      settings: {
        scripts: {
          check: 'c',
          test: 't',
        },
      },
      sorted: [
        [
          'scripts',
        ],
      ],
      text: '{\n  "scripts": { "check": "c", "test": "t" }\n}\n',
      written: '{\n  "scripts": { "check": "c", "test": "t" }\n}\n',
    },
    {
      condition: 'a JSONC file is new, its lists and objects broken over lines',
      path: 'knip.jsonc',
      settings: {
        entry: [
          'src',
        ],
        rules: {
          files: 'error',
        },
      },
      text: '',
      written: '{\n  "entry": [\n    "src",\n  ],\n  "rules": {\n    "files": "error",\n  },\n}\n',
    },
    {
      condition:
        'a JSONC file gains a comma before the comment after its last item, and none in a list on one line',
      path: 'knip.jsonc',
      settings: {
        entry: [
          'src',
        ],
        project: [],
      },
      text: '{\n  "entry": ["src"],\n  "project": [] // none\n}\n',
      written: '{\n  "entry": ["src"],\n  "project": [], // none\n}\n',
    },
    {
      condition: 'a JSONC file already writes its commas after the last items',
      path: 'knip.jsonc',
      settings: {
        entry: [
          'a',
        ],
      },
      text: '{\n  "entry": [\n    "a",\n  ],\n}\n',
      written: '{\n  "entry": [\n    "a",\n  ],\n}\n',
    },
    {
      condition: 'a list loses an item and gains two in their places',
      path: 'knip.jsonc',
      settings: {
        entry: [
          'first',
          'kept',
          'middle',
          'last',
        ],
      },
      text: '{ "entry": ["kept", /* why */ "gone", "last"] }\n',
      written:
        '{\n  "entry": [\n    "first",\n    "kept",\n    "middle", /* why */\n    "last",\n  ],\n}\n',
    },
    {
      condition: 'a list keeps its items in another order',
      path: 'knip.jsonc',
      settings: {
        entry: [
          'b',
          'a',
        ],
      },
      text: '{ "entry": ["a", "b"] }\n',
      written: '{ "entry": [\n    "b",\n    "a",\n  ] }\n',
    },
    {
      condition: 'a list holds a null the settings cannot hold',
      path: 'knip.jsonc',
      settings: {
        entry: [
          'a',
          'b',
        ],
      },
      text: '{ "entry": ["a", null] }\n',
      written: '{ "entry": [\n    "a",\n    "b",\n  ] }\n',
    },
    {
      condition: 'a value spelled otherwise stays as the file spells it',
      path: 'biome.json',
      settings: {
        a: 1,
        b: 3,
      },
      text: '{"a": 1.0, "b": 2}',
      written: '{"a": 1.0, "b": 3}\n',
    },
    {
      condition: 'a map and a list turn into scalars',
      path: 'biome.json',
      settings: {
        a: 2,
        c: 3,
      },
      text: '{"a": {"b": 1}, "c": [1]}',
      written: '{"a": 2, "c": 3}\n',
    },
    {
      condition: 'a file of blanks is written new',
      path: 'biome.json',
      settings: {
        a: 1,
      },
      text: '\n',
      written: '{\n  "a": 1\n}\n',
    },
    {
      condition: 'a value turns from a scalar into a map',
      path: 'biome.json',
      settings: {
        files: {
          includes: [
            'src',
          ],
        },
      },
      text: '{ "files": "src" }',
      written: '{ "files": {\n    "includes": [\n      "src"\n    ]\n  } }\n',
    },
  ])('should write JSON when $condition', (row) => {
    // Act
    const written = writeOf(row);

    // Assert
    expect(written).toBe(row.written);
  });

  it.each<WriteRow>([
    {
      condition: 'a TOML file is new',
      path: 'bunfig.toml',
      settings: {
        smol: true,
        test: {
          preload: [
            'a.ts',
          ],
        },
      },
      text: '',
      written: 'smol = true\n\n[test]\npreload = ["a.ts"]\n',
    },
    {
      condition:
        'an array runs past the width, a text holds brackets and an array holds tables of its own',
      path: 'bunfig.toml',
      settings: {
        test: {
          marks: [
            '[ x ]',
          ],
          preload: [
            './src/__tests__/first-of-the-fixtures.ts',
            './src/__tests__/second-of-the-fixtures.ts',
            './src/__tests__/third.ts',
          ],
          rows: [
            [
              'a',
            ],
          ],
        },
      },
      text: '',
      written:
        '[test]\nmarks = ["[ x ]"]\npreload = [\n  "./src/__tests__/first-of-the-fixtures.ts",\n  "./src/__tests__/second-of-the-fixtures.ts",\n  "./src/__tests__/third.ts"\n]\nrows = [["a"]]\n',
    },
    {
      condition:
        'an array as long as the width, a long text and an array of arrays stay on their lines',
      path: 'bunfig.toml',
      settings: {
        rows: [
          [
            'a'.repeat(50),
          ],
          [
            'b'.repeat(50),
          ],
        ],
        tags: [
          'a'.repeat(42),
          'b'.repeat(43),
        ],
        title: 't'.repeat(110),
      },
      text: '',
      written: `rows = [["${'a'.repeat(50)}"], ["${'b'.repeat(50)}"]]\ntags = ["${'a'.repeat(42)}", "${'b'.repeat(43)}"]\ntitle = "${'t'.repeat(110)}"\n`,
    },
    {
      condition:
        "a file's own indented array runs past the width and a literal string holds brackets",
      path: 'bunfig.toml',
      settings: {
        test: {
          preload: [
            'a, b'.repeat(15),
            'c'.repeat(40),
          ],
          title: '[ a ]',
        },
      },
      text: `[test]\n  preload = ['${'a, b'.repeat(15)}', '${'c'.repeat(40)}']\n  title = '[ a ]'\n`,
      written: `[test]\n  preload = [\n    '${'a, b'.repeat(15)}',\n    '${'c'.repeat(40)}'\n  ]\n  title = '[ a ]'\n`,
    },
    {
      condition:
        'a table names a header longer than the width, and a list mixes a table and a text',
      path: 'bunfig.toml',
      settings: {
        ['k'.repeat(100)]: {
          a: 1,
        },
        mixed: [
          {
            a: 1,
          },
          'x',
        ],
      },
      text: '',
      written: `mixed = [{ a = 1 }, "x"]\n\n[${'k'.repeat(100)}]\na = 1\n`,
    },
    {
      condition: 'a key of a plain table becomes an inline table of two keys',
      path: 'bunfig.toml',
      settings: {
        test: {
          cover: {
            functions: 1,
            lines: 1,
          },
          x: 1,
        },
      },
      text: '[test]\nx = 1\ncover = { functions = 1 }\n',
      written: '[test]\nx = 1\ncover = { functions = 1, lines = 1 }\n',
    },
    {
      condition: 'one of two tables dots its keys',
      path: 'bunfig.toml',
      settings: {
        a: {
          x: {
            y: 2,
          },
        },
        b: {
          z: 1,
        },
      },
      text: '[a]\nx.y = 1\n\n[b]\nz = 1\n',
      written: '[a.x]\ny = 2\n\n[b]\nz = 1\n',
    },
    {
      condition: 'a plain table changes a key, gains one and keeps its comments',
      path: 'bunfig.toml',
      settings: {
        test: {
          added: 'x',
          randomize: true,
          timeout: 5,
        },
      },
      text: '# top\n[test]\n# why\nrandomize = false\ntimeout = 5 # seconds\n\n# after\n',
      written:
        '# top\n[test]\n# why\nrandomize = true\ntimeout = 5 # seconds\nadded = "x"\n\n# after\n',
    },
    {
      condition: 'a key of many lines goes and the table loses its last key but one',
      path: 'bunfig.toml',
      settings: {
        test: {
          kept: 1,
        },
      },
      text: '[test]\nkept = 1\nlist = [\n  "a", # one\n  "b",\n]\n',
      written: '[test]\nkept = 1\n',
    },
    {
      condition: 'a section is gone, its comment above it kept',
      path: 'tombi.toml',
      settings: {
        kept: {
          a: 1,
        },
      },
      text: '[kept]\na = 1\n\n# old\n[old]\nb = 2\n',
      written: '[kept]\na = 1\n\n# old\n',
    },
    {
      condition: 'a table of tables changes one of its tables',
      path: 'pyproject.toml',
      settings: {
        tool: {
          ruff: {
            line: 100,
          },
          uv: {
            x: 1,
          },
        },
      },
      text: '[tool.ruff]\nline = 80\n\n[tool.uv]\n# mine\nx = 1\n',
      written: '[tool.ruff]\nline = 100\n\n[tool.uv]\n# mine\nx = 1\n',
    },
    {
      condition: 'a table of tables gains a table',
      path: 'pyproject.toml',
      settings: {
        tool: {
          ruff: {
            line: 80,
          },
          ty: {
            strict: true,
          },
        },
      },
      text: '[tool.ruff]\nline = 80\n',
      written: '[tool.ruff]\nline = 80\n\n[tool.ty]\nstrict = true\n',
    },
    {
      condition: 'a table dots its keys',
      path: 'pyproject.toml',
      settings: {
        project: {
          name: 'kit',
          urls: {
            home: 'https://example.com',
          },
        },
      },
      text: '[project]\nname = "old"\nurls.home = "https://example.com"\n',
      written: '[project]\nname = "kit"\n\n[project.urls]\nhome = "https://example.com"\n',
    },
    {
      condition: 'an array of tables changes',
      path: 'lefthook.toml',
      settings: {
        jobs: [
          {
            run: 'a',
          },
          {
            run: 'c',
          },
        ],
      },
      text: '[[jobs]]\nrun = "a"\n\n[[jobs]]\nrun = "b"\n',
      written: '[[jobs]]\nrun = "a"\n\n[[jobs]]\nrun = "c"\n',
    },
    {
      condition: 'the root dots its keys',
      path: 'tombi.toml',
      settings: {
        format: {
          width: 100,
        },
        version: '1.0',
      },
      text: '# root\nversion = "0.9"\nformat.width = 100\n',
      written: 'version = "1.0"\n\n[format]\nwidth = 100\n',
    },
    {
      condition: 'a plain table gains a key whose value is a map',
      path: 'bunfig.toml',
      settings: {
        test: {
          coverage: {
            threshold: 1,
          },
          randomize: true,
        },
      },
      text: '[test]\nrandomize = true\n',
      written: '[test]\nrandomize = true\ncoverage = { threshold = 1 }\n',
    },
    {
      condition: 'a plain table changes a list and gains a key that needs quotes',
      path: 'bunfig.toml',
      settings: {
        test: {
          'only.this': true,
          preload: [
            'a.ts',
            'b.ts',
          ],
        },
      },
      text: '[test]\npreload = ["a.ts"]\n',
      written: '[test]\npreload = ["a.ts", "b.ts"]\n"only.this" = true\n',
    },
    {
      condition: 'a plain table changes two keys, the first of many lines',
      path: 'bunfig.toml',
      settings: {
        test: {
          a: [
            'x',
          ],
          b: 20,
        },
      },
      text: '[test]\na = [\n  "w",\n]\nb = 2\n',
      written: '[test]\na = ["x"]\nb = 20\n',
    },
    {
      condition:
        'tables of a table keep their headers as written: indented, commented, their parts quoted',
      path: 'bunfig.toml',
      settings: {
        tool: {
          "it's": {
            b: 2,
          },
          'lit.x': {
            c: 2,
          },
          'my.app': {
            a: 2,
          },
        },
      },
      text: '[tool."my.app"] # the app\n# keep\na = 1\n\n  [tool."it\'s"]\n# its\nb = 1\n\n[tool.\'lit.x\']\n# lit\nc = 1\n',
      written:
        '[tool."my.app"] # the app\n# keep\na = 2\n\n  [tool."it\'s"]\n# its\nb = 2\n\n[tool.\'lit.x\']\n# lit\nc = 2\n',
    },
    {
      condition:
        'a plain table changes quoted keys, a key of no spaces and an array whose strings and comment hold brackets',
      path: 'bunfig.toml',
      settings: {
        t: {
          'a.b': 2,
          arr: [
            'z',
          ],
          k: 2,
          last: 1,
          'lit key': 2,
          'my key': 2,
        },
      },
      text: '[t]\n# keep\n"my key" = 1\n\'lit key\' = 1\nk=1\n"a.b" = 1\narr = [\n  "x]", # note ]\n  \'y]\',\n]\n# see a.b\nlast = 1\n',
      written:
        '[t]\n# keep\n"my key" = 2\n"lit key" = 2\nk = 2\n"a.b" = 2\narr = ["z"]\n# see a.b\nlast = 1\n',
    },
    {
      condition: 'a plain table dots an indented key with spaces around its dot',
      path: 'bunfig.toml',
      settings: {
        t: {
          c: {
            d: 1,
          },
          x: 2,
        },
      },
      text: '[t]\n# lost\nx = 1\n  c . d = 1\n',
      written: '[t]\nx = 2\n\n[t.c]\nd = 1\n',
    },
    {
      condition: 'a header of no section dots the keys of a table of tables',
      path: 'bunfig.toml',
      settings: {
        t: {
          c: {
            d: 2,
          },
        },
      },
      text: '[t]\n  c . d = 1\n',
      written: '[t.c]\nd = 2\n',
    },
    {
      condition: 'an empty table gains a key above the blanks that close it',
      path: 'bunfig.toml',
      settings: {
        a: {
          k: 1,
        },
        b: {
          x: 1,
        },
      },
      text: '[a]\n  \n\n[b]\nx = 1\n',
      written: '[a]\nk = 1\n  \n\n[b]\nx = 1\n',
    },
    {
      condition: 'only the root changes, the tables and arrays of tables kept as written',
      path: 'bunfig.toml',
      settings: {
        a: 2,
        l: [
          {
            y: 1,
          },
        ],
        t: {
          x: 1,
        },
      },
      text: 'a = 1\n\n[t]\n# keep\nx=1\n\n[[l]]\ny=1\n',
      written: 'a = 2\n\n[t]\n# keep\nx=1\n\n[[l]]\ny=1\n',
    },
    {
      condition: 'the root holds an empty list and a list of a table and a scalar',
      path: 'bunfig.toml',
      settings: {
        e: [],
        m: [
          {
            x: 1,
          },
          2,
        ],
        v: 2,
      },
      text: 'e = []\nm = [{ x = 1 }, 2]\nv = 1\n',
      written: 'e = []\nm = [{ x = 1 }, 2]\nv = 2\n',
    },
    {
      condition: 'a new file holds an empty table',
      path: 'bunfig.toml',
      settings: {
        a: {},
      },
      text: '',
      written: '[a]\n',
    },
    {
      condition: 'a plain table gains a list of a map of two keys and a scalar',
      path: 'bunfig.toml',
      settings: {
        t: {
          m: [
            {
              a: 1,
              b: 2,
            },
            1,
          ],
          x: 1,
        },
      },
      text: '[t]\nx = 1\n',
      written: '[t]\nx = 1\nm = [{ a = 1, b = 2 }, 1]\n',
    },
    {
      condition: 'a text of many lines opens a bracket, so the table is written again',
      path: 'bunfig.toml',
      settings: {
        a: {
          b: 2,
          doc: '[\ny',
        },
      },
      text: '[a]\ndoc = """[\nx"""\nb = 1\n',
      written: '[a]\nb = 2\ndoc = "[\\ny"\n',
    },
    {
      condition: 'a table turns into a table of tables, its own keys gone',
      path: 'bunfig.toml',
      settings: {
        tool: {
          app: {
            a: 2,
          },
        },
      },
      text: '[tool]\nx = 1\n\n[tool.app]\n# keep\na = 1\n',
      written: '[tool.app]\n# keep\na = 2\n',
    },
    {
      condition: 'a text of many lines holds a line that looks like a header',
      path: 'bunfig.toml',
      settings: {
        a: {
          b: 2,
          doc: '[x] y\n',
        },
      },
      text: '[a]\ndoc = """\n[x] y\n"""\nb = 1\n',
      written: '[a]\ndoc = """\n[x] y\n"""\nb = 2\n',
    },
    {
      condition: 'an array of one table changes, written again',
      path: 'bunfig.toml',
      settings: {
        l: [
          {
            y: 2,
          },
        ],
      },
      text: '[[l]]\n# c\ny=1\n',
      written: '[[l]]\ny = 2\n',
    },
    {
      condition: "a table's header holds a comment that names an array of tables",
      path: 'bunfig.toml',
      settings: {
        t: {
          x: 2,
        },
      },
      text: '[t] # see [[x]]\n# keep\nx = 1\n',
      written: '[t] # see [[x]]\n# keep\nx = 2\n',
    },
    {
      condition: 'a root list empties',
      path: 'bunfig.toml',
      settings: {
        e: [],
        v: 1,
      },
      text: 'e = [1]\nv = 1\n',
      written: 'e = []\nv = 1\n',
    },
    {
      condition: 'a root list gains a table beside a scalar',
      path: 'bunfig.toml',
      settings: {
        m: [
          {
            x: 1,
          },
          2,
        ],
      },
      text: 'm = [2]\n',
      written: 'm = [{ x = 1 }, 2]\n',
    },
    {
      condition: 'a table below a plain table changes, the two written again',
      path: 'bunfig.toml',
      settings: {
        a: {
          b: {
            y: 2,
          },
          x: 1,
        },
      },
      text: '[a]\nx = 1\n\n[a.b]\n# b\ny = 1\n',
      written: '[a]\nx = 1\n\n[a.b]\ny = 2\n',
    },
    {
      condition: 'a plain table with a table below it changes a key, the two written again',
      path: 'bunfig.toml',
      settings: {
        a: {
          b: {
            y: 1,
          },
          x: 2,
        },
      },
      text: '[a]\nx = 1\n\n[a.b]\n# b\ny = 1\n',
      written: '[a]\nx = 2\n\n[a.b]\ny = 1\n',
    },
    {
      condition: 'a table goes and another keeps its comment',
      path: 'bunfig.toml',
      settings: {
        t: {
          y: 1,
        },
      },
      text: '[gone]\nx = 1\n\n[t]\n# keep\ny = 1\n',
      written: '[t]\n# keep\ny = 1\n',
    },
    {
      condition: 'a table of tables holds a table named undefined',
      path: 'bunfig.toml',
      settings: {
        tool: {
          undefined: {
            a: 2,
          },
        },
      },
      text: '[tool]\n\n[tool.undefined]\n# keep\na = 1\n',
      written: '[tool]\n\n[tool.undefined]\n# keep\na = 2\n',
    },
    {
      condition: 'a table that dots a key goes and another keeps its comment',
      path: 'bunfig.toml',
      settings: {
        t: {
          y: 1,
        },
      },
      text: '[gone]\nx = 1\na.b = 1\n\n[t]\n# keep\ny = 1\n',
      written: '[t]\n# keep\ny = 1\n',
    },
    {
      condition: 'a table turns into an array of tables',
      path: 'lefthook.toml',
      settings: {
        jobs: [
          {
            run: 'a',
          },
        ],
      },
      text: '[jobs]\nrun = "a"\n',
      written: '[[jobs]]\nrun = "a"\n',
    },
    {
      condition: 'the settings change nothing',
      path: 'bunfig.toml',
      settings: {
        test: {
          randomize: true,
        },
      },
      text: '[test]\nrandomize = true # kept\n',
      written: '[test]\nrandomize = true # kept\n',
    },
  ])('should write TOML when $condition', (row) => {
    // Act
    const written = writeOf(row);

    // Assert
    expect(written).toBe(row.written);
  });

  it.each<WriteRow>([
    {
      condition: 'a YAML file is new',
      path: 'lefthook.yaml',
      settings: {
        jobs: [
          {
            run: 'line one\nline two',
          },
        ],
        on: 'yes',
      },
      text: '',
      written: "jobs:\n  - run: |-\n      line one\n      line two\n'on': 'yes'\n",
    },
    {
      condition: 'a new text that needs quotes takes single ones',
      path: 'lefthook.yaml',
      settings: {
        glob: '*.md',
        range: '',
      },
      text: '',
      written: "glob: '*.md'\nrange: ''\n",
    },
    {
      condition:
        'a key goes, a key comes before the key that follows it, a value changes and the comments stay',
      path: 'lefthook.yaml',
      settings: {
        added: true,
        kept: {
          width: 120,
        },
        name: 'kit',
      },
      text: '# top\nname: kit\nkept:\n  width: 100 # why\nremoved: 1\nskip: ~\n',
      written: '# top\nname: kit\nkept:\n  width: 120 # why\nskip: ~\nadded: true\n',
    },
    {
      condition: 'a map kept sorted keeps its comments, and a path of no map is passed by',
      path: 'lefthook.yaml',
      settings: {
        jobs: {
          a: 1,
          b: 2,
        },
        name: 'kit',
      },
      sorted: [
        [
          'jobs',
        ],
        [
          'name',
        ],
      ],
      text: 'name: kit\njobs:\n  b: 2 # why\n  a: 1\n',
      written: 'name: kit\njobs:\n  a: 1\n  b: 2 # why\n',
    },
    {
      condition: 'a list keeps the nodes of the items it keeps',
      path: 'lefthook.yaml',
      settings: {
        exclude: [
          'new',
          'kept',
        ],
      },
      text: 'exclude:\n  - gone\n  - kept # mine\n',
      written: 'exclude:\n  - new\n  - kept # mine\n',
    },
    {
      condition: 'a list holds a null the settings cannot hold',
      path: 'lefthook.yaml',
      settings: {
        exclude: [
          'a',
          'b',
        ],
      },
      text: 'exclude:\n  - a\n  - ~\n',
      written: 'exclude:\n  - a\n  - b\n',
    },
    {
      condition:
        'a map and a list turn into scalars, and a new list holds a text of lines and a word YAML 1.1 reads as a truth',
      path: 'lefthook.yaml',
      settings: {
        a: 2,
        c: 3,
        d: [
          'yes',
          'x\ny',
        ],
      },
      text: 'a:\n  b: 1\nc:\n  - x\n',
      written: "a: 2\nc: 3\nd:\n  - 'yes'\n  - |-\n    x\n    y\n",
    },
    {
      condition: 'a key the file writes as a number goes',
      path: 'lefthook.yaml',
      settings: {
        a: 2,
      },
      text: 'a: 1\n1: x\n',
      written: 'a: 2\n',
    },
    {
      condition: 'a list keeps the comment of its first item and gains one',
      path: 'lefthook.yaml',
      settings: {
        exclude: [
          'x',
          'y',
          'z',
        ],
      },
      text: 'exclude:\n  - x # keep\n  - y\n',
      written: 'exclude:\n  - x # keep\n  - y\n  - z\n',
    },
    {
      condition: 'a long text is folded as a block at the width every formatter keeps',
      path: 'lefthook.yaml',
      settings: {
        run: 'word '.repeat(30).trim(),
      },
      text: '',
      written: `run: >-\n  ${'word '.repeat(19).trim()}\n  ${'word '.repeat(11).trim()}\n`,
    },
    {
      condition: 'a long text of lines stays a literal block',
      path: 'lefthook.yaml',
      settings: {
        run: `${'word '.repeat(19).trim()}\nnext`,
      },
      text: '',
      written: `run: |-\n  ${'word '.repeat(19).trim()}\n  next\n`,
    },
    {
      condition: 'a text of 80 characters stays on its line',
      path: 'lefthook.yaml',
      settings: {
        run: 'a'.repeat(80),
      },
      text: '',
      written: `run: ${'a'.repeat(80)}\n`,
    },
    {
      condition: 'the file is a map that turns into a list',
      path: 'settings.yml',
      settings: [
        'x',
      ],
      text: 'a: 1\n',
      written: '- x\n',
    },
    {
      condition: 'the file is a list that turns into a map',
      path: 'settings.yml',
      settings: {
        list: false,
      },
      text: '- a\n',
      written: 'list: false\n',
    },
  ])('should write YAML when $condition', (row) => {
    // Act
    const written = writeOf(row);

    // Assert
    expect(written).toBe(row.written);
  });

  it.each<WriteRow>([
    {
      condition: 'a file of lines keeps its comments and its own lines, loses a line and gains one',
      path: '.gitignore',
      settings: [
        'node_modules/',
        'kept/',
        'dist/',
      ],
      text: '\n# mine\nkept/\nnode_modules/\ngone/\n',
      written: '# mine\nkept/\nnode_modules/\ndist/\n',
    },
    {
      condition:
        'a file of lines drops the blanks that open it, and keeps its blank and indented lines',
      path: '.gitignore',
      settings: [
        'a',
        'dist',
      ],
      text: '\n\na\n  \n  dist\n',
      written: 'a\n  \n  dist\n',
    },
    {
      condition: 'a file of lines keeps a blank line between its own',
      path: '.gitignore',
      settings: [
        'a',
        'b',
      ],
      text: 'a\n\nb\n',
      written: 'a\n\nb\n',
    },
    {
      condition:
        'a file of lines keeps its own lines and comments, then each group under its name, a gone group and a blank between what went aside',
      layout: {
        groups: [
          {
            lines: [
              'dist/',
              'build/',
            ],
            name: 'vite',
          },
          {
            lines: [
              '.env',
            ],
            name: 'environment files',
          },
        ],
        names: [
          'environment files',
          'tsc',
          'vite',
        ],
      },
      path: '.gitignore',
      settings: [
        'dist/',
        'build/',
        '.env',
        '.source/',
        'local.txt',
        'added.txt',
      ],
      text: '# generated content\n.source/\ndist/\n\n  # tsc\n*.tsbuildinfo\n  \n  local.txt\n\n\n# vite\nbuild/\n',
      written:
        '# generated content\n.source/\n\n  local.txt\nadded.txt\n\n# vite\ndist/\nbuild/\n\n# environment files\n.env\n',
    },
    {
      condition: 'a file of lines laid out in groups is laid out again as it is',
      layout: {
        groups: [
          {
            lines: [
              'dist/',
            ],
            name: 'vite',
          },
        ],
        names: [
          'vite',
        ],
      },
      path: '.gitignore',
      settings: [
        'dist/',
        'own/',
        'more/',
      ],
      text: '# mine\nown/\n\n\nmore/\n\n# vite\ndist/\n',
      written: '# mine\nown/\n\n\nmore/\n\n# vite\ndist/\n',
    },
    {
      condition: 'a file of lines of no own line opens with its first group',
      layout: {
        groups: [
          {
            lines: [
              'dist/',
            ],
            name: 'vite',
          },
        ],
        names: [
          'vite',
        ],
      },
      path: '.gitignore',
      settings: [
        'dist/',
      ],
      text: '',
      written: '# vite\ndist/\n',
    },
    {
      condition: 'a file of lines is new',
      path: '.dockerignore',
      settings: [
        'node_modules/',
      ],
      shape: SettingShape.List,
      text: '',
      written: 'node_modules/\n',
    },
    {
      condition: 'a file of lines is given settings that are no list, which leave it empty',
      path: '.gitignore',
      settings: {
        a: 1,
      },
      shape: SettingShape.List,
      text: 'gone/\n',
      written: '',
    },
    {
      condition:
        'an ini-like file changes a pair, gains a pair and a section, and keeps its comments',
      path: '.editorconfig',
      settings: {
        '': {
          root: true,
        },
        '*': {
          indent: 2,
          style: 'space',
        },
        '*.md': {
          trim: false,
        },
      },
      text: 'root = true\n\n# all\n[*]\nindent = 4\neol = lf\n\n',
      written: 'root = true\n\n# all\n[*]\nindent = 2\nstyle = space\n\n[*.md]\ntrim = false\n',
    },
    {
      condition:
        'an ini-like file keeps a header holding "=", finds an indented header, and places a pair before the blanks that close its section',
      path: '.editorconfig',
      settings: {
        'a=b': {
          k: 2,
          q: 5,
        },
        c: {
          x: 1,
          y: 3,
          z: 4,
        },
        d: {},
      },
      text: '[a=b]\n# c = d\nk = 1\nq=1\n  [c]  \nx = 1\ny = 2\n  \n[d]\n',
      written: '[a=b]\n# c = d\nk = 2\nq = 5\n  [c]  \nx = 1\ny = 3\nz = 4\n  \n[d]\n',
    },
    {
      condition: 'an ini-like file gains a top pair above the blanks that open it',
      path: '.editorconfig',
      settings: {
        '': {
          top: 1,
        },
        a: {
          b: 1,
        },
      },
      text: '\n[a]\nb = 1\n',
      written: 'top = 1\n\n[a]\nb = 1\n',
    },
    {
      condition: 'an ini-like file that ends in a blank gains a section',
      path: '.editorconfig',
      settings: {
        '': {
          j: 2,
          k: 1,
        },
        c: {
          d: 2,
        },
      },
      shape: SettingShape.Map,
      text: 'k = 1\nj = 2\n\n',
      written: 'k = 1\nj = 2\n\n[c]\nd = 2\n',
    },
    {
      condition: 'an ini-like file is new and opens with a section',
      path: '.editorconfig',
      settings: {
        a: {
          b: 1,
        },
      },
      shape: SettingShape.Map,
      text: '',
      written: '[a]\nb = 1\n',
    },
    {
      condition: 'an ini-like file gains a section after a pair',
      path: '.editorconfig',
      settings: {
        a: {
          b: 1,
        },
        c: {
          d: 2,
        },
      },
      text: '[a]\nb = 1\n',
      written: '[a]\nb = 1\n\n[c]\nd = 2\n',
    },
    {
      condition: 'an ini-like file is new',
      path: '.shellcheckrc',
      settings: {
        '': {
          shell: 'bash',
        },
      },
      shape: SettingShape.Map,
      text: '',
      written: 'shell = bash\n',
    },
    {
      condition: 'an ini-like file is given settings that are no map',
      path: '.shellcheckrc',
      settings: [
        'x',
      ],
      shape: SettingShape.Map,
      text: '[a]\nb = 1\n',
      written: '[a]\n',
    },
    {
      condition: 'an ini-like section is given a value that is no map',
      path: '.editorconfig',
      settings: {
        '*': 'all',
      },
      text: '[*]\nindent_size = 2\n',
      written: '[*]\n',
    },
    {
      condition: 'its format holds no settings',
      path: 'src/index.ts',
      settings: {
        a: 1,
      },
      text: 'export {};\n',
      written: 'export {};\n',
    },
  ])('should write a file of lines or of sections when $condition', (row) => {
    // Act
    const written = writeOf(row);

    // Assert
    expect(written).toBe(row.written);
  });
});
