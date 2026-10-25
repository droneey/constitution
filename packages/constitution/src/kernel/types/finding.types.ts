interface Finding {
  // The kind of finding, a stable kebab-case id like a linter's rule id; the message may be reworded.
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

/** a finding before the file it is reported at is known */
type Problem = Omit<Finding, 'path'>;

export type { Finding, Problem };
