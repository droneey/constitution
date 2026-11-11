import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '#/kernel/constants';
import type { Lowering } from '#/kernel/entities';
import { BlockModel } from '#/kernel/entities';
import {
  BlockId,
  BlockSource,
  coreBlockId,
  RepositoryRelativePath,
  RuleSlug,
  UnitPath,
} from '#/kernel/value-objects';

import type { PresetEntry } from '../../../../preset-entry/entities';
import type { PresetPair } from '../../../../setting/entities';
import { Joining, PresetValue, ValueKind } from '../../../../setting/entities';
import { EVERY } from '../../../../shared/constants';
import { TargetKind } from '../../../../shared/value-objects';
import type { DiagnosticIndex } from '../../../entities';
import { indexDiagnostics } from '../index-diagnostics.service';

const rootUnit = UnitPath.create('');
const kitUnit = UnitPath.create('packages/kit');
const NAMES = 'name-never-an-empty-word';
const LITERALS = 'literal-with-a-meaning-is-named';
const LOGGER = 'diagnostics-written-through-a-logger';

const model = BlockModel.create({
  blocks: [],
  roles: [],
  rules: [
    NAMES,
    LITERALS,
    LOGGER,
  ].map((slug) => ({
    axis: Axis.Foundation,
    block: coreBlockId,
    level: Level.Must,
    slug: RuleSlug.create(slug),
    statement: `The ${slug} statement.`,
    why: `the ${slug} reason.`,
  })),
});

const pair = (key: string, given: PresetValue): PresetPair => ({
  key,
  value: given,
});

const entryOf = (input: { rule: string; value: PresetValue }): PresetEntry => ({
  block: coreBlockId,
  index: 0,
  isWhole: false,
  kind: TargetKind.File,
  language: EVERY,
  rule: input.rule === EVERY ? EVERY : RuleSlug.create(input.rule),
  set: {
    filePath: RepositoryRelativePath.create('presets/biome/@foundation.yaml'),
    placeInPresets: {
      axis: Axis.Foundation,
      reader: BlockId.create('biome'),
      withs: [],
    },
    source: BlockSource.create(undefined),
  },
  value: input.value,
  writtenPath: 'biome.jsonc',
});

const biomeRule = (rule: string, name: string): PresetEntry =>
  entryOf({
    rule,
    value: PresetValue.mapOf([
      pair(
        'linter.rules',
        PresetValue.mapOf([
          pair(
            'style',
            PresetValue.mapOf([
              pair(name, PresetValue.plain('error')),
            ]),
          ),
        ]),
      ),
    ]),
  });

const listed = (rule: string, key: string, items: readonly string[]): PresetEntry =>
  entryOf({
    rule,
    value: PresetValue.mapOf([
      pair(key, PresetValue.plain(items)),
    ]),
  });

const levelsOf = (index: DiagnosticIndex | undefined): readonly string[] =>
  [
    ...(index ?? []),
  ].flatMap(([id, rules]) => rules.map(({ level, slug }) => `${id} → ${slug} · ${level}`));

describe('indexDiagnostics', () => {
  it("should key each rule name, code and plugin a unit's entries name or copy by the rule its entry holds, with its statement and Why", () => {
    // Act
    const indexes = indexDiagnostics({
      files: [
        {
          entries: [
            biomeRule(LITERALS, 'noMagicNumbers'),
            listed(LITERALS, 'extend-select', [
              'PLR2004',
              'S',
            ]),
            listed(NAMES, 'plugins', [
              './${constitution.path}/presets/biome/plugins/typescript/biome-refuses-empty-names.${role.grit-rule}',
            ]),
            entryOf({
              rule: NAMES,
              value: {
                joining: Joining.None,
                kind: ValueKind.Copy,
                setting:
                  '${constitution.path}/presets/biome/plugins/typescript/biome-refuses-empty-verbs.${role.grit-rule}',
              },
            }),
          ],
          unitPath: rootUnit,
        },
      ],
      lowerings: new Map(),
      model,
    });

    // Assert
    expect(indexes.get(rootUnit)?.get('noMagicNumbers')).toStrictEqual([
      {
        level: Level.Must,
        slug: RuleSlug.create(LITERALS),
        statement: `The ${LITERALS} statement.`,
        why: `the ${LITERALS} reason.`,
      },
    ]);
    expect(levelsOf(indexes.get(rootUnit))).toStrictEqual([
      `noMagicNumbers → ${LITERALS} · MUST`,
      `PLR2004 → ${LITERALS} · MUST`,
      `S → ${LITERALS} · MUST`,
      `[biome-refuses-empty-names] → ${NAMES} · MUST`,
      `[biome-refuses-empty-verbs] → ${NAMES} · MUST`,
    ]);
  });

  it('should key nothing an entry for every rule, a rule the model lacks, a value or a word of no rule id holds', () => {
    // Act
    const indexes = indexDiagnostics({
      files: [
        {
          entries: [
            biomeRule(EVERY, 'noDebugger'),
            biomeRule('rule-of-no-block', 'noConsole'),
            entryOf({
              rule: LOGGER,
              value: PresetValue.mapOf([
                pair('message', PresetValue.plain('use performanceNow, not T201')),
                pair(
                  'lineWidth.level',
                  PresetValue.plain([
                    '**/*.ts',
                    'extend-select',
                    'StrictMODE',
                  ]),
                ),
              ]),
            }),
          ],
          unitPath: rootUnit,
        },
      ],
      lowerings: new Map(),
      model,
    });

    // Assert
    expect(levelsOf(indexes.get(rootUnit))).toStrictEqual([
      `lineWidth → ${LOGGER} · MUST`,
    ]);
  });

  it('should give each unit its own index, with a rule at the level its own override lowers it to', () => {
    // Arrange
    const lowerings = new Map<RuleSlug, readonly Lowering[]>([
      [
        RuleSlug.create(LITERALS),
        [
          {
            level: Level.Should,
            reason: 'the kit keeps its numbers',
            unit: kitUnit,
          },
        ],
      ],
    ]);

    // Act
    const indexes = indexDiagnostics({
      files: [
        {
          entries: [
            biomeRule(LITERALS, 'noMagicNumbers'),
          ],
          unitPath: rootUnit,
        },
        {
          entries: [
            biomeRule(LITERALS, 'noMagicNumbers'),
          ],
          unitPath: kitUnit,
        },
        {
          entries: [
            biomeRule(LOGGER, 'noConsole'),
          ],
          unitPath: kitUnit,
        },
      ],
      lowerings,
      model,
    });

    // Assert
    expect({
      kit: levelsOf(indexes.get(kitUnit)),
      root: levelsOf(indexes.get(rootUnit)),
    }).toStrictEqual({
      kit: [
        `noMagicNumbers → ${LITERALS} · SHOULD`,
        `noConsole → ${LOGGER} · MUST`,
      ],
      root: [
        `noMagicNumbers → ${LITERALS} · MUST`,
      ],
    });
  });
});
