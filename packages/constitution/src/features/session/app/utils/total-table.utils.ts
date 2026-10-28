const totalTableOf =
  <TValue extends string>() =>
  <TTable extends Readonly<Record<string, TValue>>>(
    table: TTable & (Exclude<TValue, TTable[keyof TTable]> extends never ? unknown : never),
  ): ReadonlyMap<string, TValue> =>
    new Map(Object.entries(table));

export { totalTableOf };
