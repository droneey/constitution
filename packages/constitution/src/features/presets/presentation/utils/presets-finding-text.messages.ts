import {
  PATH_SEPARATOR,
  PRESETS_FOLDER_NAME,
  RELEASE_FOLDER_PATH,
  SEAM_FOLDER_NAME,
} from '#/kernel/constants';
import type { TextsOf } from '#/shared/cli';
import { LIST_SEPARATOR } from '#/shared/cli';

import { EntryPoint } from '../../domain/run-plan/entities';
import { MAX_WITHS } from '../../domain/shared/constants';
import type { EntryNamed, PresetsDetails, UnreachedRole } from '../../domain/shared/entities';
import { PresetsCode } from '../../domain/shared/entities';
import { Fact, FactName, PresetFilePath } from '../../domain/shared/value-objects';

// Why: a messages file holds no branch, so the table of texts chooses among the messages below for
// the codes whose text varies with their details.
type VariedCode =
  | PresetsCode.EntryMisplaced
  | PresetsCode.EntryMisshapen
  | PresetsCode.Loosened
  | PresetsCode.Missing
  | PresetsCode.PresetFileUnparsed
  | PresetsCode.SortedInUnsortableFile
  | PresetsCode.Stale
  | PresetsCode.Unsorted;

interface LoosenedInput {
  readonly held: string;
  readonly wanted: string;
}

interface SortedInUnsortableInput {
  readonly file: string;
  readonly named: EntryNamed;
  readonly sorted: string;
}

interface MoreSettingsInput {
  readonly more: number;
  readonly shown: string;
}

const presetFilePlaceOf = (...segments: readonly string[]): string =>
  [
    PRESETS_FOLDER_NAME,
    '<reader>',
    ...segments,
  ].join(PATH_SEPARATOR);

const presetFilePlaces = `${presetFilePlaceOf('<axis>.yaml')}, ${presetFilePlaceOf('<axis>', SEAM_FOLDER_NAME, '<block>.yaml')} or ${presetFilePlaceOf('<axis>', SEAM_FOLDER_NAME, '<first>', SEAM_FOLDER_NAME, '<second>.yaml')}`;
const ENTRY_KEYS = 'block → rule or * → language or * → file';
const KEY_SEPARATOR = ' → ';
const APPLY = ' — run constitution presets apply';
const LOOSENED_WAYS_OUT = ' — put it back, or lower the rule with an override in constitution.yaml';
const PRESET_FILE_UNREADABLE = 'cannot be read';
const AT_TOP = 'at its top';
const ALL_SETTINGS = 'its settings';

const FINDING_NOUN = 'finding';
const FOUND_IN_PRESETS_AFTER = 'in the presets';

const packageNameFact = Fact.textOf(Fact.of(FactName.PackageName));

const entryOf = ({ block, rule }: EntryNamed): string => `${block}${KEY_SEPARATOR}${rule}`;

const namesOf = (names: readonly string[]): string => names.join(' and ');

const presetsFindingMessages: Omit<TextsOf<PresetsDetails>, VariedCode> = {
  [PresetsCode.PresetFileMisplaced]: () => `is not a preset file: ${presetFilePlaces}`,
  [PresetsCode.UnknownReader]: ({ reader }) => `is the preset file of ${reader}, which is no block`,
  [PresetsCode.UnknownBlock]: ({ block }) => `names ${block}, which is no block`,
  [PresetsCode.UnknownRule]: (named) => `${entryOf(named)}: ${named.rule} is no rule`,
  [PresetsCode.UnknownLanguage]: (named) => `${entryOf(named)}: ${named.language} is no language`,
  [PresetsCode.RuleOfAnotherBlock]: (named) =>
    `${entryOf(named)}: ${named.rule} is a rule of ${named.owner}`,
  [PresetsCode.EntryNeedsTooManyBlocks]: (named) =>
    `${entryOf(named)}: needs ${named.needed.join(LIST_SEPARATOR)} beyond its reader, and a preset file's path names at most ${String(MAX_WITHS)}; leave out a role that needs a block of its own`,
  [PresetsCode.EntryOffItsAxis]: (named) =>
    `${entryOf(named)}: ${named.rule} is a rule of ${named.ruleAxis}, not of this preset file's axis`,
  [PresetsCode.FileOutsideItsUnit]: (named) =>
    `${entryOf(named)}: ${named.file} leaves the folder of its unit`,
  [PresetsCode.UnknownFact]: (named) =>
    `${entryOf(named)}: ${named.fact} is no fact constitution computes where it stands`,
  [PresetsCode.UnknownRole]: (named) => `${entryOf(named)}: no term carries the id ${named.role}`,
  [PresetsCode.HandTypedRole]: (named) =>
    `${entryOf(named)}: types ${named.term} by hand; write \${role.${named.role}}`,
  [PresetsCode.MembersOutsideList]: (named) =>
    `${entryOf(named)}: \${workspace.members} stands only in an item of a list`,
  [PresetsCode.MissingDistributionFile]: ({ file }) =>
    `names ${file}, which is no file of the release`,
  [PresetsCode.PluginUnreferenced]: () => 'is a plugin no entry names',
  [PresetsCode.PluginNamesNoRule]: ({ rule }) =>
    `is named "${rule}", which is no rule; a plugin is named after the rule it holds`,
  [PresetsCode.Clash]: ({ settingPath, sources }) =>
    `gets two values at ${settingPath} from ${namesOf(sources)}`,
  [PresetsCode.TwoReplacers]: ({ settingPath, sources }) =>
    `has ${settingPath} replaced twice, otherwise each time, by ${namesOf(sources)}`,
  [PresetsCode.MissingSlot]: ({ settingPath, slot }) =>
    `gets an insert into the slot ${slot} of ${settingPath}, which the list does not place`,
  [PresetsCode.SlotInNoList]: ({ settingPath, slot }) =>
    `gets an insert into the slot ${slot} of ${settingPath}, which is no list`,
  [PresetsCode.SlotPlacedTwice]: ({ settingPath, slot }) =>
    `gets an insert into the item of ${settingPath} that places the slot ${slot}, which two items place`,
  [PresetsCode.MissingName]: () =>
    `gives no name, which an entry it takes writes as ${packageNameFact}; add name`,
  [PresetsCode.MissingConstitution]: () =>
    `needs the path to the Constitution, and no ${RELEASE_FOLDER_PATH} lies at or above it`,
  [PresetsCode.FileUnparsed]: () =>
    'cannot be read or does not parse, so nothing was applied to it',
  [PresetsCode.LockUnparsed]: () => 'does not parse, so the apply wrote it again from the files',
  [PresetsCode.RunMisshapen]: () =>
    `gets what constitution runs as other than lists of commands named ${Object.values(EntryPoint).join(LIST_SEPARATOR)}`,
  [PresetsCode.ToolWithoutRunner]: ({ block }) =>
    `follows ${block}, whose commands no runner it follows gives; add the block that runs them`,
};

const presetFileUnparsedMessage = (line: number): string =>
  `does not parse at line ${String(line)}`;

const entryMisplacedMessage = (details: PresetsDetails[PresetsCode.EntryMisplaced]): string =>
  `${entryOf(details)}: belongs in ${PRESETS_FOLDER_NAME}${PATH_SEPARATOR}${PresetFilePath.textOf(details.belongs)}`;

const unreachedRolesMessage = (roles: readonly UnreachedRole[]): string =>
  `, to reach ${roles.map(({ definers, role }) => `\${role.${role}}, defined by ${namesOf(definers)}`).join('; ')}`;

const unneededBlocksMessage = (blocks: readonly string[]): string =>
  `; its path names ${namesOf(blocks)}, which it does not need`;

const entryMisshapenMessage = (place: string): string =>
  `holds no map of the next key ${place}; an entry is keyed ${ENTRY_KEYS}`;

const underKeysMessage = (keys: readonly string[]): string => `under ${keys.join(KEY_SEPARATOR)}`;

const loosenedMessage = ({ held, wanted }: LoosenedInput): string =>
  `holds ${held} otherwise than the presets, which give ${wanted}${LOOSENED_WAYS_OUT}`;

const missingMessage = (settings: string): string =>
  `lacks ${settings}, as the presets give them${APPLY}`;

const staleMessage = (settings: string): string =>
  `still holds ${settings}, which no entry gives any longer${APPLY}`;

const unsortedMessage = (settings: string): string =>
  `orders the keys of ${settings} otherwise than as texts, which the presets keep${APPLY}`;

const sortedInUnsortableMessage = ({ file, named, sorted }: SortedInUnsortableInput): string =>
  `${entryOf(named)}: marks ${sorted} !sorted in ${file}, whose format keeps no order of its keys; !sorted holds in JSON and YAML`;

const moreSettingsMessage = ({ more, shown }: MoreSettingsInput): string =>
  `${shown} and ${String(more)} more`;

export {
  ALL_SETTINGS,
  AT_TOP,
  entryMisplacedMessage,
  entryMisshapenMessage,
  FINDING_NOUN,
  FOUND_IN_PRESETS_AFTER,
  loosenedMessage,
  missingMessage,
  moreSettingsMessage,
  PRESET_FILE_UNREADABLE,
  presetFileUnparsedMessage,
  presetsFindingMessages,
  sortedInUnsortableMessage,
  staleMessage,
  underKeysMessage,
  unneededBlocksMessage,
  unreachedRolesMessage,
  unsortedMessage,
};
