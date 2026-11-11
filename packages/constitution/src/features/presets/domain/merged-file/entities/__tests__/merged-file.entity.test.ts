import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import type { Setting, WholeDefault } from '../../../setting/entities';
import { Joining, PresetValue, ValueKind, WholeKind } from '../../../setting/entities';
import type { PlacedFlaw } from '../../../shared/entities';
import { InheritanceFlaw, PathSide, PresetsCode } from '../../../shared/entities';
import type { Contribution } from '../merged-file.entity';
import { MergedFile } from '../merged-file.entity';

const map = (pairs: Readonly<Record<string, PresetValue>>): PresetValue =>
  PresetValue.mapOf(
    Object.entries(pairs).map(([key, held]) => ({
      key,
      value: held,
    })),
  );

const plain = (setting: Setting): PresetValue => PresetValue.plain(setting);

const markedOf = (
  kind: ValueKind.Copy | ValueKind.Default | ValueKind.Inherit | ValueKind.Replace,
  setting: Setting,
): PresetValue => ({
  joining: Joining.None,
  kind,
  setting,
});

const from = (source: string, given: PresetValue): Contribution => ({
  block: BlockId.create(source),
  source,
  value: given,
});

const inherits = (source: Setting): PresetValue => markedOf(ValueKind.Inherit, source);

const SETTINGS_OF_EACH_TOOL = 'stages.*.tools.<tool>.settings';
const TOOLS_SETTINGS = 'tools.<tool>.settings';

const flawAt = (side: PathSide, step: number, flaw: InheritanceFlaw): PlacedFlaw => ({
  flaw,
  side,
  step,
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

  it("should report two replacing inserts of one slot that differ, and keep the first's", () => {
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
          ]),
        }),
      ),
      from(
        'a',
        map({
          'jobs@checks': markedOf(ValueKind.Replace, [
            'lint',
          ]),
        }),
      ),
      from(
        'b',
        map({
          'jobs@checks': markedOf(ValueKind.Replace, [
            'types',
          ]),
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
            settingPath: 'jobs@checks',
            sources: [
              'a',
              'b',
            ],
          },
        },
      ],
      value: {
        jobs: [
          'first',
          'lint',
        ],
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
          settingPath: 'jobs',
          slot: 'checks',
        },
      },
    ]);
  });

  it('should insert into the element that places the slot, whichever entry comes first', () => {
    // Arrange
    const contributions = [
      from(
        'insert',
        map({
          'overrides[slot=injected]': map({
            'includes@injected': plain([
              '*.adapter.ts',
            ]),
          }),
        }),
      ),
      from(
        'owner',
        map({
          overrides: plain([
            {
              includes: [
                '*.controller.ts',
                {
                  slot: 'injected',
                },
              ],
              linter: {
                enabled: false,
              },
            },
            {
              includes: [
                '*.ts',
              ],
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
      value: {
        overrides: [
          {
            includes: [
              '*.controller.ts',
              '*.adapter.ts',
            ],
            linter: {
              enabled: false,
            },
          },
          {
            includes: [
              '*.ts',
            ],
          },
        ],
      },
    });
  });

  it('should take out the slot of an element that no entry fills', () => {
    // Arrange
    const contributions = [
      from(
        'owner',
        map({
          overrides: plain([
            {
              includes: [
                '*.controller.ts',
                {
                  slot: 'injected',
                },
              ],
            },
          ]),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged.value).toStrictEqual({
      overrides: [
        {
          includes: [
            '*.controller.ts',
          ],
        },
      ],
    });
  });

  it.each([
    {
      code: PresetsCode.MissingSlot,
      condition: 'no element places the slot',
      owner: plain([
        {
          includes: [
            '*.ts',
          ],
        },
      ]),
    },
    {
      code: PresetsCode.SlotPlacedTwice,
      condition: 'two elements place the slot',
      owner: plain([
        {
          includes: [
            {
              slot: 'injected',
            },
          ],
        },
        {
          excludes: [
            {
              slot: 'injected',
            },
          ],
        },
      ]),
    },
    {
      code: PresetsCode.SlotInNoList,
      condition: 'the address names no list',
      owner: plain('scalar'),
    },
  ])(
    'should find an insert into an element addressed by its slot when $condition',
    ({ code, owner }) => {
      // Arrange
      const contributions = [
        from(
          'owner',
          map({
            linter: map({
              overrides: owner,
            }),
          }),
        ),
        from(
          'insert',
          map({
            linter: map({
              'overrides[slot=injected]': map({
                'includes@injected': plain('*.adapter.ts'),
              }),
            }),
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
            settingPath: 'linter.overrides',
            slot: 'injected',
          },
        },
      ]);
    },
  );

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
          settingPath: 'a.b',
          sources: [
            'first',
            'second',
          ],
        },
      },
    ]);
  });

  it("should keep the setting a map clashes with, and place none of the map's pairs", () => {
    // Arrange
    const contributions = [
      from(
        'first',
        map({
          a: plain('x'),
        }),
      ),
      from(
        'second',
        map({
          a: map({
            y: plain(1),
          }),
        }),
      ),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged.value).toStrictEqual({
      a: 'x',
    });
  });

  it('should give a replaced path its replacer, whatever clashed there, and find two replacers that differ and a clash no replacer settles', () => {
    // Arrange
    const contributions = [
      from(
        'a',
        map({
          rules: plain(1),
          level: markedOf(ValueKind.Replace, 'warn'),
          width: plain(1),
        }),
      ),
      from(
        'b',
        map({
          rules: plain(2),
          level: markedOf(ValueKind.Replace, 'error'),
          width: plain(2),
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
          code: PresetsCode.Clash,
          details: {
            settingPath: 'width',
            sources: [
              'a',
              'b',
            ],
          },
        },
        {
          code: PresetsCode.TwoReplacers,
          details: {
            settingPath: 'level',
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
        width: 1,
      },
    });
  });

  it('should make no file of a whole-file default that is a number', () => {
    // Arrange
    const contributions = [
      from('a', markedOf(ValueKind.Default, 1)),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [],
      problems: [],
    });
  });

  it('should hold one copy of a file once, and find two that copy other files', () => {
    // Arrange
    const contributions = [
      from('a', markedOf(ValueKind.Copy, 'presets/one.grit')),
      from('b', markedOf(ValueKind.Copy, 'presets/one.grit')),
      from('c', markedOf(ValueKind.Copy, 'presets/two.grit')),
    ];

    // Act
    const merged = MergedFile.merge(contributions);

    // Assert
    expect(merged).toStrictEqual({
      defaults: [],
      problems: [
        {
          code: PresetsCode.Clash,
          details: {
            settingPath: '',
            sources: [
              'a',
              'c',
            ],
          },
        },
      ],
      value: 'presets/one.grit',
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
          keyPath: [
            'test',
            'randomize',
          ],
          value: true,
        },
        {
          keyPath: [
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
    whole: WholeDefault;
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
      whole: {
        kind: WholeKind.Added,
        setting: [
          'node_modules/',
          'dist/',
          '.cache/',
        ],
      },
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
        kind: WholeKind.Added,
        setting: {
          a: 1,
          b: 2,
          c: 3,
        },
      },
    },
    {
      condition: 'two give the same text',
      first: 'text\n',
      second: 'text\n',
      whole: {
        kind: WholeKind.Text,
        text: 'text\n',
      },
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
            settingPath: '',
            sources: [
              'a',
              'c',
            ],
          },
        },
      ]);
    },
  );

  it.each<{
    condition: string;
    contributions: readonly Contribution[];
    file: Setting;
  }>([
    {
      condition: 'the inherited map joins the inheriting one key by key, at every depth',
      contributions: [
        from(
          'a',
          map({
            [SETTINGS_OF_EACH_TOOL]: inherits(TOOLS_SETTINGS),
            stages: plain([
              {
                tools: {
                  lint: {
                    settings: {
                      limits: {
                        memory: 2,
                      },
                    },
                  },
                },
              },
            ]),
            tools: plain({
              lint: {
                settings: {
                  limits: {
                    cpu: 1,
                  },
                  strict: true,
                },
              },
            }),
          }),
        ),
      ],
      file: {
        stages: [
          {
            tools: {
              lint: {
                settings: {
                  limits: {
                    cpu: 1,
                    memory: 2,
                  },
                  strict: true,
                },
              },
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              limits: {
                cpu: 1,
              },
              strict: true,
            },
          },
        },
      },
    },
    {
      condition: 'the inherited list goes first and the inheriting one adds the items it lacks',
      contributions: [
        from(
          'a',
          map({
            [SETTINGS_OF_EACH_TOOL]: inherits(TOOLS_SETTINGS),
            stages: plain([
              {
                tools: {
                  lint: {
                    settings: {
                      paths: [
                        'lib',
                        'tests',
                      ],
                    },
                  },
                },
              },
            ]),
            tools: plain({
              lint: {
                settings: {
                  paths: [
                    'src',
                    'lib',
                  ],
                },
              },
            }),
          }),
        ),
      ],
      file: {
        stages: [
          {
            tools: {
              lint: {
                settings: {
                  paths: [
                    'src',
                    'lib',
                    'tests',
                  ],
                },
              },
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              paths: [
                'src',
                'lib',
              ],
            },
          },
        },
      },
    },
    {
      condition: 'the inheriting value is a scalar or of another kind than the inherited one',
      contributions: [
        from(
          'a',
          map({
            [SETTINGS_OF_EACH_TOOL]: inherits(TOOLS_SETTINGS),
            stages: plain([
              {
                tools: {
                  lint: {
                    settings: {
                      level: {
                        value: 2,
                      },
                      limits: 'none',
                      paths: 'none',
                      strict: false,
                    },
                  },
                },
              },
            ]),
            tools: plain({
              lint: {
                settings: {
                  level: 'high',
                  limits: {
                    cpu: 1,
                  },
                  paths: [
                    'src',
                  ],
                  strict: true,
                },
              },
            }),
          }),
        ),
      ],
      file: {
        stages: [
          {
            tools: {
              lint: {
                settings: {
                  level: {
                    value: 2,
                  },
                  limits: 'none',
                  paths: 'none',
                  strict: false,
                },
              },
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              level: 'high',
              limits: {
                cpu: 1,
              },
              paths: [
                'src',
              ],
              strict: true,
            },
          },
        },
      },
    },
    {
      condition: 'a named step binds each key it meets, and a key step passes its siblings by',
      contributions: [
        from(
          'a',
          map({
            'stages.*.tools.<tool-name>.settings': inherits('tools.<tool-name>.settings'),
            stages: plain([
              {
                notes: {
                  lint: {
                    settings: {
                      fix: false,
                    },
                  },
                },
                tools: {
                  lint: {
                    settings: {
                      fix: false,
                    },
                  },
                  test: {
                    settings: {
                      bail: true,
                    },
                  },
                },
              },
            ]),
            tools: plain({
              lint: {
                settings: {
                  strict: true,
                },
              },
              test: {
                settings: {
                  timeout: 10,
                },
              },
            }),
          }),
        ),
      ],
      file: {
        stages: [
          {
            notes: {
              lint: {
                settings: {
                  fix: false,
                },
              },
            },
            tools: {
              lint: {
                settings: {
                  fix: false,
                  strict: true,
                },
              },
              test: {
                settings: {
                  bail: true,
                  timeout: 10,
                },
              },
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              strict: true,
            },
          },
          test: {
            settings: {
              timeout: 10,
            },
          },
        },
      },
    },
    {
      condition: 'several items of a list each hold the inheriting path',
      contributions: [
        from(
          'a',
          map({
            [SETTINGS_OF_EACH_TOOL]: inherits(TOOLS_SETTINGS),
            stages: plain([
              {
                tools: {
                  lint: {
                    settings: {
                      fix: true,
                    },
                  },
                },
              },
              {
                tools: {
                  lint: {
                    settings: {
                      fix: false,
                    },
                  },
                },
              },
            ]),
            tools: plain({
              lint: {
                settings: {
                  strict: true,
                },
              },
            }),
          }),
        ),
      ],
      file: {
        stages: [
          {
            tools: {
              lint: {
                settings: {
                  fix: true,
                  strict: true,
                },
              },
            },
          },
          {
            tools: {
              lint: {
                settings: {
                  fix: false,
                  strict: true,
                },
              },
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              strict: true,
            },
          },
        },
      },
    },
    {
      condition: 'the inherited path holds nothing',
      contributions: [
        from(
          'a',
          map({
            [SETTINGS_OF_EACH_TOOL]: inherits(TOOLS_SETTINGS),
            stages: plain([
              {
                tools: {
                  build: {
                    settings: {
                      minify: true,
                    },
                  },
                },
              },
            ]),
            tools: plain({
              lint: {
                settings: {
                  strict: true,
                },
              },
            }),
          }),
        ),
      ],
      file: {
        stages: [
          {
            tools: {
              build: {
                settings: {
                  minify: true,
                },
              },
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              strict: true,
            },
          },
        },
      },
    },
    {
      condition: 'the inheriting path meets a text before its end',
      contributions: [
        from(
          'a',
          map({
            [SETTINGS_OF_EACH_TOOL]: inherits(TOOLS_SETTINGS),
            stages: plain([
              {
                tools: {
                  lint: 'off',
                },
              },
            ]),
            tools: plain({
              lint: {
                settings: {
                  strict: true,
                },
              },
            }),
          }),
        ),
      ],
      file: {
        stages: [
          {
            tools: {
              lint: 'off',
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              strict: true,
            },
          },
        },
      },
    },
    {
      condition: 'a step of any child meets a map',
      contributions: [
        from(
          'a',
          map({
            env: plain({
              ci: 'true',
            }),
            'profiles.*.env': inherits('env'),
            profiles: plain({
              dev: {
                env: {
                  debug: '1',
                },
              },
              prod: {
                env: {
                  ci: 'false',
                },
              },
            }),
          }),
        ),
      ],
      file: {
        env: {
          ci: 'true',
        },
        profiles: {
          dev: {
            env: {
              ci: 'true',
              debug: '1',
            },
          },
          prod: {
            env: {
              ci: 'false',
            },
          },
        },
      },
    },
    {
      condition: 'a step that names a key meets a list',
      contributions: [
        from(
          'a',
          map({
            env: plain({
              ci: 'true',
            }),
            'stages.<stage>.env': inherits('env'),
            stages: plain([
              {
                env: {
                  debug: '1',
                },
              },
            ]),
          }),
        ),
      ],
      file: {
        env: {
          ci: 'true',
        },
        stages: [
          {
            env: {
              debug: '1',
            },
          },
        ],
      },
    },
    {
      condition: 'the declaration sits inside a map, where both its paths start',
      contributions: [
        from(
          'a',
          map({
            env: plain({
              root: '1',
            }),
            pipeline: map({
              ci: map({
                env: plain({
                  ci: 'true',
                }),
                'stages.*.env': inherits('env'),
                stages: plain([
                  {
                    env: {
                      debug: '1',
                    },
                  },
                ]),
              }),
            }),
          }),
        ),
      ],
      file: {
        env: {
          root: '1',
        },
        pipeline: {
          ci: {
            env: {
              ci: 'true',
            },
            stages: [
              {
                env: {
                  ci: 'true',
                  debug: '1',
                },
              },
            ],
          },
        },
      },
    },
    {
      condition: 'one entry declares and others give the values, two declarations among them',
      contributions: [
        from(
          'a',
          map({
            [SETTINGS_OF_EACH_TOOL]: inherits(TOOLS_SETTINGS),
            'stages.*.env': inherits('env'),
          }),
        ),
        from(
          'b',
          map({
            env: plain({
              ci: 'true',
            }),
            tools: plain({
              lint: {
                settings: {
                  strict: true,
                },
              },
            }),
          }),
        ),
        from(
          'c',
          map({
            stages: plain([
              {
                env: {
                  debug: '1',
                },
                tools: {
                  lint: {
                    settings: {
                      fix: true,
                    },
                  },
                },
              },
            ]),
          }),
        ),
      ],
      file: {
        env: {
          ci: 'true',
        },
        stages: [
          {
            env: {
              ci: 'true',
              debug: '1',
            },
            tools: {
              lint: {
                settings: {
                  fix: true,
                  strict: true,
                },
              },
            },
          },
        ],
        tools: {
          lint: {
            settings: {
              strict: true,
            },
          },
        },
      },
    },
  ])(
    'should lay the inherited value under the inheriting one when $condition',
    ({ contributions, file }) => {
      // Act
      const merged = MergedFile.merge(contributions);

      // Assert
      expect(merged).toStrictEqual({
        defaults: [],
        problems: [],
        value: file,
      });
    },
  );

  it.each<{
    condition: string;
    declaration: PresetValue;
    flaws: readonly PlacedFlaw[];
    settingPath: string;
  }>([
    {
      condition: 'a step of the inheriting path is empty',
      declaration: map({
        tools: map({
          'stages..env': inherits('env'),
        }),
      }),
      flaws: [
        flawAt(PathSide.Inheriting, 1, InheritanceFlaw.EmptyStep),
      ],
      settingPath: 'tools.stages..env',
    },
    {
      condition: 'the inheriting path binds one name twice',
      declaration: map({
        'stages.<stage>.<stage>': inherits('env.<stage>'),
      }),
      flaws: [
        flawAt(PathSide.Inheriting, 2, InheritanceFlaw.NameBoundTwice),
      ],
      settingPath: 'stages.<stage>.<stage>',
    },
    {
      condition: 'the inherited path steps into any child',
      declaration: map({
        'stages.*.env': inherits('*.env'),
      }),
      flaws: [
        flawAt(PathSide.Source, 0, InheritanceFlaw.AnyChildInSource),
      ],
      settingPath: 'stages.*.env',
    },
    {
      condition: 'the inherited path reads a name the inheriting path does not bind',
      declaration: map({
        'stages.*.env': inherits('env.<stage>'),
      }),
      flaws: [
        flawAt(PathSide.Source, 1, InheritanceFlaw.UnboundName),
      ],
      settingPath: 'stages.*.env',
    },
    {
      condition: 'a step of the inherited path is empty',
      declaration: map({
        'stages.*.env': inherits('env.'),
      }),
      flaws: [
        flawAt(PathSide.Source, 1, InheritanceFlaw.EmptyStep),
      ],
      settingPath: 'stages.*.env',
    },
    {
      condition: 'the inherited path is no text, and the inheriting one has a flaw of its own',
      declaration: map({
        'stages..env': inherits([
          'env',
        ]),
      }),
      flaws: [
        flawAt(PathSide.Inheriting, 1, InheritanceFlaw.EmptyStep),
        flawAt(PathSide.Source, 0, InheritanceFlaw.SourceNotText),
      ],
      settingPath: 'stages..env',
    },
    {
      condition: 'the declaration stands for the whole file',
      declaration: inherits('env'),
      flaws: [
        flawAt(PathSide.Inheriting, 0, InheritanceFlaw.EmptyStep),
      ],
      settingPath: '',
    },
    {
      condition: 'both paths have several flaws, and angle brackets inside a step name a key',
      declaration: map({
        'stages..<stage>.<stage>': inherits('*.<step>.v<other>.<other>v'),
      }),
      flaws: [
        flawAt(PathSide.Inheriting, 1, InheritanceFlaw.EmptyStep),
        flawAt(PathSide.Inheriting, 3, InheritanceFlaw.NameBoundTwice),
        flawAt(PathSide.Source, 0, InheritanceFlaw.AnyChildInSource),
        flawAt(PathSide.Source, 1, InheritanceFlaw.UnboundName),
      ],
      settingPath: 'stages..<stage>.<stage>',
    },
  ])(
    'should refuse the declaration and name each of its flaws when $condition',
    ({ declaration, flaws, settingPath }) => {
      // Act
      const merged = MergedFile.merge([
        from('a', declaration),
      ]);

      // Assert
      expect(merged.problems).toStrictEqual([
        {
          code: PresetsCode.InheritanceMalformed,
          details: {
            flaws,
            settingPath,
          },
        },
      ]);
    },
  );
});
