import { CHECK_KEY } from '#/kernel/constants';
import type { ProjectWarning, WarningDetails } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';
import { UnitPath } from '#/kernel/value-objects';

import type { TextsOf } from '../types';
import { atLinesText } from './at-lines-text.utils';
import { LIST_SEPARATOR } from './list-separator.messages';
import { textOf } from './texts.utils';
import { unitText } from './unit-text.utils';
import {
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
} from './warning-text.messages';

const PACKAGES_KEY = 'packages';

/** The heirs a warning offers in place of an abstract block: "a, b or c", or one of them unnamed. */
const heirsText = (heirs: readonly BlockId[]): string =>
  heirs.length === 0
    ? UNNAMED_HEIRS
    : heirs
        .map((heir, index) => {
          if (index === 0) {
            return heir;
          }

          return `${index === heirs.length - 1 ? LAST_HEIR_SEPARATOR : LIST_SEPARATOR}${heir}`;
        })
        .join('');

/** Where a warning holds: in a member, or nothing for the repository. */
const whereText = (unit: UnitPath): string =>
  UnitPath.isRepository(unit) ? '' : inUnitMessage(unit);

const unknownKeyText = (details: WarningDetails[WarningKind.KeyUnknown]): string => {
  if (details.key === PACKAGES_KEY) {
    return packagesKeyMessage(details.file);
  }

  return details.key === CHECK_KEY ? checkKeyMessage(details.file) : unknownKeyMessage(details);
};

const warningTexts: TextsOf<WarningDetails> = {
  ...warningMessages,
  [WarningKind.MemberConfigUnparsed]: ({ lines, member }) =>
    memberUnparsedMessage({
      atLines: atLinesText(lines),
      member,
    }),
  [WarningKind.KeyUnknown]: unknownKeyText,
  [WarningKind.AbstractListed]: ({ heirs, name }) =>
    abstractListedMessage({
      heirs: heirsText(heirs),
      name,
    }),
  [WarningKind.BlockNeeded]: ({ block, heirs, key, required, unit }) =>
    blockNeededMessage({
      block,
      key,
      offered: heirs === undefined ? required : heirsText(heirs),
      required,
      where: whereText(unit),
    }),
  [WarningKind.RequirementNotMet]: ({ block, requirement, unit }) =>
    requirementNotMetMessage({
      block,
      requirement,
      where: whereText(unit),
    }),
  [WarningKind.ConfigurationsUnchecked]: ({ reason }) =>
    reason === undefined
      ? configurationsUncheckedMessage()
      : configurationsUncheckedBecauseMessage(reason),
  [WarningKind.ReleaseLinkLoops]: ({ unit }) => releaseLinkLoopsMessage(unitText(unit)),
};

/** What a warning of a project says, as every report of warnings words it. */
const warningTextOf = (warning: ProjectWarning): string =>
  textOf(warningTexts, warning.kind, warning.details);

export { warningTextOf };
