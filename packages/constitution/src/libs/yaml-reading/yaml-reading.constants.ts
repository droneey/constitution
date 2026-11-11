// Why: the program reports what is wrong with a document itself, and its standard error has one
// writer, so the library writes no warning there; at `error` it still records every error.
const YAML_READ_OPTIONS = {
  // Stryker disable next-line StringLiteral: the library warns only at the debug and warn levels
  logLevel: 'error',
} as const;

export { YAML_READ_OPTIONS };
