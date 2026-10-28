interface VariablesNamedInput {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly names: readonly string[];
}

/** The environment's variables of these names, each left out where the environment has none. */
const variablesNamed = (input: VariablesNamedInput): Readonly<Record<string, string>> =>
  Object.fromEntries(
    input.names.flatMap((name) => {
      const variable = input.environment[name];

      return variable === undefined
        ? []
        : [
            [
              name,
              variable,
            ],
          ];
    }),
  );

export { variablesNamed };
