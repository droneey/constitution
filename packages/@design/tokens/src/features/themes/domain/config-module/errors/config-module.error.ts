import {
  exportsNoFunctionMessage,
  notFoundMessage,
  outsideWorkingFolderMessage,
  returnsNoObjectMessage,
} from './config-module.messages';

enum ConfigModuleFailure {
  NotFound = 'config-not-found',
  OutsideWorkingFolder = 'config-outside-working-folder',
  ExportsNoFunction = 'config-exports-no-function',
  ReturnsNoObject = 'config-returns-no-object',
}

type ConfigModuleFailureDetails =
  | {
      readonly code:
        | ConfigModuleFailure.NotFound
        | ConfigModuleFailure.OutsideWorkingFolder
        | ConfigModuleFailure.ExportsNoFunction;
      readonly configPath: string;
    }
  | {
      readonly code: ConfigModuleFailure.ReturnsNoObject;
      readonly modeName: string;
    };

const messageOf = (details: ConfigModuleFailureDetails): string => {
  switch (details.code) {
    case ConfigModuleFailure.NotFound:
      return notFoundMessage(details.configPath);
    case ConfigModuleFailure.OutsideWorkingFolder:
      return outsideWorkingFolderMessage(details.configPath);
    case ConfigModuleFailure.ExportsNoFunction:
      return exportsNoFunctionMessage(details.configPath);
    case ConfigModuleFailure.ReturnsNoObject:
      return returnsNoObjectMessage(details.modeName);
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return details satisfies never;
  }
};

class ConfigModuleError extends Error {
  public readonly code: ConfigModuleFailure;
  public readonly details: ConfigModuleFailureDetails;

  public constructor(details: ConfigModuleFailureDetails, options?: ErrorOptions) {
    super(messageOf(details), options);
    this.code = details.code;
    this.details = details;
  }
}

export { ConfigModuleError, ConfigModuleFailure };
