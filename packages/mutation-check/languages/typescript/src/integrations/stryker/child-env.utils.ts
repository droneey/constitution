// What `bun test` needs of the environment Stryker runs with; no other variable reaches the specs.
const CHILD_VARIABLES = [
  'HOME',
  'PATH',
  'TMPDIR',
] as const;

interface ChildEnvInput {
  readonly environment: Readonly<Record<string, string | undefined>>;
  // the variables the runner sets for this run, such as the active mutant
  readonly own: Readonly<Record<string, string>>;
}

const childEnvOf = (input: ChildEnvInput): Readonly<Record<string, string>> => ({
  ...Object.fromEntries(
    CHILD_VARIABLES.flatMap((name) => {
      const setting = input.environment[name];

      return setting === undefined
        ? []
        : [
            [
              name,
              setting,
            ],
          ];
    }),
  ),
  ...input.own,
});

export { childEnvOf };
