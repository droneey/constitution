interface Issue {
  readonly path: readonly PropertyKey[];
}

/** `fetch` rejects with a `TypeError` when the network fails, and the timeout's signal with a `TimeoutError` */
const isUnreachable = (error: unknown): boolean =>
  error instanceof TypeError || (error instanceof DOMException && error.name === 'TimeoutError');

/** the body's read rejects with a `SyntaxError` when it holds no JSON */
const isNoJson = (error: unknown): error is SyntaxError => error instanceof SyntaxError;

const problemPathsOf = (issues: readonly Issue[]): readonly string[] =>
  issues.map((issue) => issue.path.map(String).join('.'));

export { isNoJson, isUnreachable, problemPathsOf };
