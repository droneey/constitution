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
  blockNeededMessage,
  checkKeyMessage,
  configurationsUncheckedBecauseMessage,
  configurationsUncheckedMessage,
  inUnitMessage,
  LAST_CHOICE_SEPARATOR,
  memberUnparsedMessage,
  packagesKeyMessage,
  releaseLinkLoopsMessage,
  unknownKeyMessage,
  warningMessages,
} from './warning-text.messages';

const PACKAGES_KEY = 'packages';

const choicesText = (choices: readonly BlockId[]): string =>
  choices
    .map((choice, index) => {
      if (index === 0) {
        return choice;
      }

      return `${index === choices.length - 1 ? LAST_CHOICE_SEPARATOR : LIST_SEPARATOR}${choice}`;
    })
    .join('');

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
  [WarningKind.BlockNeeded]: ({ block, children = [], key, required, unit }) =>
    blockNeededMessage({
      block,
      key,
      offered: choicesText([
        required,
        ...children,
      ]),
      required,
      where: whereText(unit),
    }),
  [WarningKind.ConfigurationsUnchecked]: ({ reason }) =>
    reason === undefined
      ? configurationsUncheckedMessage()
      : configurationsUncheckedBecauseMessage(reason),
  [WarningKind.ReleaseLinkLoops]: ({ unit }) => releaseLinkLoopsMessage(unitText(unit)),
};

const warningTextOf = (warning: ProjectWarning): string =>
  textOf(warningTexts, warning.kind, warning.details);

export { warningTextOf };
