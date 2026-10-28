type Entries<TInput> = readonly (readonly [
  string,
  TInput,
])[];

interface BatchSource<TInput, TOutcome> {
  readonly keyOf: (input: TInput) => string;
  readonly runAll: (entries: Entries<TInput>) => Promise<ReadonlyMap<string, TOutcome>>;
}

interface Batch<TInput, TOutcome> {
  /** @throws Error when no table registered the input, or before the batch is run. */
  readonly outcomeOf: (input: TInput) => TOutcome;
  readonly register: <TRow extends TInput>(row: TRow) => TRow;
  readonly runRegistered: () => Promise<void>;
}

// The tables of a spec file register their inputs while the file is collected, and one run takes
// them all before the first case: a spec file makes its own batch, so no state outlives it.
const createBatch = <TInput, TOutcome>(
  source: BatchSource<TInput, TOutcome>,
): Batch<TInput, TOutcome> => {
  const registered = new Map<string, TInput>();
  let outcomes: ReadonlyMap<string, TOutcome> = new Map();

  const register = <TRow extends TInput>(row: TRow): TRow => {
    registered.set(source.keyOf(row), row);

    return row;
  };

  const outcomeOf = (input: TInput): TOutcome => {
    const key = source.keyOf(input);
    const outcome = outcomes.get(key);

    if (outcome === undefined) {
      throw new Error(`No table registered ${key}`);
    }

    return outcome;
  };

  const runRegistered = async (): Promise<void> => {
    outcomes = await source.runAll([
      ...registered,
    ]);
  };

  return {
    outcomeOf,
    register,
    runRegistered,
  };
};

export { createBatch };
