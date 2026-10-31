const repeatsOf = (entries: readonly string[]): readonly string[] => [
  ...new Set(entries.filter((entry, index) => entries.indexOf(entry) !== index)),
];

export { repeatsOf };
