import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum ConfigurationFailure {
  DayMalformed = 'day-malformed',
}

interface ConfiguredValue {
  readonly variable: string;
  readonly written: string;
}

class ConfigurationError extends ProgramError<ConfigurationFailure, ConfiguredValue> {
  public constructor(input: ProgramErrorInput<ConfigurationFailure, ConfiguredValue>) {
    super(input);
    this.name = 'ConfigurationError';
  }
}

const isConfigurationError = (error: unknown): error is ConfigurationError =>
  error instanceof ConfigurationError;

export { ConfigurationError, ConfigurationFailure, isConfigurationError };
