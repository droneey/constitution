const firstBy = <TEntry, TKey>(
  entries: readonly TEntry[],
  keyOf: (entry: TEntry) => TKey,
): ReadonlyMap<TKey, TEntry> => {
  const firsts = new Map<TKey, TEntry>();

  for (const entry of entries) {
    const key = keyOf(entry);

    if (!firsts.has(key)) {
      firsts.set(key, entry);
    }
  }

  return firsts;
};

export { firstBy };
