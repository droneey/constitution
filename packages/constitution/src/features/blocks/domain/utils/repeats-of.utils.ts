/** The entries a list holds more than once, each once, in the order they first repeat. */
const repeatsOf = (entries: readonly string[]): readonly string[] => [
  ...new Set(entries.filter((entry, index) => entries.indexOf(entry) !== index)),
];

export { repeatsOf };
