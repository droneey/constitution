import type { RequiredConfigKey } from '#/kernel/constants';
import {
  CONFIG_FILE_NAME,
  ConfigKey,
  PATH_SEPARATOR,
  projectCheck,
  RELEASE_FOLDER_PATH,
} from '#/kernel/constants';
import type { WarningDetails } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';

import { LAYER_ARTICLE } from '../constants';
import type { TextsOf } from '../types';
import { LIST_SEPARATOR } from './list-separator.messages';

// What a file adds for a key it lacks, and writes in a key it leaves empty.
const ADD = {
  [ConfigKey.Axes]: 'axes: [architecture, workflow]',
  [ConfigKey.Domains]: 'domains: []',
  [ConfigKey.Platforms]: 'platforms: []',
  [ConfigKey.Languages]: 'languages: []',
  [ConfigKey.Implementations]: 'implementations: []',
  [ConfigKey.Packs]: 'packs: []',
  [ConfigKey.Overrides]: 'overrides: []',
} as const satisfies Readonly<Record<RequiredConfigKey, string>>;
const FILL = {
  [ConfigKey.Axes]: 'write axes: [architecture, workflow], or axes: [] for neither',
  [ConfigKey.Domains]: 'write domains: []',
  [ConfigKey.Platforms]: 'write platforms: []',
  [ConfigKey.Languages]: 'write languages: []',
  [ConfigKey.Implementations]: 'write implementations: []',
  [ConfigKey.Packs]: 'write packs: []',
  [ConfigKey.Overrides]: 'write overrides: []',
} as const satisfies Readonly<Record<RequiredConfigKey, string>>;

// The kinds whose wording a choice of the warning's text decides on.
type ChosenKind =
  | WarningKind.MemberConfigUnparsed
  | WarningKind.KeyUnknown
  | WarningKind.AbstractListed
  | WarningKind.BlockNeeded
  | WarningKind.RequirementNotMet
  | WarningKind.ConfigurationsUnchecked
  | WarningKind.ReleaseLinkLoops;

/** The text of each warning that names its details as they are. */
const warningMessages: Omit<TextsOf<WarningDetails>, ChosenKind> = {
  [WarningKind.MemberWithoutConfig]: ({ member }) =>
    `${member} is a member of the workspace with no ${CONFIG_FILE_NAME} — write one that lists the blocks it follows`,
  [WarningKind.MemberConfigUnreadable]: ({ member }) =>
    `cannot read ${member}${PATH_SEPARATOR}${CONFIG_FILE_NAME} — make it readable, as its blocks are left out`,
  [WarningKind.KeyMissing]: ({ file, key }) => `${file} has no ${key} key — add ${ADD[key]}`,
  [WarningKind.KeyEmpty]: ({ file, key }) => `${file} leaves ${key} empty — ${FILL[key]}`,
  [WarningKind.FoundationListed]: ({ file }) =>
    `${file} lists foundation in axes — foundation is always followed, remove it`,
  [WarningKind.AxisUnknown]: ({ axis }) => `axes names ${axis} — write architecture or workflow`,
  [WarningKind.OverrideIncomplete]: ({ line, missing }) =>
    `the override on line ${line} has no ${missing.join(LIST_SEPARATOR)} — complete it or remove it`,
  [WarningKind.OverrideLevelNotLowered]: ({ level, rule }) =>
    `the override of ${rule} sets the level ${level} — write SHOULD or MAY`,
  [WarningKind.OverrideUntilMalformed]: ({ rule, until }) =>
    `the override of ${rule} has until ${until} — write a date as YYYY-MM-DD`,
  [WarningKind.NameIsPath]: ({ name }) =>
    `${name} is a path — put the block in a pack listed under packs: and name it by its id`,
  [WarningKind.NameUnknown]: ({ name }) => `${name} is not a block — check the name`,
  [WarningKind.CoreListed]: ({ key }) => `core is always active — remove it from ${key}`,
  [WarningKind.BlockUnderWrongKey]: ({ key, layer, name, toKey }) =>
    `${name} is ${LAYER_ARTICLE[layer]} ${layer} — move it from ${key} to ${toKey}`,
  [WarningKind.PackUnlisted]: ({ file, name, pack }) =>
    `${name} comes from ${pack}, which ${file} does not list — add it to packs`,
  [WarningKind.PackNotInstalled]: ({ where }) =>
    `${where} is not installed — run mise install, or check the path`,
  [WarningKind.FileUnreadable]: ({ file }) => `${file} cannot be read — its rules are left out`,
  [WarningKind.RuleRepeated]: ({ file, rule }) =>
    `${file} repeats the rule ${rule} — the first is used`,
  [WarningKind.FrontMatterMissing]: ({ file }) =>
    `${file} has no front matter — the block is read without it`,
  [WarningKind.NotBlockFile]: ({ file }) => `${file} is not a block file — move or remove it`,
  [WarningKind.BlockRepeated]: ({ block, file }) =>
    `${file} repeats the block ${block} — the one read first is used`,
  [WarningKind.OutsideBlockFolder]: ({ file }) =>
    `${file} is not inside a block folder of a domain, a context or an implementation`,
  [WarningKind.FolderMisnamed]: ({ file }) =>
    `${file} is in a block folder whose name is not a kebab-case block id — rename the folder`,
  [WarningKind.BaseNoBlock]: ({ base, block }) =>
    `${block} extends ${base}, which is not a block — fix its front matter`,
  [WarningKind.BaseConcrete]: ({ base, block }) =>
    `${block} extends ${base}, a concrete block; a block extends only an abstract base — require it instead`,
  [WarningKind.RequiredNoBlock]: ({ block, required }) =>
    `${block} requires ${required}, which is not a block — fix its front matter`,
  [WarningKind.TightensUnknownRule]: ({ rule, tightens }) =>
    `${rule} → ${tightens}: ${tightens} is an unknown rule — check the slug`,
  [WarningKind.OverrideNamesNoRule]: ({ rule }) => `${rule} names no rule — check the slug`,
  [WarningKind.OverrideExpired]: ({ rule, until }) =>
    `${rule} expired on ${until} — renew or remove it`,
  [WarningKind.ConfigurationFinding]: ({ code, file, says }) => `${file}: ${says} [${code}]`,
  [WarningKind.NoRepository]: () =>
    'the project lies in no git repository, so no gate holds the hand-back — run git init to have one',
};

interface MemberUnparsedInput {
  /** " at line …" for the lines the file fails at, or nothing */
  readonly atLines: string;
  readonly member: string;
}

const memberUnparsedMessage = ({ atLines, member }: MemberUnparsedInput): string =>
  `${member}${PATH_SEPARATOR}${CONFIG_FILE_NAME} does not parse${atLines} — fix it, as its blocks are left out`;

const packagesKeyMessage = (file: string): string =>
  `${file} lists packages — write each package's blocks in a constitution.yaml of its own, and remove the key`;

const checkKeyMessage = (file: string): string =>
  `${file} names a check, which the runner blocks give now — remove it, and run ${projectCheck}`;

const unknownKeyMessage = ({ file, key }: WarningDetails[WarningKind.KeyUnknown]): string =>
  `${file} has the unknown key ${key} — remove it`;

interface AbstractListedInput {
  /** the heirs offered in its place, as a list words them */
  readonly heirs: string;
  readonly name: string;
}

const abstractListedMessage = ({ heirs, name }: AbstractListedInput): string =>
  `${name} cannot be listed — list ${heirs}`;

/** The heirs an abstract block's warning offers when it names none. */
const UNNAMED_HEIRS = 'one of its heirs';
/** The word before the last heir of a list. */
const LAST_HEIR_SEPARATOR = ' or ';

const inUnitMessage = (unit: string): string => ` in ${unit}`;

interface BlockNeededInput {
  readonly block: string;
  readonly key: string;
  /** the block, or the heirs of an abstract one, to add */
  readonly offered: string;
  readonly required: string;
  /** where it holds, as {@link inUnitMessage} words it, or nothing for the repository */
  readonly where: string;
}

const blockNeededMessage = (input: BlockNeededInput): string =>
  `${input.block}${input.where} needs ${input.required} — add ${input.offered} to ${input.key}`;

interface RequirementNotMetInput {
  readonly block: string;
  readonly requirement: string;
  readonly where: string;
}

const requirementNotMetMessage = (input: RequirementNotMetInput): string =>
  `${input.block}${input.where} does not meet ${input.requirement} — see its Requirements table`;

const configurationsUncheckedMessage = (): string => 'cannot check the configurations';

const configurationsUncheckedBecauseMessage = (reason: string): string =>
  `cannot check the configurations: ${reason}`;

const releaseLinkLoopsMessage = (unit: string): string =>
  `${unit}${PATH_SEPARATOR}${RELEASE_FOLDER_PATH} leads back into a folder that holds it — link it to the release outside the unit`;

export {
  abstractListedMessage,
  blockNeededMessage,
  checkKeyMessage,
  configurationsUncheckedBecauseMessage,
  configurationsUncheckedMessage,
  inUnitMessage,
  LAST_HEIR_SEPARATOR,
  memberUnparsedMessage,
  packagesKeyMessage,
  releaseLinkLoopsMessage,
  requirementNotMetMessage,
  UNNAMED_HEIRS,
  unknownKeyMessage,
  warningMessages,
};
