import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { Axis } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import type { PresetsFinding } from '../../../domain/shared/entities';
import { PresetsCode } from '../../../domain/shared/entities';
import {
  ALL_SETTINGS,
  AT_TOP,
  entryMisplacedMessage,
  entryMisshapenMessage,
  loosenedMessage,
  missingMessage,
  moreSettingsMessage,
  PRESET_FILE_UNREADABLE,
  sortedInUnsortableMessage,
  unneededBlocksMessage,
} from '../presets-finding-text.messages';
import { presetsFindingTextOf } from '../presets-finding-text.utils';

type PresetsFindingOf<TCode extends PresetsCode> = Extract<
  PresetsFinding,
  {
    readonly code: TCode;
  }
>;

const named = {
  block: BlockId.create('biome'),
  rule: 'file-within-500-lines',
};
const SETTING = 'linter.rules';
const sourceNames = [
  'presets/a.yaml: core → *',
  'presets/b.yaml: biome → *',
];

const findingOfEachCode: {
  readonly [TCode in PresetsCode]: PresetsFindingOf<TCode>;
} = {
  [PresetsCode.PresetFileMisplaced]: {
    code: PresetsCode.PresetFileMisplaced,
    details: {},
    path: 'presets/biome.yaml',
  },
  [PresetsCode.PresetFileUnparsed]: {
    code: PresetsCode.PresetFileUnparsed,
    details: {
      line: 3,
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.EntryMisshapen]: {
    code: PresetsCode.EntryMisshapen,
    details: {
      keys: [
        'biome',
        '*',
      ],
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.UnknownReader]: {
    code: PresetsCode.UnknownReader,
    details: {
      reader: BlockId.create('gone'),
    },
    path: 'presets/gone/foundation.yaml',
  },
  [PresetsCode.UnknownBlock]: {
    code: PresetsCode.UnknownBlock,
    details: {
      block: 'gone',
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.UnknownRule]: {
    code: PresetsCode.UnknownRule,
    details: named,
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.UnknownLanguage]: {
    code: PresetsCode.UnknownLanguage,
    details: {
      ...named,
      language: 'gone',
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.RuleOfAnotherBlock]: {
    code: PresetsCode.RuleOfAnotherBlock,
    details: {
      ...named,
      owner: BlockId.create('core'),
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.EntryMisplaced]: {
    code: PresetsCode.EntryMisplaced,
    details: {
      ...named,
      belongs: {
        axis: Axis.Foundation,
        reader: BlockId.create('biome'),
        withs: [
          BlockId.create('git'),
          BlockId.create('typescript'),
        ],
      },
      unneededBlocks: [
        BlockId.create('ui'),
      ],
      unreachedRoles: [
        {
          definers: [
            BlockId.create('git'),
          ],
          role: 'ignore-file',
        },
        {
          definers: [
            BlockId.create('typescript'),
          ],
          role: 'typescript-source',
        },
      ],
    },
    path: 'presets/biome/foundation/with/ui.yaml',
  },
  [PresetsCode.EntryNeedsTooManyBlocks]: {
    code: PresetsCode.EntryNeedsTooManyBlocks,
    details: {
      ...named,
      needed: [
        BlockId.create('css'),
        BlockId.create('browser'),
        BlockId.create('git'),
      ],
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.EntryOffItsAxis]: {
    code: PresetsCode.EntryOffItsAxis,
    details: {
      ...named,
      ruleAxis: Axis.Architecture,
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.FileOutsideItsUnit]: {
    code: PresetsCode.FileOutsideItsUnit,
    details: {
      ...named,
      file: '../biome.json',
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.UnknownFact]: {
    code: PresetsCode.UnknownFact,
    details: {
      ...named,
      fact: '${file.name}',
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.UnknownRole]: {
    code: PresetsCode.UnknownRole,
    details: {
      ...named,
      role: 'gone',
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.HandTypedRole]: {
    code: PresetsCode.HandTypedRole,
    details: {
      ...named,
      role: 'source',
      term: 'src/',
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.MembersOutsideList]: {
    code: PresetsCode.MembersOutsideList,
    details: named,
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.SortedInUnsortableFile]: {
    code: PresetsCode.SortedInUnsortableFile,
    details: {
      ...named,
      file: 'pyproject.toml',
      settingPath: 'tool.poe.tasks',
    },
    path: 'presets/poe/foundation.yaml',
  },
  [PresetsCode.MissingDistributionFile]: {
    code: PresetsCode.MissingDistributionFile,
    details: {
      file: 'presets/biome/plugins/typescript/gone.grit',
    },
    path: 'presets/biome/foundation.yaml',
  },
  [PresetsCode.PluginUnreferenced]: {
    code: PresetsCode.PluginUnreferenced,
    details: {},
    path: 'presets/biome/plugins/typescript/gone.grit',
  },
  [PresetsCode.PluginNamesNoRule]: {
    code: PresetsCode.PluginNamesNoRule,
    details: {
      rule: 'gone',
    },
    path: 'presets/biome/plugins/typescript/gone.grit',
  },
  [PresetsCode.Clash]: {
    code: PresetsCode.Clash,
    details: {
      settingPath: SETTING,
      sources: sourceNames,
    },
    path: 'biome.json',
  },
  [PresetsCode.TwoReplacers]: {
    code: PresetsCode.TwoReplacers,
    details: {
      settingPath: SETTING,
      sources: sourceNames,
    },
    path: 'biome.json',
  },
  [PresetsCode.MissingSlot]: {
    code: PresetsCode.MissingSlot,
    details: {
      settingPath: 'jobs',
      slot: 'checks',
    },
    path: 'lefthook.yaml',
  },
  [PresetsCode.SlotInNoList]: {
    code: PresetsCode.SlotInNoList,
    details: {
      settingPath: 'jobs',
      slot: 'checks',
    },
    path: 'lefthook.yaml',
  },
  [PresetsCode.SlotPlacedTwice]: {
    code: PresetsCode.SlotPlacedTwice,
    details: {
      settingPath: 'overrides',
      slot: 'injected-classes',
    },
    path: 'biome.jsonc',
  },
  [PresetsCode.MissingName]: {
    code: PresetsCode.MissingName,
    details: {},
    path: 'packages/kit/constitution.yaml',
  },
  [PresetsCode.MissingConstitution]: {
    code: PresetsCode.MissingConstitution,
    details: {},
    path: 'biome.json',
  },
  [PresetsCode.Loosened]: {
    code: PresetsCode.Loosened,
    details: {
      settingPath: 'formatter.width',
      wanted: '100',
    },
    path: 'biome.json',
  },
  [PresetsCode.Missing]: {
    code: PresetsCode.Missing,
    details: {
      settingPaths: [
        'a',
        'b',
        'c',
      ],
    },
    path: 'biome.json',
  },
  [PresetsCode.Stale]: {
    code: PresetsCode.Stale,
    details: {
      settingPaths: [
        'a',
        'b',
        'c',
        'd',
        'e',
      ],
    },
    path: 'biome.json',
  },
  [PresetsCode.Unsorted]: {
    code: PresetsCode.Unsorted,
    details: {
      settingPaths: [
        'scripts',
      ],
    },
    path: 'package.json',
  },
  [PresetsCode.FileUnparsed]: {
    code: PresetsCode.FileUnparsed,
    details: {},
    path: 'biome.json',
  },
  [PresetsCode.LockUnparsed]: {
    code: PresetsCode.LockUnparsed,
    details: {},
    path: 'constitution.lock',
  },
  [PresetsCode.RunMisshapen]: {
    code: PresetsCode.RunMisshapen,
    details: {},
    path: 'constitution.yaml',
  },
  [PresetsCode.ToolWithoutRunner]: {
    code: PresetsCode.ToolWithoutRunner,
    details: {
      block: BlockId.create('biome'),
    },
    path: 'constitution.yaml',
  },
};

const uiPath = {
  axis: Axis.Foundation,
  reader: BlockId.create('biome'),
  withs: [
    BlockId.create('ui'),
  ],
};

describe('presetsFindingTextOf', () => {
  it('should word a finding of each code as the golden file shows it', async () => {
    // Act
    const golden = goldenOf(
      Object.fromEntries(
        Object.values(findingOfEachCode).map((finding) => [
          finding.code,
          presetsFindingTextOf(finding),
        ]),
      ),
    );

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('presets-finding-text.golden.txt', import.meta.url), golden),
    );
  });

  it.each<{
    condition: string;
    finding: PresetsFinding;
    text: string;
  }>([
    {
      condition:
        'its path leaves no role it names out of reach and names no block it does not need',
      finding: {
        code: PresetsCode.EntryMisplaced,
        details: {
          ...named,
          belongs: uiPath,
          unneededBlocks: [],
          unreachedRoles: [],
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: entryMisplacedMessage({
        ...named,
        belongs: uiPath,
        unneededBlocks: [],
        unreachedRoles: [],
      }),
    },
    {
      condition: 'its path names a block it does not need and leaves no role it names out of reach',
      finding: {
        code: PresetsCode.EntryMisplaced,
        details: {
          ...named,
          belongs: uiPath,
          unneededBlocks: [
            BlockId.create('git'),
          ],
          unreachedRoles: [],
        },
        path: 'presets/biome/foundation/with/ui/with/git.yaml',
      },
      text: `${entryMisplacedMessage({
        ...named,
        belongs: uiPath,
        unneededBlocks: [],
        unreachedRoles: [],
      })}${unneededBlocksMessage([
        'git',
      ])}`,
    },
    {
      condition: 'the parser names no line',
      finding: {
        code: PresetsCode.PresetFileUnparsed,
        details: {},
        path: 'presets/biome/foundation.yaml',
      },
      text: PRESET_FILE_UNREADABLE,
    },
    {
      condition: 'the top of the file holds no map',
      finding: {
        code: PresetsCode.EntryMisshapen,
        details: {
          keys: [],
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: entryMisshapenMessage(AT_TOP),
    },
    {
      condition: 'the whole file is held otherwise',
      finding: {
        code: PresetsCode.Loosened,
        details: {
          settingPath: '',
          wanted: '{"width":100}',
        },
        path: 'biome.json',
      },
      text: loosenedMessage({
        held: ALL_SETTINGS,
        wanted: '{"width":100}',
      }),
    },
    {
      condition: 'the whole file is marked sorted',
      finding: {
        code: PresetsCode.SortedInUnsortableFile,
        details: {
          ...named,
          file: 'pyproject.toml',
          settingPath: '',
        },
        path: 'presets/poe/foundation.yaml',
      },
      text: sortedInUnsortableMessage({
        file: 'pyproject.toml',
        named,
        sorted: ALL_SETTINGS,
      }),
    },
    {
      condition: 'three settings are named',
      finding: {
        code: PresetsCode.Missing,
        details: {
          settingPaths: [
            'a',
            'b',
            'c',
          ],
        },
        path: 'biome.json',
      },
      text: missingMessage('a, b, c'),
    },
    {
      condition: 'more than three settings are named',
      finding: {
        code: PresetsCode.Missing,
        details: {
          settingPaths: [
            'a',
            'b',
            'c',
            'd',
          ],
        },
        path: 'biome.json',
      },
      text: missingMessage(
        moreSettingsMessage({
          more: 1,
          shown: 'a, b, c',
        }),
      ),
    },
  ])('should choose the message its details call for when $condition', ({ finding, text }) => {
    // Act
    const said = presetsFindingTextOf(finding);

    // Assert
    expect(said).toBe(text);
  });
});
