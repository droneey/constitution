import { describe, expect, it } from 'bun:test';

import type { Contribution } from '../merged-file.entity';
import { MergedFile } from '../merged-file.entity';
import { PresetValue, ValueKind } from '../preset-value.entity';
import { PresetsCode } from '../presets-finding.entity';
import type { Setting } from '../setting.entity';

const map = (pairs: Readonly<Record<string, PresetValue>>): PresetValue =>
  PresetValue.mapOf(
    Object.entries(pairs).map(([key, held]) => ({
      key,
      value: held,
    })),
  );

const plain = (setting: Setting): PresetValue => PresetValue.plain(setting);

const markedOf = (kind: ValueKind.Default | ValueKind.Replace, setting: Setting): PresetValue => ({
  kind,
  setting,
});

const from = (source: string, given: PresetValue): Contribution => ({
  group: source,
  source,
  value: given,
});

describe('MergedFile.merge', () => {
  it('should merge maps deeply, join lists once, and keep the repeats one entry writes', () => {
    // Arrange
    const contributions = [
      from(
        'a',
        map({
          files: map({
            includes: plain([
              '**',
              '!!dist',
            ]),
          }),
          'forbidden[name=no-cycles]': map({
            severity: plain('error'),
          }),
        }),
      ),
      from(
        'b',
        map({
          files: map({
            includes: plain([
              '!!dist',
              'x',
              'x',
            ]),
          }),
          linter: map({
            enabled: plain(true),
          }),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [],
      problems: [],
      value: {
        files: {
          includes: [
            '**',
            '!!dist',
            'x',
            'x',
          ],
        },
        'forbidden[name=no-cycles]': {
          severity: 'error',
        },
        linter: {
          enabled: true,
        },
      },
    });
  });

  it('should keep the path of each map an entry marks sorted, once', () => {
    // Arrange
    const contributions = [
      from(
        'a',
        map({
          scripts: PresetValue.sortedMapOf([
            {
              key: 'lint',
              value: plain('biome'),
            },
          ]),
        }),
      ),
      from(
        'b',
        map({
          scripts: PresetValue.sortedMapOf([
            {
              key: 'check',
              value: plain('all'),
            },
          ]),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [],
      problems: [],
      sorted: [
        [
          'scripts',
        ],
      ],
      value: {
        scripts: {
          check: 'all',
          lint: 'biome',
        },
      },
    });
  });

  it('should place inserts after their slot, an insert two entries make once, and take the slots out', () => {
    // Arrange
    const contributions = [
      from(
        'owner',
        map({
          jobs: plain([
            'first',
            {
              slot: 'checks',
            },
            'last',
            {
              slot: 'checks',
            },
          ]),
        }),
      ),
      from(
        'first',
        map({
          'jobs@checks': plain([
            'lint',
            'types',
          ]),
        }),
      ),
      from(
        'twice',
        map({
          'jobs@checks': plain([
            'lint',
            'types',
          ]),
        }),
      ),
      from(
        'single',
        map({
          'jobs@checks': map({
            name: plain('specs'),
          }),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [],
      problems: [],
      value: {
        jobs: [
          'first',
          'lint',
          'types',
          {
            name: 'specs',
          },
          'last',
        ],
      },
    });
  });

  it('should place the inserts of two slots each after its own', () => {
    // Arrange
    const contributions = [
      from(
        'owner',
        map({
          jobs: plain([
            {
              slot: 'first',
            },
            'middle',
            {
              slot: 'second',
            },
          ]),
        }),
      ),
      from(
        'inserts',
        map({
          'jobs@first': plain([
            'a',
          ]),
          'jobs@second': plain([
            'b',
          ]),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged.value).toStrictEqual({
      jobs: [
        'a',
        'middle',
        'b',
      ],
    });
  });

  it.each([
    {
      code: PresetsCode.MissingSlot,
      condition: 'the list places no such slot',
      owner: plain([
        'last',
      ]),
    },
    {
      code: PresetsCode.SlotInNoList,
      condition: 'the path holds no list',
      owner: plain('scalar'),
    },
  ])('should find an insert it cannot place when $condition', ({ code, owner }) => {
    // Arrange
    const contributions = [
      from(
        'owner',
        map({
          jobs: owner,
        }),
      ),
      from(
        'insert',
        map({
          'jobs@checks': plain('lint'),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged.problems).toStrictEqual([
      {
        code,
        details: {
          setting: 'jobs',
          slot: 'checks',
        },
      },
    ]);
  });

  it.each<{
    condition: string;
    first: PresetValue;
    second: PresetValue;
  }>([
    {
      condition: 'two scalars differ',
      first: plain(1),
      second: plain(2),
    },
    {
      condition: 'a list meets a scalar',
      first: plain('x'),
      second: plain([
        'x',
      ]),
    },
    {
      condition: 'a map meets a scalar',
      first: plain('x'),
      second: map({
        y: plain(1),
      }),
    },
    {
      condition: 'a scalar meets a map',
      first: map({
        c: plain(1),
      }),
      second: plain(2),
    },
    {
      condition: 'a scalar meets a list',
      first: plain([
        'x',
      ]),
      second: plain('x'),
    },
  ])('should find a clash that names both entries when $condition', ({ first, second }) => {
    // Arrange
    const contributions = [
      from(
        'first',
        map({
          a: map({
            b: first,
          }),
        }),
      ),
      from(
        'second',
        map({
          a: map({
            b: second,
          }),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged.problems).toStrictEqual([
      {
        code: PresetsCode.Clash,
        details: {
          setting: 'a.b',
          sources: [
            'first',
            'second',
          ],
        },
      },
    ]);
  });

  it('should give a replaced path its replacer, whatever clashed there, and find two replacers that differ', () => {
    // Arrange
    const contributions = [
      from(
        'a',
        map({
          rules: plain(1),
          level: markedOf(ValueKind.Replace, 'warn'),
        }),
      ),
      from(
        'b',
        map({
          rules: plain(2),
          level: markedOf(ValueKind.Replace, 'error'),
        }),
      ),
      from(
        'c',
        map({
          rules: markedOf(ValueKind.Replace, {
            all: true,
          }),
          level: markedOf(ValueKind.Replace, 'warn'),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [],
      problems: [
        {
          code: PresetsCode.TwoReplacers,
          details: {
            setting: 'level',
            sources: [
              'a',
              'b',
            ],
          },
        },
      ],
      value: {
        level: 'warn',
        rules: {
          all: true,
        },
      },
    });
  });

  it('should replace the whole file with a replacer of its root', () => {
    // Arrange
    const contributions = [
      from(
        'a',
        map({
          kept: plain(false),
        }),
      ),
      from(
        'b',
        markedOf(ValueKind.Replace, [
          'only',
        ]),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged.value).toStrictEqual([
      'only',
    ]);
  });

  it('should keep the defaults apart, each path and value once', () => {
    // Arrange
    const contributions = [
      from(
        'a',
        map({
          test: map({
            randomize: markedOf(ValueKind.Default, true),
          }),
        }),
      ),
      from(
        'b',
        map({
          test: map({
            randomize: markedOf(ValueKind.Default, true),
          }),
        }),
      ),
      from(
        'c',
        map({
          test: map({
            randomize: markedOf(ValueKind.Default, false),
          }),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [
        {
          path: [
            'test',
            'randomize',
          ],
          value: true,
        },
        {
          path: [
            'test',
            'randomize',
          ],
          value: false,
        },
      ],
      problems: [],
      value: {},
    });
  });

  it('should keep a map an entry writes empty, and leave out one only its defaults or inserts opened', () => {
    // Arrange
    const contributions = [
      from(
        'a',
        map({
          kept: map({}),
          opened: map({
            randomize: markedOf(ValueKind.Default, true),
            'jobs@checks': plain('lint'),
          }),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged.value).toStrictEqual({
      kept: {},
    });
  });

  it.each<{
    condition: string;
    first: Setting;
    second: Setting;
    whole: Setting;
  }>([
    {
      condition: 'two give lines',
      first: [
        'node_modules/',
        'dist/',
      ],
      second: [
        'dist/',
        '.cache/',
      ],
      whole: [
        'node_modules/',
        'dist/',
        '.cache/',
      ],
    },
    {
      condition: 'two give keys',
      first: {
        a: 1,
        b: 1,
      },
      second: {
        b: 2,
        c: 3,
      },
      whole: {
        a: 1,
        b: 2,
        c: 3,
      },
    },
    {
      condition: 'two give the same text',
      first: 'text\n',
      second: 'text\n',
      whole: 'text\n',
    },
  ])('should unite the whole-file defaults when $condition', ({ first, second, whole }) => {
    // Arrange
    const contributions = [
      from('a', markedOf(ValueKind.Default, first)),
      from('b', markedOf(ValueKind.Default, second)),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [],
      problems: [],
      whole,
    });
  });

  it.each<{
    condition: string;
    contributions: readonly Contribution[];
  }>([
    {
      condition: 'two give two texts',
      contributions: [
        from('a', markedOf(ValueKind.Default, 'one\n')),
        from('c', markedOf(ValueKind.Default, 'two\n')),
      ],
    },
    {
      condition: 'lines meet keys',
      contributions: [
        from(
          'a',
          markedOf(ValueKind.Default, [
            'dist/',
          ]),
        ),
        from(
          'c',
          markedOf(ValueKind.Default, {
            root: true,
          }),
        ),
      ],
    },
    {
      condition: 'keys meet a text',
      contributions: [
        from(
          'a',
          markedOf(ValueKind.Default, {
            root: true,
          }),
        ),
        from('c', markedOf(ValueKind.Default, 'root = true\n')),
      ],
    },
    {
      condition: 'an entry writes the file’s value before them',
      contributions: [
        from(
          'b',
          map({
            width: plain(100),
          }),
        ),
        from('a', markedOf(ValueKind.Default, 'one\n')),
        from('c', markedOf(ValueKind.Default, 'two\n')),
      ],
    },
  ])(
    'should find a clash of the whole-file defaults that names both when $condition',
    ({ contributions }) => {
      // Act
      const merged = MergedFile.merge(contributions);

      // Assert
      expect(merged.problems).toStrictEqual([
        {
          code: PresetsCode.Clash,
          details: {
            setting: '',
            sources: [
              'a',
              'c',
            ],
          },
        },
      ]);
    },
  );
});
