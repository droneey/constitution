import { CHECK_KEY, CONFIG_FILE, RELEASE_FOLDER } from '#/kernel/constants';
import type { ProjectWarning, WarningDetails, WiringProblem } from '#/kernel/entities';
import { WarningKind, WiringProblemKind } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';
import { UnitPath } from '#/kernel/value-objects';

import { LAYER_ARTICLE } from '../constants';
import type { TextsOf } from '../types';
import { textOf } from './texts.utils';
import { unitText } from './unit-text.utils';

const RATIFY = ' — run /constitution:ratify';
const PACKAGES_KEY = 'packages';
const SHOWN = 3;
const ADD: Readonly<Record<string, string>> = {
  axes: 'axes: [architecture, workflow]',
  check: 'check: <the command that runs every check, or null>',
  overrides: 'overrides: []',
  packs: 'packs: []',
} as const;
const FILL: Readonly<Record<string, string>> = {
  axes: 'write axes: [architecture, workflow], or axes: [] for neither',
  check: 'name the command that runs every check, or write check: null',
  overrides: 'write overrides: []',
  packs: 'write packs: []',
} as const;

/** The heirs a warning offers in place of an abstract block: "a, b or c", or one of them unnamed. */
const heirsText = (heirs: readonly BlockId[]): string =>
  heirs.length === 0
    ? 'one of its heirs'
    : heirs
        .map((heir, index) => {
          if (index === 0) {
            return heir;
          }

          return `${index === heirs.length - 1 ? ' or ' : ', '}${heir}`;
        })
        .join('');

/** " in <unit>" for a member, as a warning names where it holds; nothing for the repository. */
const whereText = (unit: UnitPath): string => (UnitPath.isRepository(unit) ? '' : ` in ${unit}`);

/** " at line <n>" where the parser says where it stopped; nothing where it does not. */
const atLineText = (line: number | undefined): string =>
  line === undefined ? '' : ` at line ${String(line)}`;

const partsText = (parts: readonly string[]): string =>
  `${parts.slice(0, SHOWN).join(', ')}${parts.length > SHOWN ? ` and ${parts.length - SHOWN} more` : ''}`;

const problemTexts: {
  readonly [TKind in WiringProblemKind]: (problem: WiringProblem<TKind>) => string;
} = {
  [WiringProblemKind.Lacks]: ({ parts }) => `lacks ${partsText(parts)}`,
  [WiringProblemKind.NamesBeyond]: ({ parts }) =>
    `names ${partsText(parts)}, which it does not take`,
  [WiringProblemKind.MarkerSaysMore]: ({ tool }) => `a marker of ${tool} says more than its path`,
  [WiringProblemKind.CopyOfRemovedPart]: ({ part }) =>
    `holds a copy of ${part} the release no longer has`,
  [WiringProblemKind.CopyNotTaken]: ({ part }) => `copies ${part}, which it does not take`,
  [WiringProblemKind.CopyWithoutEnd]: ({ part }) => `the copy of ${part} has no end line`,
  [WiringProblemKind.CopyEdited]: ({ part }) => `the copy of ${part} is edited inside`,
  [WiringProblemKind.MarkerOutOfOrder]: ({ tool }) =>
    `its marker of ${tool} lists the links out of order`,
  [WiringProblemKind.ExtendsShortOfEnd]: ({ tool }) =>
    `it extends a link of ${tool} short of the chain's end`,
};

const problemTextOf = <TKind extends WiringProblemKind>(problem: WiringProblem<TKind>): string =>
  problemTexts[problem.kind](problem);

const unknownKeyText = ({ file, key }: WarningDetails[WarningKind.KeyUnknown]): string => {
  if (key === PACKAGES_KEY) {
    return `${file} lists packages — write each package's blocks in a constitution.yaml of its own, and remove the key`;
  }

  // the repository's check is known, so a check that reaches here is a member's
  return key === CHECK_KEY
    ? `${file} names a check, which only the repository's ${CONFIG_FILE} names — remove it`
    : `${file} has the unknown key ${key} — remove it`;
};

const warningTexts: TextsOf<WarningDetails> = {
  [WarningKind.MemberWithoutConfig]: ({ member }) =>
    `${member} is a member of the workspace with no ${CONFIG_FILE} — write one that lists the blocks it follows`,
  [WarningKind.MemberConfigUnparsed]: ({ line, member }) =>
    `${member}/${CONFIG_FILE} does not parse${atLineText(line)} — fix it, as its blocks are left out`,
  [WarningKind.MemberConfigUnreadable]: ({ member }) =>
    `cannot read ${member}/${CONFIG_FILE} — make it readable, as its blocks are left out`,
  [WarningKind.KeyMissing]: ({ file, key }) =>
    `${file} has no ${key} key — add ${ADD[key] ?? `${key}: []`}`,
  [WarningKind.KeyUnknown]: unknownKeyText,
  [WarningKind.KeyEmpty]: ({ file, key }) =>
    `${file} leaves ${key} empty — ${FILL[key] ?? `write ${key}: []`}`,
  [WarningKind.FoundationListed]: ({ file }) =>
    `${file} lists foundation in axes — foundation is always followed, remove it`,
  [WarningKind.AxisUnknown]: ({ axis }) => `axes names ${axis} — write architecture or workflow`,
  [WarningKind.OverrideIncomplete]: ({ line, missing }) =>
    `the override on line ${line} has no ${missing.join(', ')} — complete it or remove it`,
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
  [WarningKind.AbstractListed]: ({ heirs, name }) =>
    `${name} cannot be listed — list ${heirsText(heirs)}`,
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
  [WarningKind.BlockNeeded]: ({ block, heirs, key, required, unit }) =>
    `${block}${whereText(unit)} needs ${required} — add ${heirs === undefined ? required : heirsText(heirs)} to ${key}`,
  [WarningKind.RequirementNotMet]: ({ block, requirement, unit }) =>
    `${block}${whereText(unit)} does not meet ${requirement} — see its Requirements table`,
  [WarningKind.OverrideNamesNoRule]: ({ rule }) => `${rule} names no rule — check the slug`,
  [WarningKind.OverrideExpired]: ({ rule, until }) =>
    `${rule} expired on ${until} — renew or remove it`,
  [WarningKind.FolderKeepsConfig]: ({ folder, path }) =>
    `${folder} keeps its own ${path} — declare the folder a member, with a ${CONFIG_FILE} of its own`,
  [WarningKind.ToolWiredNowhere]: ({ tool, unit }) =>
    `${tool} is wired nowhere for ${unitText(unit)}${RATIFY}`,
  [WarningKind.FileMiswired]: ({ file, problems }) =>
    `${file} ${problems.map(problemTextOf).join('; ')}${RATIFY}`,
  [WarningKind.WiringFileUnreadable]: ({ file }) =>
    `${file} cannot be read, so the wiring it holds is left unchecked — make it readable`,
  [WarningKind.SkipOfNoMember]: ({ folder, path }) =>
    `${path} skips ${folder}, which holds no member of the workspace${RATIFY}`,
  [WarningKind.MemberNotSkipped]: ({ member, path, tool }) =>
    `${path} does not skip ${member}, a member of the workspace that ${tool} would reach into from the root${RATIFY}`,
  [WarningKind.WiringUnchecked]: () => 'cannot check the wiring',
  [WarningKind.ReleaseLinkLoops]: ({ unit }) =>
    `${unitText(unit)}/${RELEASE_FOLDER} leads back into a folder that holds it — link it to the release outside the unit`,
};

/** What a warning of a project says, as every report of warnings words it. */
const warningTextOf = (warning: ProjectWarning): string =>
  textOf(warningTexts, warning.kind, warning.details);

export { warningTextOf };
