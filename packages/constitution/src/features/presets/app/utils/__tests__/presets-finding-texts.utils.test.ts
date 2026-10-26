import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';

import type { PresetsFinding } from '../../../domain/entities';
import { PresetsCode } from '../../../domain/entities';
import { presetsFindingTextOf } from '../presets-finding-texts.utils';

const named = {
  block: 'biome',
  rule: 'file-within-500-lines',
};
const SETTING = 'linter.rules';
const sourceNames = [
  'presets/a.yaml: core → *',
  'presets/b.yaml: biome → *',
];

describe('presetsFindingTextOf', () => {
  it.each<{
    finding: PresetsFinding;
    text: string;
  }>([
    {
      finding: {
        code: PresetsCode.CatalogueMisplaced,
        details: {},
        path: 'presets/biome.yaml',
      },
      text: 'is not a catalogue: presets/<reader>/<axis>.yaml, presets/<reader>/<axis>/with/<block>.yaml or presets/<reader>/<axis>/with/<block>/with/<partner>.yaml',
    },
    {
      finding: {
        code: PresetsCode.CatalogueUnparsed,
        details: {
          line: 3,
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'does not parse at line 3',
    },
    {
      finding: {
        code: PresetsCode.CatalogueUnparsed,
        details: {},
        path: 'presets/biome/foundation.yaml',
      },
      text: 'cannot be read',
    },
    {
      finding: {
        code: PresetsCode.EntryMisshapen,
        details: {
          keys: [],
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'holds no map of the next key at its top; an entry is keyed block → rule or * → language or * → file',
    },
    {
      finding: {
        code: PresetsCode.EntryMisshapen,
        details: {
          keys: [
            'biome',
            '*',
          ],
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'holds no map of the next key under biome → *; an entry is keyed block → rule or * → language or * → file',
    },
    {
      finding: {
        code: PresetsCode.UnknownReader,
        details: {
          reader: 'gone',
        },
        path: 'presets/gone/foundation.yaml',
      },
      text: 'is the catalogue of gone, which is no block',
    },
    {
      finding: {
        code: PresetsCode.UnknownBlock,
        details: {
          block: 'gone',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'names gone, which is no block',
    },
    {
      finding: {
        code: PresetsCode.UnknownRule,
        details: named,
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: file-within-500-lines is no rule',
    },
    {
      finding: {
        code: PresetsCode.UnknownLanguage,
        details: {
          ...named,
          language: 'gone',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: gone is no language',
    },
    {
      finding: {
        code: PresetsCode.RuleOfAnotherBlock,
        details: {
          ...named,
          owner: 'core',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: file-within-500-lines is a rule of core',
    },
    {
      finding: {
        code: PresetsCode.EntryMisplaced,
        details: {
          ...named,
          belongs: 'biome/foundation/with/ui.yaml',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: belongs in presets/biome/foundation/with/ui.yaml',
    },
    {
      finding: {
        code: PresetsCode.EntryOffItsAxis,
        details: {
          ...named,
          ruleAxis: Axis.Architecture,
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: "biome → file-within-500-lines: file-within-500-lines is a rule of architecture, an axis this catalogue's does not stand on",
    },
    {
      finding: {
        code: PresetsCode.FileOutsideItsUnit,
        details: {
          ...named,
          file: '../biome.json',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: ../biome.json leaves the folder of its unit',
    },
    {
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          ...named,
          fact: '${file.name}',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: ${file.name} is no fact the program computes where it stands',
    },
    {
      finding: {
        code: PresetsCode.UnknownRole,
        details: {
          ...named,
          role: 'gone',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: no term carries the id gone',
    },
    {
      finding: {
        code: PresetsCode.HandTypedRole,
        details: {
          ...named,
          role: 'source',
          term: 'src/',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: types src/ by hand; write ${role.source}',
    },
    {
      finding: {
        code: PresetsCode.RoleOffItsAxis,
        details: {
          ...named,
          role: 'gateway',
          termAxis: Axis.Architecture,
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: ${role.gateway} is a term of architecture, the axis of another catalogue',
    },
    {
      finding: {
        code: PresetsCode.MembersOutsideList,
        details: named,
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: ${workspace.members} stands only in an item of a list',
    },
    {
      finding: {
        code: PresetsCode.MissingReleaseFile,
        details: {
          ...named,
          file: 'presets/biome/plugins/typescript/gone.grit',
        },
        path: 'presets/biome/foundation.yaml',
      },
      text: 'biome → file-within-500-lines: presets/biome/plugins/typescript/gone.grit is no file of the release',
    },
    {
      finding: {
        code: PresetsCode.PluginUnreferenced,
        details: {},
        path: 'presets/biome/plugins/typescript/gone.grit',
      },
      text: 'is a plugin no entry names',
    },
    {
      finding: {
        code: PresetsCode.PluginNamesNoRule,
        details: {
          rule: 'gone',
        },
        path: 'presets/biome/plugins/typescript/gone.grit',
      },
      text: 'is named "gone", which is no rule; a plugin is named after the rule it holds',
    },
    {
      finding: {
        code: PresetsCode.Clash,
        details: {
          setting: SETTING,
          sources: sourceNames,
        },
        path: 'biome.json',
      },
      text: 'gets two values at linter.rules from presets/a.yaml: core → * and presets/b.yaml: biome → *',
    },
    {
      finding: {
        code: PresetsCode.TwoReplacers,
        details: {
          setting: SETTING,
          sources: sourceNames,
        },
        path: 'biome.json',
      },
      text: 'has linter.rules replaced twice, otherwise each time, by presets/a.yaml: core → * and presets/b.yaml: biome → *',
    },
    {
      finding: {
        code: PresetsCode.MissingSlot,
        details: {
          setting: 'jobs',
          slot: 'checks',
        },
        path: 'lefthook.yaml',
      },
      text: 'gets an insert into the slot checks of jobs, which the list does not place',
    },
    {
      finding: {
        code: PresetsCode.SlotInNoList,
        details: {
          setting: 'jobs',
          slot: 'checks',
        },
        path: 'lefthook.yaml',
      },
      text: 'gets an insert into the slot checks of jobs, which is no list',
    },
    {
      finding: {
        code: PresetsCode.MissingName,
        details: {},
        path: 'packages/kit/constitution.yaml',
      },
      text: 'gives no name, which an entry it takes writes as ${package.name}; add name',
    },
    {
      finding: {
        code: PresetsCode.MissingConstitution,
        details: {},
        path: 'biome.json',
      },
      text: 'needs the path to the Constitution, and no .droneey/constitution lies at or above it',
    },
    {
      finding: {
        code: PresetsCode.Loosened,
        details: {
          setting: 'formatter.width',
          wanted: '100',
        },
        path: 'biome.json',
      },
      text: 'holds formatter.width otherwise than the catalogues, which give 100',
    },
    {
      finding: {
        code: PresetsCode.Loosened,
        details: {
          setting: '',
          wanted: '{"width":100}',
        },
        path: 'biome.json',
      },
      text: 'holds its settings otherwise than the catalogues, which give {"width":100}',
    },
    {
      finding: {
        code: PresetsCode.FileUnparsed,
        details: {},
        path: 'biome.json',
      },
      text: 'cannot be read or does not parse, so nothing was applied to it',
    },
    {
      finding: {
        code: PresetsCode.LockUnparsed,
        details: {},
        path: 'constitution.lock',
      },
      text: 'does not parse, so the apply wrote it again from the files',
    },
  ])('should say $finding.code as the report words it', ({ finding, text }) => {
    // Act
    const said = presetsFindingTextOf(finding);

    // Assert
    expect(said).toBe(text);
  });
});
