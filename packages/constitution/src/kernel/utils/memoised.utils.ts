const memoised = <TInput, TValue>(
  read: (input: TInput) => TValue,
  keyOf: (input: TInput) => unknown = (input) => input,
): ((input: TInput) => TValue) => {
  const known = new Map<
    unknown,
    {
      readonly value: TValue;
    }
  >();

  return (input: TInput): TValue => {
    const key = keyOf(input);
    const held = known.get(key) ?? {
      value: read(input),
    };

    known.set(key, held);

    return held.value;
  };
};

export { memoised };
