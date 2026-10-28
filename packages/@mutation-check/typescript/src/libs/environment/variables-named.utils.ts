interface VariablesNamedInput {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly names: readonly string[];
}

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
