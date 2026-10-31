import type { UnitRelativePath } from '#/kernel/value-objects';

interface UnitSpecs {
  readonly specPaths: readonly UnitRelativePath[];
  // Why: the nearest spec first, since a spec that imports a file directly kills its mutants
  // soonest.
  readonly specPathsByFilePath: ReadonlyMap<UnitRelativePath, readonly UnitRelativePath[]>;
}

type ImportEdges = ReadonlyMap<UnitRelativePath, readonly UnitRelativePath[]>;

interface UnitSpecsInput {
  // Why: each file the specs reach, with the files it imports directly.
  readonly edges: ImportEdges;
  readonly specPaths: readonly UnitRelativePath[];
}

interface LoadingSpec {
  readonly depth: number;
  readonly specPath: UnitRelativePath;
}

const importDepthsOf = (input: {
  edges: ImportEdges;
  filePath: UnitRelativePath;
}): ReadonlyMap<UnitRelativePath, number> => {
  const importDepths = new Map<UnitRelativePath, number>();
  let layer: readonly UnitRelativePath[] = [
    input.filePath,
  ];

  for (let depth = 1; layer.length > 0; depth += 1) {
    const next: UnitRelativePath[] = [];

    for (const filePath of layer) {
      for (const importedPath of input.edges.get(filePath) ?? []) {
        if (!importDepths.has(importedPath)) {
          importDepths.set(importedPath, depth);
          next.push(importedPath);
        }
      }
    }

    layer = next;
  }

  return importDepths;
};

const create = (input: UnitSpecsInput): UnitSpecs => {
  const loadingSpecs = new Map<UnitRelativePath, LoadingSpec[]>();

  for (const specPath of input.specPaths) {
    for (const [filePath, depth] of importDepthsOf({
      edges: input.edges,
      filePath: specPath,
    })) {
      loadingSpecs.set(filePath, [
        ...(loadingSpecs.get(filePath) ?? []),
        {
          depth,
          specPath,
        },
      ]);
    }
  }

  return {
    specPaths: input.specPaths,
    specPathsByFilePath: new Map(
      [
        ...loadingSpecs,
      ].map(([filePath, fileLoadingSpecs]) => [
        filePath,
        fileLoadingSpecs
          .toSorted((left, right) => left.depth - right.depth)
          .map(({ specPath }) => specPath),
      ]),
    ),
  };
};

// Why: no file named means every spec of the unit.
const specPathsFor = (
  unitSpecs: UnitSpecs,
  filePaths?: readonly UnitRelativePath[],
): readonly UnitRelativePath[] =>
  filePaths === undefined
    ? unitSpecs.specPaths
    : [
        ...new Set(
          filePaths.flatMap((filePath) => unitSpecs.specPathsByFilePath.get(filePath) ?? []),
        ),
      ];

const UnitSpecs = {
  create,
  specPathsFor,
} as const;

export type { ImportEdges };
export { UnitSpecs };
