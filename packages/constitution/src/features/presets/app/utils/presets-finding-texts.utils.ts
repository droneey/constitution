import { PRESETS_FOLDER, RELEASE_FOLDER } from '#/kernel/constants';
import type { TextsOf } from '#/shared/cli';
import { textOf } from '#/shared/cli';

import type { EntryNamed, PresetsDetails, PresetsFinding } from '../../domain/entities';
import { PresetsCode } from '../../domain/entities';
import { Fact, FactName } from '../../domain/value-objects';

const presetFilePlaces = `${PRESETS_FOLDER}/<reader>/<axis>.yaml, ${PRESETS_FOLDER}/<reader>/<axis>/with/<block>.yaml or ${PRESETS_FOLDER}/<reader>/<axis>/with/<block>/with/<partner>.yaml`;
const ENTRY_KEYS = 'block → rule or * → language or * → file';
const APPLY = ' — run constitution presets apply';

const packageNameFact = Fact.textOf(Fact.of(FactName.PackageName));

const entryOf = ({ block, rule }: EntryNamed): string => `${block} → ${rule}`;

const sourcesOf = (sources: readonly string[]): string => sources.join(' and ');

const SHOWN = 3;

const settingsOf = (settings: readonly string[]): string =>
  settings.length > SHOWN
    ? `${settings.slice(0, SHOWN).join(', ')} and ${String(settings.length - SHOWN)} more`
    : settings.join(', ');

/** Each text follows the path its finding names. */
const presetsFindingTexts: TextsOf<PresetsDetails> = {
  [PresetsCode.PresetFileMisplaced]: () => `is not a preset file: ${presetFilePlaces}`,
  [PresetsCode.PresetFileUnparsed]: ({ line }) =>
    line === undefined ? 'cannot be read' : `does not parse at line ${String(line)}`,
  [PresetsCode.EntryMisshapen]: ({ keys }) =>
    `holds no map of the next key ${keys.length === 0 ? 'at its top' : `under ${keys.join(' → ')}`}; an entry is keyed ${ENTRY_KEYS}`,
  [PresetsCode.UnknownReader]: ({ reader }) => `is the preset file of ${reader}, which is no block`,
  [PresetsCode.UnknownBlock]: ({ block }) => `names ${block}, which is no block`,
  [PresetsCode.UnknownRule]: (named) => `${entryOf(named)}: ${named.rule} is no rule`,
  [PresetsCode.UnknownLanguage]: (named) => `${entryOf(named)}: ${named.language} is no language`,
  [PresetsCode.RuleOfAnotherBlock]: (named) =>
    `${entryOf(named)}: ${named.rule} is a rule of ${named.owner}`,
  [PresetsCode.EntryMisplaced]: (named) =>
    `${entryOf(named)}: belongs in ${PRESETS_FOLDER}/${named.belongs}`,
  [PresetsCode.EntryOffItsAxis]: (named) =>
    `${entryOf(named)}: ${named.rule} is a rule of ${named.ruleAxis}, an axis this preset file's does not stand on`,
  [PresetsCode.FileOutsideItsUnit]: (named) =>
    `${entryOf(named)}: ${named.file} leaves the folder of its unit`,
  [PresetsCode.UnknownFact]: (named) =>
    `${entryOf(named)}: ${named.fact} is no fact the program computes where it stands`,
  [PresetsCode.UnknownRole]: (named) => `${entryOf(named)}: no term carries the id ${named.role}`,
  [PresetsCode.HandTypedRole]: (named) =>
    `${entryOf(named)}: types ${named.term} by hand; write \${role.${named.role}}`,
  [PresetsCode.MembersOutsideList]: (named) =>
    `${entryOf(named)}: \${workspace.members} stands only in an item of a list`,
  [PresetsCode.MissingReleaseFile]: ({ file }) => `names ${file}, which is no file of the release`,
  [PresetsCode.PluginUnreferenced]: () => 'is a plugin no entry names',
  [PresetsCode.PluginNamesNoRule]: ({ rule }) =>
    `is named "${rule}", which is no rule; a plugin is named after the rule it holds`,
  [PresetsCode.Clash]: ({ setting, sources }) =>
    `gets two values at ${setting} from ${sourcesOf(sources)}`,
  [PresetsCode.TwoReplacers]: ({ setting, sources }) =>
    `has ${setting} replaced twice, otherwise each time, by ${sourcesOf(sources)}`,
  [PresetsCode.MissingSlot]: ({ setting, slot }) =>
    `gets an insert into the slot ${slot} of ${setting}, which the list does not place`,
  [PresetsCode.SlotInNoList]: ({ setting, slot }) =>
    `gets an insert into the slot ${slot} of ${setting}, which is no list`,
  [PresetsCode.MissingName]: () =>
    `gives no name, which an entry it takes writes as ${packageNameFact}; add name`,
  [PresetsCode.MissingConstitution]: () =>
    `needs the path to the Constitution, and no ${RELEASE_FOLDER} lies at or above it`,
  [PresetsCode.Loosened]: ({ setting, wanted }) =>
    `holds ${setting === '' ? 'its settings' : setting} otherwise than the presets, which give ${wanted}`,
  [PresetsCode.Missing]: ({ settings }) =>
    `lacks ${settingsOf(settings)}, as the presets give them${APPLY}`,
  [PresetsCode.Stale]: ({ settings }) =>
    `still holds ${settingsOf(settings)}, which no entry gives any longer${APPLY}`,
  [PresetsCode.Unsorted]: ({ settings }) =>
    `orders the keys of ${settingsOf(settings)} otherwise than as texts, which the presets keep${APPLY}`,
  [PresetsCode.FileUnparsed]: () =>
    'cannot be read or does not parse, so nothing was applied to it',
  [PresetsCode.LockUnparsed]: () => 'does not parse, so the apply wrote it again from the files',
  [PresetsCode.RunMisshapen]: () =>
    'gets what the program runs as other than lists of commands by their names',
  [PresetsCode.ToolWithoutRunner]: ({ block }) =>
    `follows ${block}, whose commands no runner it follows gives; add the block that runs them`,
};

const presetsFindingTextOf = (finding: PresetsFinding): string =>
  textOf(presetsFindingTexts, finding.code, finding.details);

export { presetsFindingTextOf };
