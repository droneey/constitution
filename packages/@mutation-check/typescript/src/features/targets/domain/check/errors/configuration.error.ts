import { ProgramError } from '#/kernel/errors';

import {
  missingMessage,
  mutateMalformedMessage,
  unreadableMessage,
} from './configuration.messages.ts';

enum ConfigurationFailure {
  Missing = 'configuration-missing',
  Unreadable = 'configuration-unreadable',
  MutateMalformed = 'mutate-malformed',
}

type ConfigurationFailureDetails =
  | {
      readonly code: ConfigurationFailure.Missing;
      readonly fileNames: readonly string[];
    }
  | {
      readonly code: ConfigurationFailure.Unreadable;
      readonly fileName: string;
    }
  | {
      readonly code: ConfigurationFailure.MutateMalformed;
      readonly fileName: string;
      readonly problemPaths: readonly string[];
    };

const messageOf = (details: ConfigurationFailureDetails): string => {
  switch (details.code) {
    case ConfigurationFailure.Missing:
      return missingMessage(details.fileNames);
    case ConfigurationFailure.Unreadable:
      return unreadableMessage(details.fileName);
    case ConfigurationFailure.MutateMalformed:
      return mutateMalformedMessage(details);
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return details satisfies never;
  }
};

class ConfigurationError extends ProgramError<ConfigurationFailureDetails> {
  public constructor(details: ConfigurationFailureDetails, options?: ErrorOptions) {
    super(messageOf(details), details, options);
  }
}

export { ConfigurationError, ConfigurationFailure };
