enum ConfigurationFailure {
  Missing = 'configuration-missing',
  MutateMalformed = 'mutate-malformed',
}

interface ConfigurationFailureDetails {
  // the files looked for, or the one read
  readonly files: readonly string[];
}

class ConfigurationError extends Error {
  public readonly code: ConfigurationFailure;
  public readonly details: ConfigurationFailureDetails;

  public constructor(input: {
    code: ConfigurationFailure;
    details: ConfigurationFailureDetails;
  }) {
    const files = input.details.files.join(', ');

    super(
      input.code === ConfigurationFailure.Missing
        ? `no Stryker configuration (${files}); write one`
        : `${files} names no list of patterns as its mutate; name the files to mutate`,
    );
    this.name = 'ConfigurationError';
    this.code = input.code;
    this.details = input.details;
  }
}

export { ConfigurationError, ConfigurationFailure };
