import { describe, expect, it } from 'bun:test';

import fc from 'fast-check';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import { runConfigurationFormatSuite } from '../../../__tests__/configuration-format.suite';
import type { BlockMarks, ConfigurationFile, Setting } from '../../../domain/entities';
import { SettingShape } from '../../../domain/entities';
import { FileFormat } from '../../../domain/value-objects';
import { createConfigurationFormat } from '../configuration-format.adapter';

const format = createConfigurationFormat();

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
  readonly format?: FileFormat;
  readonly marks?: BlockMarks;
  readonly path: string;
  readonly reads?: Setting;
  readonly settings: Setting;
  readonly shape?: SettingShape;
  readonly sorted?: readonly (readonly string[])[];
  readonly text: string;
}

interface MarkedRow extends WriteRow {
  readonly marks: BlockMarks;
  readonly named: readonly string[];
}

const readOf = (row: ReadRow): Setting | undefined =>
  format.read({
    filePath: RepositoryRelativePath.create(row.path),
    ...(row.shape === undefined
      ? {}
      : {
          shape: row.shape,
        }),
    text: row.text,
  });

const noMarks: BlockMarks = {
  blocks: [],
  marks: [],
};

const linesMarked = (input: {
  blocks: readonly BlockId[];
  groups: Readonly<Record<string, readonly string[]>>;
}): BlockMarks => ({
  blocks: input.blocks,
  marks: Object.entries(input.groups).flatMap(([block, lines]) =>
    lines.map((line) => ({
      block: BlockId.create(block),
      keyPath: [
        {
          item: line,
        },
      ],
    })),
  ),
});

const fileOf = (row: WriteRow, text: string): ConfigurationFile => ({
  filePath: RepositoryRelativePath.create(row.path),
  ...(row.format === undefined
    ? {}
    : {
        format: row.format,
      }),
  ...(row.shape === undefined
    ? {}
    : {
        shape: row.shape,
      }),
  text,
});

const writeOf = (row: WriteRow): string =>
  format.write({
    ...fileOf(row, row.text),
    marks: row.marks ?? noMarks,
    settings: row.settings,
    sorted: row.sorted ?? [],
  });

const readBackOf = (row: WriteRow): Setting | undefined => format.read(fileOf(row, writeOf(row)));

const NAMING_COMMENT = /^\s*(?:#|\/\/) (\S+)$/;

const namedBlocksOf = (row: MarkedRow): readonly string[] =>
  writeOf(row)
    .split('\n')
    .flatMap((line) => {
      const name = NAMING_COMMENT.exec(line)?.[1];

      return row.marks.blocks.some((block) => block === name)
        ? [
            String(name),
          ]
        : [];
    });

const writtenOf = (rows: readonly WriteRow[]): Readonly<Record<string, string>> =>
  Object.fromEntries(
    rows.map((row) => [
      row.condition,
      writeOf(row),
    ]),
  );

const SECTION_HEADER = /^\[(.+)\]$/gm;

const sectionsOf = (text: string): readonly string[] =>
  [
    ...text.matchAll(SECTION_HEADER),
  ].map(([, name]) => String(name));

const jsonWrites: readonly WriteRow[] = [
  {
    condition: 'a JSON file is new',
    path: 'biome.json',
    settings: {
      files: [
        'src',
      ],
    },
    text: '',
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
  },
  {
    condition: 'a value spelled otherwise stays as the file spells it',
    path: 'biome.json',
    settings: {
      a: 1,
      b: 3,
    },
    text: '{"a": 1.0, "b": 2}',
  },
  {
    condition: 'a map and a list turn into scalars',
    path: 'biome.json',
    settings: {
      a: 2,
      c: 3,
    },
    text: '{"a": {"b": 1}, "c": [1]}',
  },
  {
    condition: 'a file of blanks is written new',
    path: 'biome.json',
    settings: {
      a: 1,
    },
    text: '\n',
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
  },
];

const jsonMarked: readonly MarkedRow[] = [
  {
    condition: 'a JSONC file takes them above keys and items, its block comments and texts kept',
    marks: {
      blocks: [
        BlockId.create('knip'),
        BlockId.create('uv'),
      ],
      marks: [
        {
          block: BlockId.create('knip'),
          keyPath: [
            'entry',
          ],
        },
        ...[
          'b',
          'c',
        ].map((listed) => ({
          block: BlockId.create('uv'),
          keyPath: [
            'ignore',
            {
              item: listed,
            },
          ],
        })),
        {
          block: BlockId.create('knip'),
          keyPath: [
            'map',
          ],
        },
        {
          block: BlockId.create('knip'),
          keyPath: [
            'inline',
            {
              item: 'd',
            },
          ],
        },
      ],
    },
    named: [
      'knip',
      'uv',
      'knip',
    ],
    path: 'knip.jsonc',
    settings: {
      entry: [
        'a',
      ],
      ignore: [
        'b',
        'c',
      ],
      inline: [
        'd',
      ],
      map: {
        a: 1,
      },
      x: '// knip',
      z: 'w',
    },
    text: `{
  // uv
  "entry": ["a"],
  /* knip */
  "x": "// knip", // knip
  "inline": ["d"],
  "ignore": [
    "b",
    null,
    "c",
  ],
  "z":"w",
  "map": {
    "a": 1,
  },
}
`,
  },
  {
    condition:
      'a JSON file its mark writes with comments holds them, its commas as plain JSON has them',
    format: FileFormat.Jsonc,
    marks: {
      blocks: [
        BlockId.create('tsc'),
        BlockId.create('workspace'),
      ],
      marks: [
        {
          block: BlockId.create('tsc'),
          keyPath: [
            'compilerOptions',
            'strict',
          ],
        },
        {
          block: BlockId.create('workspace'),
          keyPath: [
            'compilerOptions',
            'composite',
          ],
        },
      ],
    },
    named: [
      'workspace',
      'tsc',
    ],
    path: 'tsconfig.json',
    settings: {
      compilerOptions: {
        composite: true,
        list: [
          'a',
        ],
        strict: true,
      },
    },
    text: '{\n  // workspace\n  "compilerOptions": {}\n}\n',
  },
  {
    condition: 'a JSON file holds no comment',
    marks: {
      blocks: [
        BlockId.create('biome'),
      ],
      marks: [
        {
          block: BlockId.create('biome'),
          keyPath: [
            'a',
          ],
        },
      ],
    },
    named: [],
    path: 'biome.json',
    settings: {
      a: 1,
    },
    text: '{}\n',
  },
];

const tomlWrites: readonly WriteRow[] = [
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
  },
  {
    condition: 'a table names a header longer than the width, and a list mixes a table and a text',
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
  },
  {
    condition: 'a new file holds an empty table',
    path: 'bunfig.toml',
    settings: {
      a: {},
    },
    text: '',
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
  },
  {
    condition: 'a root list empties',
    path: 'bunfig.toml',
    settings: {
      e: [],
      v: 1,
    },
    text: 'e = [1]\nv = 1\n',
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
  },
  {
    condition: 'a plain table changes a quoted key that holds a quote of the other kind',
    path: 'bunfig.toml',
    settings: {
      t: {
        "it's": 2,
      },
    },
    text: '[t]\n# keep\n"it\'s" = 1\n',
  },
];

const tomlMarked: readonly MarkedRow[] = [
  {
    condition:
      'a TOML file takes them above tables, keys, items and tables of an array, each a paragraph over the comments of what it names, and drops the old',
    marks: {
      blocks: [
        BlockId.create('gone'),
        BlockId.create('poe'),
        BlockId.create('pytest'),
        BlockId.create('python'),
        BlockId.create('ruff'),
      ],
      marks: [
        {
          block: BlockId.create('poe'),
          keyPath: [
            'title',
          ],
        },
        {
          block: BlockId.create('poe'),
          keyPath: [
            'subtitle',
          ],
        },
        {
          block: BlockId.create('python'),
          keyPath: [
            'project',
            'requires-python',
          ],
        },
        {
          block: BlockId.create('gone'),
          keyPath: [
            'tool',
            'notes',
            'x',
          ],
        },
        {
          block: BlockId.create('ruff'),
          keyPath: [
            'tool',
            'ruff',
            'line-length',
          ],
        },
        ...[
          'A',
          'B',
        ].map((listed) => ({
          block: BlockId.create('ruff'),
          keyPath: [
            'tool',
            'ruff',
            'lint',
            'select',
            {
              item: listed,
            },
          ],
        })),
        ...[
          'C',
          'D',
        ].map((listed) => ({
          block: BlockId.create('pytest'),
          keyPath: [
            'tool',
            'ruff',
            'lint',
            'select',
            {
              item: listed,
            },
          ],
        })),
        {
          block: BlockId.create('poe'),
          keyPath: [
            'tool',
            'poe',
            'executor',
          ],
        },
        {
          block: BlockId.create('poe'),
          keyPath: [
            'tool',
            'poe',
            'after',
          ],
        },
        {
          block: BlockId.create('poe'),
          keyPath: [
            'tool',
            'poe',
            'tasks',
          ],
        },
        {
          block: BlockId.create('poe'),
          keyPath: [
            'tool',
            'x',
            'y',
          ],
        },
        {
          block: BlockId.create('pytest'),
          keyPath: [
            'jobs',
            {
              field: 'name',
              value: 'b',
            },
            'name',
          ],
        },
      ],
    },
    named: [
      'poe',
      'python',
      'ruff',
      'ruff',
      'ruff',
      'pytest',
      'poe',
      'poe',
      'poe',
      'pytest',
    ],
    path: 'pyproject.toml',
    settings: {
      jobs: [
        {
          name: 'a',
        },
        {
          name: 'b',
        },
      ],
      project: {
        name: 'x',
        'requires-python': '>=3.14',
      },
      subtitle: 'y',
      title: 'x',
      tool: {
        notes: {
          text: '# ruff\n# ruff """\nx = 1\n',
        },
        poe: {
          after: 1,
          executor: 'simple',
          mine: [
            1,
            2,
          ],
          tasks: {
            a: 'x',
          },
        },
        ruff: {
          'line-length': 100,
          lint: {
            select: [
              'A',
              'B',
              'C',
              'E',
              'D',
            ],
          },
        },
        x: {
          y: {
            z: 1,
          },
        },
      },
    },
    text: `# mine's "note
title="x"
# mine = own
subtitle = "y"

[project]
name = "x"
# gone

[tool.notes]
text = '''
# ruff
# ruff """
x = 1
'''

[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = [
  "A", # its own
  # note
  "B",
  "C", "E",
  "D",
  # ruff
]

[tool.poe]
executor = "simple"
mine=[1, 2]
after = 1

[tool.poe.tasks]
a = "x"
   
[tool.x.y]
z = 1

[[jobs]]
name = "a"

  [[jobs]]
  name = "b"
`,
  },
];

const yamlWrites: readonly WriteRow[] = [
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
  },
  {
    condition: 'a new text that needs quotes takes single ones',
    path: 'lefthook.yaml',
    settings: {
      glob: '*.md',
      range: '',
    },
    text: '',
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
  },
  {
    condition: 'a key the file writes as a number goes',
    path: 'lefthook.yaml',
    settings: {
      a: 2,
    },
    text: 'a: 1\n1: x\n',
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
  },
  {
    condition: 'a long text is folded as a block at the width every formatter keeps',
    path: 'lefthook.yaml',
    settings: {
      run: 'word '.repeat(30).trim(),
    },
    text: '',
  },
  {
    condition: 'a long text of lines stays a literal block',
    path: 'lefthook.yaml',
    settings: {
      run: `${'word '.repeat(19).trim()}\nnext`,
    },
    text: '',
  },
  {
    condition: 'a text of 80 characters stays on its line',
    path: 'lefthook.yaml',
    settings: {
      run: 'a'.repeat(80),
    },
    text: '',
  },
  {
    condition: 'the file is a map that turns into a list',
    path: 'settings.yml',
    settings: [
      'x',
    ],
    text: 'a: 1\n',
  },
  {
    condition: 'the file is a list that turns into a map',
    path: 'settings.yml',
    settings: {
      list: false,
    },
    text: '- a\n',
  },
];

const yamlMarked: readonly MarkedRow[] = [
  {
    condition:
      'a YAML file takes them above keys and items, never inside a literal block nor a line of flow',
    marks: {
      blocks: [
        BlockId.create('biome'),
        BlockId.create('lefthook'),
      ],
      marks: [
        {
          block: BlockId.create('lefthook'),
          keyPath: [
            'pre-commit',
            'parallel',
          ],
        },
        {
          block: BlockId.create('biome'),
          keyPath: [
            'pre-commit',
            'jobs',
            {
              field: 'name',
              value: 'b',
            },
          ],
        },
        {
          block: BlockId.create('biome'),
          keyPath: [
            'pre-commit',
            'flow',
            {
              item: 1,
            },
          ],
        },
        {
          block: BlockId.create('biome'),
          keyPath: [
            'deep',
            'x',
            'w',
          ],
        },
        ...[
          [
            'deep',
            'x',
            'z',
          ],
          [
            'deep',
            'y',
          ],
        ].map((keyPath) => ({
          block: BlockId.create('lefthook'),
          keyPath,
        })),
        ...[
          'a',
          'b',
        ].map((listed) => ({
          block: BlockId.create('lefthook'),
          keyPath: [
            'list',
            {
              item: listed,
            },
          ],
        })),
      ],
    },
    named: [
      'biome',
      'biome',
      'lefthook',
      'biome',
      'lefthook',
      'lefthook',
      'lefthook',
    ],
    path: 'lefthook.yaml',
    settings: {
      deep: {
        x: {
          w: 2,
          z: 1,
        },
        y: 1,
      },
      list: [
        'a',
        'b',
      ],
      mine: 1,
      'pre-commit': {
        flow: [
          1,
          2,
        ],
        jobs: [
          {
            name: 'a',
            run: '# biome\necho\n\n# note\n',
          },
          {
            name: 'b',
          },
        ],
        folded: 'one\n# two\n',
        parallel: true,
      },
    },
    text: `# top
pre-commit:
  flow: [ 1, 2 ]
  jobs:
    - name: a
      run: |
        # biome
        echo

        # note
    # biome
    - name: b
  folded: >
    one

    # two
  # biome
  parallel: true # biome
mine: 1
deep:
  x:
    w: 2
    # why
    z: 1
  y: 1
list:
  - a
  - null
  - b
`,
  },
  {
    condition: 'a comment opens a YAML file and a literal block closes it',
    marks: {
      blocks: [
        BlockId.create('biome'),
      ],
      marks: [
        {
          block: BlockId.create('biome'),
          keyPath: [
            'first',
          ],
        },
      ],
    },
    named: [
      'biome',
      'biome',
    ],
    path: 'lefthook.yaml',
    settings: {
      first: 1,
      last: '# biome\n',
    },
    text: '# top\nfirst: 1\nlast: |\n  # biome\n',
  },
  {
    condition:
      "a YAML item's literal block holds a line of fewer spaces than the item and a line that names a block, under the file's own comment",
    marks: {
      blocks: [
        BlockId.create('biome'),
      ],
      marks: [],
    },
    named: [
      'biome',
    ],
    path: 'lefthook.yaml',
    settings: {
      list: [
        'a',
        'one\n\n# biome\n',
      ],
    },
    text: 'list:\n  - a\n  # mine\n  - |\n    one\n \n    # biome\n',
  },
];

const iniWrites: readonly WriteRow[] = [
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
  },
  {
    condition: 'an ini-like file is new and its settings give its top pairs after its sections',
    path: '.editorconfig',
    settings: {
      a: {
        b: 1,
      },
      c: {
        d: 2,
      },
      '': {
        top: 1,
      },
    },
    shape: SettingShape.Map,
    text: '',
  },
  {
    condition: 'an ini-like file of top pairs alone gains the section of every file',
    path: '.editorconfig',
    settings: {
      '': {
        root: true,
      },
      '*': {
        indent: 2,
      },
    },
    shape: SettingShape.Map,
    text: 'root = true\n',
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
  },
  {
    condition: 'an ini-like file is given settings that are no map',
    path: '.shellcheckrc',
    reads: {
      a: {},
    },
    settings: [
      'x',
    ],
    shape: SettingShape.Map,
    text: '[a]\nb = 1\n',
  },
  {
    condition: 'an ini-like section is given a value that is no map',
    path: '.editorconfig',
    reads: {
      '*': {},
    },
    settings: {
      '*': 'all',
    },
    text: '[*]\nindent_size = 2\n',
  },
  {
    condition: 'an ini-like file loses a pair named as a field every object holds',
    path: '.editorconfig',
    settings: {
      a: {
        b: 2,
      },
    },
    text: '[a]\ntoString = 1\nb = 2\n',
  },
  {
    condition:
      'an ini-like file is new and its settings give a section that narrows every file first',
    path: '.editorconfig',
    settings: {
      '*.golden.*': {
        trim: false,
      },
      '': {
        root: true,
      },
      '*': {
        indent: 2,
        trim: true,
      },
    },
    shape: SettingShape.Map,
    text: '',
  },
  {
    condition: 'an ini-like file holds only a section that narrows every file',
    path: '.editorconfig',
    settings: {
      '': {
        root: true,
      },
      '*.md': {
        trim: false,
      },
      '*': {
        indent: 2,
      },
    },
    text: 'root = true\n\n[*.md]\ntrim = false\n',
  },
  {
    condition:
      'an ini-like file gains the section of every file above the comment that opens its first section',
    path: '.editorconfig',
    settings: {
      '': {
        root: true,
      },
      '*': {
        indent: 2,
      },
      '*.md': {
        trim: false,
      },
    },
    text: 'root = true\n\n# markdown files keep trailing spaces\n[*.md]\ntrim = false\n',
  },
  {
    condition:
      'an ini-like section gains a pair above the comment that opens the next section, and the last a pair below the comment that closes the file',
    path: '.editorconfig',
    settings: {
      a: {
        b: 1,
        url: 'http://x#y',
        x: 2,
      },
      c: {
        d: 1,
        y: 2,
      },
    },
    text: '[a]\nb = 1\nurl = http://x#y\n  ; about c\n[c]\nd = 1\n# end\n',
  },
];

const iniMarked: readonly MarkedRow[] = [
  {
    condition: 'a file of sections takes them above its top keys, its sections and their keys',
    marks: {
      blocks: [
        BlockId.create('editorconfig'),
        BlockId.create('shfmt'),
      ],
      marks: [
        {
          block: BlockId.create('editorconfig'),
          keyPath: [
            '',
          ],
        },
        {
          block: BlockId.create('editorconfig'),
          keyPath: [
            '*',
            'indent',
          ],
        },
        {
          block: BlockId.create('shfmt'),
          keyPath: [
            '*.sh',
          ],
        },
      ],
    },
    named: [
      'editorconfig',
      'editorconfig',
      'shfmt',
    ],
    path: '.editorconfig',
    settings: {
      '': {
        root: true,
      },
      '*': {
        indent: 2,
        own: 'a;b',
      },
      '*.sh': {
        binary: true,
      },
    },
    shape: SettingShape.Map,
    text: '# mine\n\nroot = true\n\n[*]\nown = a;b\nindent = 2\n\n[*.sh]\nbinary = true\n',
  },
];

const linesWrites: readonly WriteRow[] = [
  {
    condition: 'a file of lines keeps its comments and its own lines, loses a line and gains one',
    path: '.gitignore',
    reads: [
      'kept/',
      'node_modules/',
      'dist/',
    ],
    settings: [
      'node_modules/',
      'kept/',
      'dist/',
    ],
    text: '\n# mine\nkept/\nnode_modules/\ngone/\n',
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
  },
  {
    condition: 'a file of lines keeps a blank line between its own',
    path: '.gitignore',
    settings: [
      'a',
      'b',
    ],
    text: 'a\n\nb\n',
  },
  {
    condition: 'a file of lines is new',
    path: '.dockerignore',
    settings: [
      'node_modules/',
    ],
    shape: SettingShape.List,
    text: '',
  },
  {
    condition: 'a file of lines is given settings that are no list, which leave it empty',
    path: '.gitignore',
    reads: [],
    settings: {
      a: 1,
    },
    shape: SettingShape.List,
    text: 'gone/\n',
  },
];

const linesMarkedWrites: readonly MarkedRow[] = [
  {
    condition:
      'a file of lines keeps its own lines and comments, then each group under its name, a gone group and a blank between what went aside',
    marks: linesMarked({
      blocks: [
        BlockId.create('git'),
        BlockId.create('tsc'),
        BlockId.create('vite'),
      ],
      groups: {
        vite: [
          'dist/',
          'build/',
        ],
        git: [
          '.env',
        ],
      },
    }),
    named: [
      'vite',
      'git',
    ],
    path: '.gitignore',
    reads: [
      '.source/',
      'local.txt',
      'added.txt',
      'dist/',
      'build/',
      '.env',
    ],
    settings: [
      'dist/',
      'build/',
      '.env',
      '.source/',
      'local.txt',
      'added.txt',
    ],
    text: '# generated content\n.source/\ndist/\n\n  # tsc\n*.tsbuildinfo\n  \n  local.txt\n\n\n# vite\nbuild/\n',
  },
  {
    condition: 'a file of lines laid out in groups is laid out again as it is',
    marks: linesMarked({
      blocks: [
        BlockId.create('vite'),
      ],
      groups: {
        vite: [
          'dist/',
        ],
      },
    }),
    named: [
      'vite',
    ],
    path: '.gitignore',
    reads: [
      'own/',
      'more/',
      'dist/',
    ],
    settings: [
      'dist/',
      'own/',
      'more/',
    ],
    text: '# mine\nown/\n\n\nmore/\n\n# vite\ndist/\n',
  },
  {
    condition: 'a file of lines of no own line opens with its first group',
    marks: linesMarked({
      blocks: [
        BlockId.create('vite'),
      ],
      groups: {
        vite: [
          'dist/',
        ],
      },
    }),
    named: [
      'vite',
    ],
    path: '.gitignore',
    settings: [
      'dist/',
    ],
    text: '',
  },
  {
    condition:
      'a source file keeps its own lines and gains a group under a comment of its language',
    marks: linesMarked({
      blocks: [
        BlockId.create('ts-reset'),
      ],
      groups: {
        'ts-reset': [
          "import '@total-typescript/ts-reset';",
        ],
      },
    }),
    named: [
      'ts-reset',
    ],
    path: 'src/reset.d.ts',
    reads: [
      "import './own'; // kept",
      "import '@total-typescript/ts-reset';",
    ],
    settings: [
      "import '@total-typescript/ts-reset';",
      "import './own'; // kept",
    ],
    text: "// mine\n  // indented\nimport './own'; // kept\n",
  },
];

const markedWrites: readonly MarkedRow[] = [
  ...jsonMarked,
  ...tomlMarked,
  ...yamlMarked,
  ...iniMarked,
  ...linesMarkedWrites,
];

const readBacks = [
  ...jsonWrites,
  ...tomlWrites,
  ...yamlWrites,
  ...iniWrites,
  ...linesWrites,
  ...markedWrites,
].map((row) => ({
  ...row,
  reads: row.reads ?? row.settings,
}));

const keys = fc.oneof(
  fc.constantFrom('name', 'x.y', 'my key', "it's", '"q"', '1', 'true', '[x]', '#k', '-'),
  fc.string({
    maxLength: 6,
    minLength: 1,
  }),
);
const texts = fc.oneof(
  fc.constantFrom(
    '',
    'yes',
    'null',
    '~',
    '1.0',
    'true',
    '# c',
    'a: b',
    '- x',
    'x\ny',
    ' lead',
    '*.md',
  ),
  fc.string({
    maxLength: 10,
  }),
);
const scalars = fc.oneof(
  fc.boolean(),
  fc.integer(),
  fc
    .double({
      noDefaultInfinity: true,
      noNaN: true,
    })
    .filter((number) => !Object.is(number, -0)),
  texts,
);
const { map: maps } = fc.letrec<{
  list: readonly Setting[];
  map: Readonly<Record<string, Setting>>;
  setting: Setting;
}>((tie) => ({
  list: fc.array(tie('setting'), {
    maxLength: 4,
  }),
  map: fc.dictionary(keys, tie('setting'), {
    maxKeys: 4,
    noNullPrototype: true,
  }),
  setting: fc.oneof(
    {
      depthSize: 'small',
    },
    scalars,
    tie('list'),
    tie('map'),
  ),
}));

const sections = fc
  .dictionary(
    fc.oneof(fc.constant(''), fc.stringMatching(/^[^\n[\]]+$/)),
    fc.dictionary(
      fc.stringMatching(/^[^\s#;=[][^=\n]*$/).map((key) => key.trimEnd()),
      fc.oneof(
        fc.boolean(),
        fc.nat(),
        fc.stringMatching(/^\S(?:.*\S)?$/).filter((text) => !/^(?:true|false|\d+)$/.test(text)),
      ),
      {
        maxKeys: 3,
        noNullPrototype: true,
      },
    ),
    {
      maxKeys: 3,
      noNullPrototype: true,
    },
  )
  .filter((given) => Object.keys(given[''] ?? {}).length > 0 || !('' in given));

const lineLists = fc.array(fc.stringMatching(/^[^\s#;](?:.*\S)?$/), {
  maxLength: 5,
});

const codeLineLists = fc.array(
  fc.stringMatching(/^\S(?:.*\S)?$/).filter((line) => !line.startsWith('//')),
  {
    maxLength: 5,
  },
);

const isReadBackIn =
  (row: Omit<WriteRow, 'condition' | 'settings' | 'text'>) =>
  (settings: Setting): boolean =>
    Bun.deepEquals(
      readBackOf({
        ...row,
        condition: '',
        settings,
        text: '',
      }),
      settings,
      true,
    );

interface FixedRow extends WriteRow {
  readonly comments: readonly string[];
  readonly reads: Setting;
}

const COMMENT_LINE = /^\s*(?:#|\/\/)/;

const meaningOf = (
  row: WriteRow,
): {
  readonly comments: readonly string[];
  readonly reads: Setting | undefined;
} => {
  const written = writeOf(row);

  return {
    comments: written
      .split('\n')
      .filter((line) => COMMENT_LINE.test(line))
      .map((line) => line.trim()),
    reads: format.read(fileOf(row, written)),
  };
};

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
      condition: 'a source file holds lines of code, its comments aside',
      path: 'src/reset.d.ts',
      settings: [
        "import '@total-typescript/ts-reset';",
        "import './own';",
      ],
      text: "// ts-reset\nimport '@total-typescript/ts-reset';\n\n  /// <reference types=\"vite/client\" />\nimport './own';\n",
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
      condition: 'an ini-like file names its sections as fields every object holds',
      path: '.editorconfig',
      settings: {
        constructor: {
          x: 1,
        },
        valueOf: {},
      },
      text: '[valueOf]\n[constructor]\nx = 1\n',
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
      filePath: RepositoryRelativePath.create('aliases.yaml'),
      text: aliasesText(aliases),
    });

    // Assert
    expect(read).toStrictEqual(settings);
  });

  it.each([
    {
      file: {
        path: 'biome.json',
      },
      name: 'JSON',
      settings: maps,
    },
    {
      file: {
        path: 'knip.jsonc',
      },
      name: 'JSONC',
      settings: maps,
    },
    {
      file: {
        path: 'pyproject.toml',
      },
      name: 'TOML',
      settings: maps,
    },
    {
      file: {
        path: 'lefthook.yaml',
      },
      name: 'YAML',
      settings: maps,
    },
    {
      file: {
        path: '.editorconfig',
        shape: SettingShape.Map,
      },
      name: 'sections',
      settings: sections,
    },
    {
      file: {
        path: '.gitignore',
        shape: SettingShape.List,
      },
      name: 'lines',
      settings: lineLists,
    },
    {
      file: {
        path: 'src/reset.d.ts',
        shape: SettingShape.List,
      },
      name: 'code lines',
      settings: codeLineLists,
    },
  ])('should read back any settings it writes to a new file of $name', ({ file, settings }) => {
    // Act
    const run = fc.check(fc.property(settings, isReadBackIn(file)));

    // Assert
    expect(run.counterexample).toBeNull();
  });

  it.each<FixedRow>([
    {
      comments: [],
      condition: 'a JSONC map loses its last key, a comma after it',
      path: 'knip.jsonc',
      reads: {},
      settings: {},
      text: '{\n  "a": 1,\n}\n',
    },
    {
      comments: [],
      condition: 'a map within a JSONC map loses its last key, a comma after it',
      path: 'knip.jsonc',
      reads: {
        a: {},
      },
      settings: {
        a: {},
      },
      text: '{\n  "a": {\n    "b": 1,\n  },\n}\n',
    },
    {
      comments: [
        '// c',
      ],
      condition: 'a JSON map holding a comment alone gains a key',
      path: 'biome.json',
      reads: {
        a: 1,
      },
      settings: {
        a: 1,
      },
      text: '{\n  // c\n}\n',
    },
    {
      comments: [],
      condition: 'a new YAML file is given no key',
      path: 'lefthook.yaml',
      reads: {},
      settings: {},
      text: '',
    },
    {
      comments: [
        '# c',
      ],
      condition: 'a YAML file holding a comment alone gains a key',
      path: 'lefthook.yaml',
      reads: {
        a: 1,
      },
      settings: {
        a: 1,
      },
      text: '# c\n',
    },
    {
      comments: [],
      condition: 'a TOML array of tables whose name holds an escaped quote goes',
      path: 'bunfig.toml',
      reads: {},
      settings: {},
      text: '[["\\"q\\""]]\nx = 1\n',
    },
    {
      comments: [],
      condition: 'a file of sections names a section after the prototype every object holds',
      path: '.editorconfig',
      reads: {
        ['__proto__']: {},
      },
      settings: {},
      text: '[__proto__]\ntoString = 1\n',
    },
    {
      comments: [],
      condition: 'a TOML key named after a field every object holds goes',
      path: 'bunfig.toml',
      reads: {
        b: 2,
      },
      settings: {
        b: 2,
      },
      text: 'toString = 1\nb = 2\n',
    },
    {
      comments: [],
      condition: 'a YAML key named after a field every object holds goes',
      path: 'lefthook.yaml',
      reads: {
        b: 2,
      },
      settings: {
        b: 2,
      },
      text: 'toString: 1\nb: 2\n',
    },
  ])('should write what reads back as the settings, its comments kept, when $condition', (row) => {
    // Act
    const meant = meaningOf(row);

    // Assert
    expect(meant).toStrictEqual({
      comments: row.comments,
      reads: row.reads,
    });
  });

  it.each(readBacks)(
    'should write a text that reads back as the settings when $condition',
    (row) => {
      // Act
      const read = readBackOf(row);

      // Assert
      expect(read).toStrictEqual(row.reads);
    },
  );

  it.each(markedWrites)(
    'should name the block above what it alone gives when $condition',
    (row) => {
      // Act
      const named = namedBlocksOf(row);

      // Assert
      expect(named).toStrictEqual(row.named);
    },
  );

  it.each(markedWrites)('should write its own text again unchanged when $condition', (row) => {
    // Arrange
    const written = writeOf(row);

    // Act
    const again = writeOf({
      ...row,
      text: written,
    });

    // Assert
    expect(again).toBe(written);
  });

  it.each([
    {
      condition: 'its settings give the narrower section first',
      settings: {
        '*.golden.*': {
          trim: false,
        },
        '*': {
          trim: true,
        },
      },
      text: '',
    },
    {
      condition: 'the file holds only the narrower section',
      settings: {
        '*.golden.*': {
          trim: false,
        },
        '*': {
          trim: true,
        },
      },
      text: '[*.golden.*]\ntrim = false\n',
    },
  ])(
    'should write the section of every file before a section that narrows it when $condition',
    ({ settings, text }) => {
      // Act
      const order = sectionsOf(
        writeOf({
          condition: 'ordered',
          path: '.editorconfig',
          settings,
          shape: SettingShape.Map,
          text,
        }),
      );

      // Assert
      expect(order).toStrictEqual([
        '*',
        '*.golden.*',
      ]);
    },
  );

  it.each([
    {
      golden: new URL('json.golden.txt', import.meta.url),
      name: 'JSON',
      rows: [
        ...jsonWrites,
        ...jsonMarked,
      ],
    },
    {
      golden: new URL('toml.golden.txt', import.meta.url),
      name: 'TOML',
      rows: [
        ...tomlWrites,
        ...tomlMarked,
      ],
    },
    {
      golden: new URL('yaml.golden.txt', import.meta.url),
      name: 'YAML',
      rows: [
        ...yamlWrites,
        ...yamlMarked,
      ],
    },
    {
      golden: new URL('ini.golden.txt', import.meta.url),
      name: 'sections',
      rows: [
        ...iniWrites,
        ...iniMarked,
      ],
    },
    {
      golden: new URL('lines.golden.txt', import.meta.url),
      name: 'lines',
      rows: [
        ...linesWrites,
        ...linesMarkedWrites,
      ],
    },
  ])('should write the texts of $name as its golden file shows', async ({ golden, rows }) => {
    // Act
    const written = goldenOf(writtenOf(rows));

    // Assert
    expect(written).toBe(await goldenFileText(golden, written));
  });
});

describe('createConfigurationFormat: keys kept sorted', () => {
  it.each<{
    canSortKeys: boolean;
    format?: FileFormat;
    writtenPath: string;
  }>([
    {
      canSortKeys: true,
      writtenPath: 'packages/app/package.json',
    },
    {
      canSortKeys: true,
      writtenPath: 'knip.jsonc',
    },
    {
      canSortKeys: true,
      writtenPath: 'lefthook.yaml',
    },
    {
      canSortKeys: true,
      writtenPath: '.github/dependabot.yml',
    },
    {
      canSortKeys: true,
      format: FileFormat.Jsonc,
      writtenPath: '.swcrc',
    },
    {
      canSortKeys: false,
      writtenPath: 'pyproject.toml',
    },
    {
      canSortKeys: false,
      writtenPath: 'src/reset.d.ts',
    },
    {
      canSortKeys: false,
      writtenPath: '.editorconfig',
    },
    {
      canSortKeys: false,
      writtenPath: '.shellcheckrc',
    },
  ])('should tell whether $writtenPath keeps sorted keys', ({ canSortKeys, ...target }) => {
    // Act
    const sortable = format.canSortKeys(target);

    // Assert
    expect(sortable).toBe(canSortKeys);
  });
});

runConfigurationFormatSuite({
  format,
  name: 'createConfigurationFormat',
});
