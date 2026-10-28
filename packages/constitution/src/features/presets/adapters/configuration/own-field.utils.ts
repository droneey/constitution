/** A map's own field under a key a file names, never one every object holds, such as toString. */
const ownFieldOf = <THeld>(map: Readonly<Record<string, THeld>>, key: string): THeld | undefined =>
  Object.hasOwn(map, key) ? map[key] : undefined;

export { ownFieldOf };
