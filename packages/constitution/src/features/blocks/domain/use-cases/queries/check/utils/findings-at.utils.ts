const findingsAt = <TProblem extends object>(
  path: string,
  problems: readonly (TProblem | undefined)[],
): readonly (TProblem & {
  readonly path: string;
})[] =>
  problems.flatMap((problem) =>
    problem === undefined
      ? []
      : [
          {
            ...problem,
            path,
          },
        ],
  );

export { findingsAt };
