import type { Axis } from '#/kernel/constants';
import { Layer } from '#/kernel/constants';
import type { AbsolutePath, BlockId, PackPath, UnitPath } from '#/kernel/value-objects';
import { LIST_SEPARATOR } from '#/shared/cli';

import type { DigestRelease } from '../../domain/entities';
import type { CountedText } from './counted-text.utils';

type ListedLayer = Exclude<Layer, Layer.Core>;

const releaseMessage = (release: DigestRelease): string =>
  `The Droneey Constitution ${release.version} supplies this repository's rules. Block files live under ${release.folderPath}.`;

const unparsedMessage = (atLines: string): string =>
  `constitution.yaml does not parse${atLines}; only core applies.`;

const dutyLines = (): readonly string[] => [
  'Before an action, the hook names the rules that govern it and refuses the action until you have read them whole with Read.',
  'What you read is remembered, so only new or changed rules are asked for again.',
  'Code you read leaves a debt: the turn cannot end until you have read the rules that govern it.',
];

const doctorNoticeMessage = (releaseFolderPath: AbsolutePath): string =>
  `The Droneey Constitution gives no rules here: ${releaseFolderPath} is missing or holds a release this executable cannot read. Tell the user to run constitution doctor.`;

const MAP_HEADING = '## Active blocks';

const LAYER_TITLES = {
  [Layer.Domain]: 'Domains',
  [Layer.Platform]: 'Platforms',
  [Layer.Language]: 'Languages',
  [Layer.Implementation]: 'Implementations',
} as const satisfies Readonly<Record<ListedLayer, string>>;

const PACKS_TITLE = 'Packs';

interface MapLineInput {
  readonly names: readonly string[];
  readonly title: string;
}

const mapLineMessage = (input: MapLineInput): string =>
  `- ${input.title}: ${input.names.join(LIST_SEPARATOR)}`;

interface PackedNameInput {
  readonly id: BlockId;
  readonly pack: PackPath;
}

const packedNameMessage = (input: PackedNameInput): string => `${input.id} [${input.pack}]`;

const leftOutAxisMessage = (axis: Axis): string => `the ${axis} axis`;

const addsMessage = (names: readonly string[]): string => `adds ${names.join(LIST_SEPARATOR)}`;

const leavesOutMessage = (names: readonly string[]): string =>
  `leaves out ${names.join(LIST_SEPARATOR)}`;

interface MemberLineInput {
  readonly changes: readonly string[];
  readonly unit: UnitPath;
}

const memberLineMessage = (input: MemberLineInput): string =>
  `- ${input.unit}: ${input.changes.join('; ')}`;

const mapLinesCutText: CountedText = {
  many: (count) =>
    `${count} more lines of the map did not fit; constitution.yaml names every block.`,
  one: '1 more line of the map did not fit; constitution.yaml names every block.',
};

const WARNINGS_HEADING = '⚠️ Warnings';

const STARTUP_WARNINGS_HEADING = '⚠️ Warnings — tell the user at the start of the session';

interface WarningLineInput {
  readonly code: string;
  readonly text: string;
}

const warningLineMessage = (input: WarningLineInput): string => `- ${input.code}: ${input.text}`;

const moreWarningsText: CountedText = {
  many: (count) => `and ${count} more`,
  one: 'and 1 more',
};

export type { ListedLayer };
export {
  addsMessage,
  doctorNoticeMessage,
  dutyLines,
  LAYER_TITLES,
  leavesOutMessage,
  leftOutAxisMessage,
  MAP_HEADING,
  mapLineMessage,
  mapLinesCutText,
  memberLineMessage,
  moreWarningsText,
  PACKS_TITLE,
  packedNameMessage,
  releaseMessage,
  STARTUP_WARNINGS_HEADING,
  unparsedMessage,
  WARNINGS_HEADING,
  warningLineMessage,
};
