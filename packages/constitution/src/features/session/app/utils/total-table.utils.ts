/**
 * Another party's names of a set of the program's values, as a Map from each name to its value; the
 * type checker refuses a table that leaves a value of TValue unnamed.
 */
const totalTableOf =
  <TValue extends string>() =>
  <TTable extends Readonly<Record<string, TValue>>>(
    table: TTable & (Exclude<TValue, TTable[keyof TTable]> extends never ? unknown : never),
  ): ReadonlyMap<string, TValue> =>
    new Map(Object.entries(table));

export { totalTableOf };
