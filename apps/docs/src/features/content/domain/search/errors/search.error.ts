import { ProgramError } from '#/kernel/errors';

enum SearchFailure {
  IndexUnavailable = 'search-index-unavailable',
}

interface IndexUnavailableDetails {
  readonly address: string;
}

class SearchError extends ProgramError<SearchFailure, IndexUnavailableDetails> {
  public constructor(details: IndexUnavailableDetails, options?: ErrorOptions) {
    super(
      {
        code: SearchFailure.IndexUnavailable,
        details,
      },
      options,
    );
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'SearchError';
  }
}

export { SearchError, SearchFailure };
