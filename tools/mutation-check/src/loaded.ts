interface Graph {
  importsOf: (path: string) => readonly string[];
}

// Each file the path loads, directly or through others, with the number of imports between them.
const loadedBy = (
  input: Graph & {
    path: string;
  },
): ReadonlyMap<string, number> => {
  const depths = new Map<string, number>();
  let layer: readonly string[] = [
    input.path,
  ];

  for (let depth = 1; layer.length > 0; depth += 1) {
    const next: string[] = [];

    for (const path of layer) {
      for (const target of input.importsOf(path)) {
        if (!depths.has(target)) {
          depths.set(target, depth);
          next.push(target);
        }
      }
    }

    layer = next;
  }

  return depths;
};

// The specs that load each file, the nearest first: a spec importing it directly kills its mutants soonest.
const specsByFile = (
  input: Graph & {
    specs: readonly string[];
  },
): ReadonlyMap<string, readonly string[]> => {
  const loaders = new Map<
    string,
    {
      depth: number;
      spec: string;
    }[]
  >();

  for (const spec of input.specs) {
    for (const [path, depth] of loadedBy({
      importsOf: input.importsOf,
      path: spec,
    })) {
      loaders.set(path, [
        ...(loaders.get(path) ?? []),
        {
          depth,
          spec,
        },
      ]);
    }
  }

  return new Map(
    [
      ...loaders,
    ].map(([path, specs]) => [
      path,
      specs.toSorted((left, right) => left.depth - right.depth).map(({ spec }) => spec),
    ]),
  );
};

export { loadedBy, specsByFile };
