import { ProgramError } from '#/kernel/errors';

import { malformedMessage, missingMessage, unparsableMessage } from './spec-settings.messages.ts';

enum SpecSettingsFailure {
  Missing = 'spec-settings-missing',
  Unparsable = 'spec-settings-unparsable',
  Malformed = 'spec-settings-malformed',
}

type SpecSettingsFailureDetails =
  | {
      readonly code: SpecSettingsFailure.Missing | SpecSettingsFailure.Unparsable;
      readonly fileName: string;
    }
  | {
      readonly code: SpecSettingsFailure.Malformed;
      readonly fileName: string;
      readonly problemPaths: readonly string[];
    };

const messageOf = (details: SpecSettingsFailureDetails): string => {
  switch (details.code) {
    case SpecSettingsFailure.Missing:
      return missingMessage(details.fileName);
    case SpecSettingsFailure.Unparsable:
      return unparsableMessage(details.fileName);
    case SpecSettingsFailure.Malformed:
      return malformedMessage(details);
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return details satisfies never;
  }
};

class SpecSettingsError extends ProgramError<SpecSettingsFailureDetails> {
  public constructor(details: SpecSettingsFailureDetails, options?: ErrorOptions) {
    super(messageOf(details), details, options);
  }
}

export { SpecSettingsError, SpecSettingsFailure };
