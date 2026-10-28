// Why: a key a file names may be a field every object holds, such as toString.
const ownFieldOf = <THeld>(map: Readonly<Record<string, THeld>>, key: string): THeld | undefined =>
  Object.hasOwn(map, key) ? map[key] : undefined;

export { ownFieldOf };
